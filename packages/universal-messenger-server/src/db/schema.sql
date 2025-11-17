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
