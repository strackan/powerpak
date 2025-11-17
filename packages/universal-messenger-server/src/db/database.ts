import initSqlJs, { Database } from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Message, Conversation, Platform, PlatformStatus } from '@mcp-world/shared-types';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Database manager using sql.js for cross-platform compatibility
 */
export class DatabaseManager {
  private db: Database | null = null;
  private dbPath: string;
  private initialized = false;

  constructor(dbPath?: string) {
    // Default to user's home directory or current directory
    this.dbPath = dbPath || join(process.cwd(), 'messenger.db');
  }

  /**
   * Initialize the database
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const SQL = await initSqlJs();

      // Load existing database or create new one
      if (existsSync(this.dbPath)) {
        console.error(`Loading existing database from ${this.dbPath}`);
        const buffer = readFileSync(this.dbPath);
        this.db = new SQL.Database(buffer);
      } else {
        console.error(`Creating new database at ${this.dbPath}`);
        this.db = new SQL.Database();
        await this.createSchema();
      }

      this.initialized = true;
      console.error('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  /**
   * Create database schema
   */
  private async createSchema(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Embed schema directly to avoid file reading issues
    const schema = `
-- Messages table - stores all messages from all platforms
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  sender_phone TEXT,
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  thread_id TEXT,
  metadata TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_platform ON messages(platform);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);

-- Conversations table - tracks all conversations across platforms
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  name TEXT NOT NULL,
  last_message_at INTEGER NOT NULL,
  unread_count INTEGER DEFAULT 0,
  metadata TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Index for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_platform ON conversations(platform);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Platform configurations - tracks status of each platform
CREATE TABLE IF NOT EXISTS platform_configs (
  platform TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 1,
  credentials_valid INTEGER NOT NULL DEFAULT 0,
  last_sync INTEGER,
  error_message TEXT,
  metadata TEXT
);

-- Insert default platform configs
INSERT OR IGNORE INTO platform_configs (platform, enabled, credentials_valid) VALUES
  ('slack', 1, 0),
  ('teams', 1, 0),
  ('whatsapp', 1, 0),
  ('sms', 1, 0),
  ('google_chat', 1, 0);
    `;

    this.db.exec(schema);
  }

  /**
   * Save database to disk
   */
  saveToDisk(): void {
    if (!this.db) throw new Error('Database not initialized');

    const data = this.db.export();
    writeFileSync(this.dbPath, data);
  }

