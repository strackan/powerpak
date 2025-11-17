import { google } from 'googleapis';
import {
  Platform,
  Message,
  Conversation,
  PlatformAdapter,
  GetMessagesOptions,
  PlatformStatus,
} from '@mcp-world/shared-types';

/**
 * Google Chat adapter using Google Chat API
 */
export class GoogleChatAdapter implements PlatformAdapter {
  platform = Platform.GOOGLE_CHAT;
  private chat: any = null;
  private spaceName: string = '';

  async initialize(): Promise<void> {
    const credentialsPath = process.env.GOOGLE_CHAT_CREDENTIALS_PATH;

    if (!credentialsPath) {
      console.warn('Google Chat adapter not configured: GOOGLE_CHAT_CREDENTIALS_PATH missing');
      return;
    }

    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ['https://www.googleapis.com/auth/chat.bot'],
      });

      this.chat = google.chat({ version: 'v1', auth });
      console.error('Google Chat adapter initialized');
    } catch (error) {
      console.error('Error initializing Google Chat adapter:', error);
      throw error;
    }
  }

  async getMessages(options: GetMessagesOptions = {}): Promise<Message[]> {
    if (!this.chat) {
      console.warn('Google Chat adapter not configured');
      return [];
    }

    try {
      // If specific conversation requested
      if (options.conversationId) {
        return this.getSpaceMessages(options.conversationId, options);
      }

      // Get all spaces the bot is in
      const spacesResponse = await this.chat.spaces.list();
      const spaces = spacesResponse.data.spaces || [];

      const allMessages: Message[] = [];

      for (const space of spaces) {
        try {
          const messages = await this.getSpaceMessages(space.name, options);
          allMessages.push(...messages);
        } catch (error) {
          console.error(`Error fetching messages from space ${space.name}:`, error);
        }
      }

      // Sort by timestamp descending
      allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      const limit = options.limit || 50;
      return allMessages.slice(0, limit);
    } catch (error) {
      console.error('Error fetching Google Chat messages:', error);
      return [];
    }
  }

  private async getSpaceMessages(
    spaceName: string,
    options: GetMessagesOptions = {}
  ): Promise<Message[]> {
    if (!this.chat) return [];

    const response = await this.chat.spaces.messages.list({
      parent: spaceName,
      pageSize: options.limit || 50,
      orderBy: 'createTime desc',
    });

    const messages = response.data.messages || [];

    return messages
      .filter((msg: any) => {
        // Filter by date if provided
        if (options.since) {
          const msgDate = new Date(msg.createTime);
          return msgDate >= options.since;
        }
        return true;
      })
      .map((msg: any) => this.toUnifiedMessage(msg));
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    if (!this.chat) {
      throw new Error('Google Chat adapter not configured');
    }

    try {
      const response = await this.chat.spaces.messages.create({
        parent: conversationId,
        requestBody: {
          text: content,
        },
      });

      return this.toUnifiedMessage(response.data);
    } catch (error) {
      console.error('Error sending Google Chat message:', error);
      throw error;
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    // Google Chat doesn't have a simple mark as read API for bots
    console.warn('markAsRead not fully supported for Google Chat');
  }

  async getConversations(): Promise<Conversation[]> {
    if (!this.chat) {
      console.warn('Google Chat adapter not configured');
      return [];
    }

    try {
      const response = await this.chat.spaces.list();
      const spaces = response.data.spaces || [];

      const conversations: Conversation[] = [];

      for (const space of spaces) {
        // Get latest message to determine last activity
        const messagesResponse = await this.chat.spaces.messages.list({
          parent: space.name,
          pageSize: 1,
          orderBy: 'createTime desc',
        });

        const lastMessage = messagesResponse.data.messages?.[0];

        conversations.push({
          id: space.name,
          platform: Platform.GOOGLE_CHAT,
          name: space.displayName || space.name,
          participants: [], // TODO: Fetch members
          lastMessageAt: lastMessage
            ? new Date(lastMessage.createTime)
            : new Date(),
          unreadCount: 0,
          metadata: {
            spaceType: space.spaceType,
            threaded: space.threaded,
          },
        });
      }

      return conversations;
    } catch (error) {
      console.error('Error fetching Google Chat conversations:', error);
      return [];
    }
  }

  async getStatus(): Promise<PlatformStatus> {
    if (!this.chat) {
      return {
        platform: Platform.GOOGLE_CHAT,
        connected: false,
        error: 'GOOGLE_CHAT_CREDENTIALS_PATH not configured',
      };
    }

    try {
      // Test connection by listing spaces
      await this.chat.spaces.list({ pageSize: 1 });
      return {
        platform: Platform.GOOGLE_CHAT,
        connected: true,
        lastSync: new Date(),
      };
    } catch (error) {
      return {
        platform: Platform.GOOGLE_CHAT,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private toUnifiedMessage(gchatMsg: any): Message {
    const sender = gchatMsg.sender || {};

    return {
      id: `gchat-${gchatMsg.name}`,
      platform: Platform.GOOGLE_CHAT,
      conversationId: gchatMsg.space?.name || '',
      sender: {
        id: sender.name || 'unknown',
        name: sender.displayName || 'Unknown User',
        email: sender.email,
      },
      content: gchatMsg.text || '',
      timestamp: new Date(gchatMsg.createTime),
      threadId: gchatMsg.thread?.name ? `gchat-${gchatMsg.thread.name}` : undefined,
      metadata: {
        platformMessageId: gchatMsg.name,
        spaceName: gchatMsg.space?.displayName || '',
        attachments: gchatMsg.attachment,
      },
    };
  }
}
