import { WebClient } from '@slack/web-api';
import {
  Platform,
  Message,
  Conversation,
  PlatformAdapter,
  GetMessagesOptions,
  PlatformStatus,
} from '@mcp-world/shared-types';

/**
 * Slack adapter - handles Slack workspace messages
 */
export class SlackAdapter implements PlatformAdapter {
  platform = Platform.SLACK;
  private client: WebClient | null = null;
  private botUserId: string = '';

  async initialize(): Promise<void> {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) {
      console.warn('Slack adapter not configured: SLACK_BOT_TOKEN missing');
      return;
    }

    this.client = new WebClient(token);

    try {
      const auth = await this.client.auth.test();
      this.botUserId = auth.user_id as string;
      console.error(`Slack adapter initialized for workspace: ${auth.team}`);
    } catch (error) {
      console.error('Error initializing Slack adapter:', error);
      this.client = null;
      throw error;
    }
  }

  async getMessages(options: GetMessagesOptions = {}): Promise<Message[]> {
    if (!this.client) {
      console.warn('Slack adapter not configured');
      return [];
    }

    try {
      const limit = options.limit || 50;
      const allMessages: Message[] = [];

      // If specific conversation requested
      if (options.conversationId) {
        return this.getConversationMessages(options.conversationId, options);
      }

      // Get list of conversations (channels/DMs) where bot is a member
      const conversations = await this.client.conversations.list({
        types: 'public_channel,private_channel,im',
        limit: 100,
      });

      // Fetch messages from each conversation
      for (const channel of conversations.channels || []) {
        try {
          const messages = await this.getConversationMessages(channel.id!, options);
          allMessages.push(...messages);
        } catch (error) {
          console.error(`Error fetching messages from channel ${channel.id}:`, error);
        }
      }

      // Sort by timestamp descending
      allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return allMessages.slice(0, limit);
    } catch (error) {
      console.error('Error fetching Slack messages:', error);
      return [];
    }
  }

  private async getConversationMessages(
    channelId: string,
    options: GetMessagesOptions = {}
  ): Promise<Message[]> {
    if (!this.client) return [];

    const historyOptions: any = {
      channel: channelId,
      limit: Math.min(options.limit || 100, 100),
    };

    if (options.since) {
      historyOptions.oldest = options.since.getTime() / 1000; // Slack uses Unix timestamp
    }

    const history = await this.client.conversations.history(historyOptions);
    const messages: Message[] = [];

    if (history.messages) {
      for (const msg of history.messages) {
        // Skip bot's own messages and system messages
        if (msg.user !== this.botUserId && msg.type === 'message' && !msg.subtype) {
          // Get channel info
          const channelInfo = await this.client.conversations.info({ channel: channelId });
          messages.push(await this.toUnifiedMessage(msg, channelInfo.channel));
        }
      }
    }

    return messages;
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    if (!this.client) {
      throw new Error('Slack adapter not configured');
    }

    try {
      const result = await this.client.chat.postMessage({
        channel: conversationId,
        text: content,
      });

      // Get channel info for full message object
      const channelInfo = await this.client.conversations.info({ channel: conversationId });

      // Return the sent message
      return {
        id: `slack-${conversationId}-${result.ts}`,
        platform: Platform.SLACK,
        conversationId: conversationId,
        sender: {
          id: this.botUserId,
          name: 'Bot',
        },
        content: content,
        timestamp: new Date(parseFloat(result.ts as string) * 1000),
        metadata: {
          platformMessageId: result.ts as string,
        },
      };
    } catch (error) {
      console.error('Error sending Slack message:', error);
      throw error;
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    // Slack doesn't have a direct "mark as read" API for bot messages
    // This would require the conversations.mark API but it's deprecated
    // and replaced with event-based approaches
    console.warn('markAsRead not fully supported for Slack');
  }

  async getConversations(): Promise<Conversation[]> {
    if (!this.client) {
      console.warn('Slack adapter not configured');
      return [];
    }

    try {
      const result = await this.client.conversations.list({
        types: 'public_channel,private_channel,im',
        limit: 100,
      });

      const conversations: Conversation[] = [];

      for (const channel of result.channels || []) {
        // Get latest message to determine last activity
        const history = await this.client.conversations.history({
          channel: channel.id!,
          limit: 1,
        });

        const lastMessage = history.messages?.[0];

        conversations.push({
          id: channel.id!,
          platform: Platform.SLACK,
          name: channel.name || channel.id!,
          participants: [], // TODO: Fetch members
          lastMessageAt: lastMessage
            ? new Date(parseFloat(lastMessage.ts!) * 1000)
            : new Date(),
          unreadCount: 0, // Slack doesn't provide this easily for bots
          metadata: {
            isChannel: channel.is_channel,
            isPrivate: channel.is_private,
            isIm: channel.is_im,
          },
        });
      }

      return conversations;
    } catch (error) {
      console.error('Error fetching Slack conversations:', error);
      return [];
    }
  }

  async getStatus(): Promise<PlatformStatus> {
    if (!this.client) {
      return {
        platform: Platform.SLACK,
        connected: false,
        error: 'SLACK_BOT_TOKEN not configured',
      };
    }

    try {
      await this.client.auth.test();
      return {
        platform: Platform.SLACK,
        connected: true,
        lastSync: new Date(),
      };
    } catch (error) {
      return {
        platform: Platform.SLACK,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async toUnifiedMessage(slackMsg: any, channel: any): Promise<Message> {
    let senderName = 'Unknown User';
    let senderEmail: string | undefined;

    // Try to get user info
    if (slackMsg.user && this.client) {
      try {
        const userInfo = await this.client.users.info({ user: slackMsg.user });
        if (userInfo.user) {
          senderName = userInfo.user.real_name || userInfo.user.name || senderName;
          senderEmail = userInfo.user.profile?.email;
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    }

    return {
      id: `slack-${channel.id}-${slackMsg.ts}`,
      platform: Platform.SLACK,
      conversationId: channel.id,
      sender: {
        id: slackMsg.user || 'unknown',
        name: senderName,
        email: senderEmail,
      },
      content: slackMsg.text || '',
      timestamp: new Date(parseFloat(slackMsg.ts) * 1000),
      threadId: slackMsg.thread_ts ? `slack-${channel.id}-${slackMsg.thread_ts}` : undefined,
      metadata: {
        platformMessageId: slackMsg.ts,
        channelName: channel.name || channel.id,
        files: slackMsg.files,
      },
    };
  }
}