  /**
   * Save a message to the database
   */
  async saveMessage(message: Message): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO messages (
        id, platform, conversation_id, sender_id, sender_name, sender_email, sender_phone,
        content, timestamp, thread_id, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      message.id,
      message.platform,
      message.conversationId,
      message.sender.id,
      message.sender.name,
      message.sender.email || null,
      (message.sender as any).phone || null,
      message.content,
      message.timestamp.getTime(),
      message.threadId || null,
      JSON.stringify(message.metadata || {}),
    ]);

    stmt.free();
    this.saveToDisk();
  }

  /**
   * Save multiple messages in a batch
   */
  async saveMessages(messages: Message[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.exec('BEGIN TRANSACTION');

    try {
      for (const message of messages) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO messages (
            id, platform, conversation_id, sender_id, sender_name, sender_email, sender_phone,
            content, timestamp, thread_id, metadata
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run([
          message.id,
          message.platform,
          message.conversationId,
          message.sender.id,
          message.sender.name,
          message.sender.email || null,
          (message.sender as any).phone || null,
          message.content,
          message.timestamp.getTime(),
          message.threadId || null,
          JSON.stringify(message.metadata || {}),
        ]);

        stmt.free();
      }

      this.db.exec('COMMIT');
      this.saveToDisk();
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  /**
   * Get messages with optional filters
   */
  async getMessages(options: {
    conversationId?: string;
    platform?: Platform;
    limit?: number;
    since?: Date;
    searchTerm?: string;
  } = {}): Promise<Message[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM messages WHERE 1=1';
    const params: any[] = [];

    if (options.conversationId) {
      query += ' AND conversation_id = ?';
      params.push(options.conversationId);
    }

    if (options.platform) {
      query += ' AND platform = ?';
      params.push(options.platform);
    }

    if (options.since) {
      query += ' AND timestamp >= ?';
      params.push(options.since.getTime());
    }

    if (options.searchTerm) {
      query += ' AND content LIKE ?';
      params.push(`%${options.searchTerm}%`);
    }

    query += ' ORDER BY timestamp DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    const stmt = this.db.prepare(query);
    stmt.bind(params);

    const messages: Message[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      messages.push(this.rowToMessage(row));
    }

    stmt.free();
    return messages;
  }

  /**
   * Get a specific message by ID
   */
  async getMessageById(id: string): Promise<Message | null> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM messages WHERE id = ?');
    stmt.bind([id]);

    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return this.rowToMessage(row);
    }

    stmt.free();
    return null;
  }

  /**
   * Get unread messages count by conversation
   */
  async getUnreadCount(conversationId?: string): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT COUNT(*) as count FROM messages WHERE 1=1';
    const params: any[] = [];

    if (conversationId) {
      query += ' AND conversation_id = ?';
      params.push(conversationId);
    }

    const stmt = this.db.prepare(query);
    stmt.bind(params);

    let count = 0;
    if (stmt.step()) {
      const row = stmt.getAsObject();
      count = row.count as number;
    }

    stmt.free();
    return count;
  }

  /**
   * Save conversation metadata
   */
  async saveConversation(conversation: Conversation): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO conversations (
        id, platform, name, last_message_at, unread_count, metadata
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      conversation.id,
      conversation.platform,
      conversation.name,
      conversation.lastMessageAt.getTime(),
      conversation.unreadCount,
      JSON.stringify(conversation.metadata || {}),
    ]);

    stmt.free();
    this.saveToDisk();
  }

  /**
   * Get all conversations
   */
  async getConversations(platform?: Platform): Promise<Conversation[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM conversations';
    const params: any[] = [];

    if (platform) {
      query += ' WHERE platform = ?';
      params.push(platform);
    }

    query += ' ORDER BY last_message_at DESC';

    const stmt = this.db.prepare(query);
    stmt.bind(params);

    const conversations: Conversation[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      conversations.push(this.rowToConversation(row));
    }

    stmt.free();
    return conversations;
  }

  /**
   * Update platform status
   */
  async updatePlatformStatus(status: PlatformStatus): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      UPDATE platform_configs
      SET credentials_valid = ?, last_sync = ?, error_message = ?
      WHERE platform = ?
    `);

    stmt.run([
      status.connected ? 1 : 0,
      status.lastSync ? status.lastSync.getTime() : null,
      status.error || null,
      status.platform,
    ]);

    stmt.free();
    this.saveToDisk();
  }

  /**
   * Get platform status
   */
  async getPlatformStatus(platform?: Platform): Promise<PlatformStatus[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM platform_configs';
    const params: any[] = [];

    if (platform) {
      query += ' WHERE platform = ?';
      params.push(platform);
    }

    const stmt = this.db.prepare(query);
    stmt.bind(params);

    const statuses: PlatformStatus[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      statuses.push({
        platform: row.platform as Platform,
        connected: row.credentials_valid === 1,
        lastSync: row.last_sync ? new Date(row.last_sync as number) : undefined,
        error: row.error_message as string | undefined,
      });
    }

    stmt.free();
    return statuses;
  }

  /**
   * Search messages by keyword
   */
  async searchMessages(searchTerm: string, limit = 50): Promise<Message[]> {
    return this.getMessages({ searchTerm, limit });
  }

  /**
   * Convert database row to Message object
   */
  private rowToMessage(row: any): Message {
    return {
      id: row.id as string,
      platform: row.platform as Platform,
      conversationId: row.conversation_id as string,
      sender: {
        id: row.sender_id as string,
        name: row.sender_name as string,
        email: row.sender_email as string | undefined,
      },
      content: row.content as string,
      timestamp: new Date(row.timestamp as number),
      threadId: row.thread_id as string | undefined,
      metadata: row.metadata ? JSON.parse(row.metadata as string) : undefined,
    };
  }

  /**
   * Convert database row to Conversation object
   */
  private rowToConversation(row: any): Conversation {
    return {
      id: row.id as string,
      platform: row.platform as Platform,
      name: row.name as string,
      participants: [], // TODO: Add participants table
      lastMessageAt: new Date(row.last_message_at as number),
      unreadCount: row.unread_count as number,
      metadata: row.metadata ? JSON.parse(row.metadata as string) : undefined,
    };
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.saveToDisk();
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }
}

export default DatabaseManager;
