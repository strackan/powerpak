import { WebClient } from '@slack/web-api';
import type { MessageAdapter, UnifiedMessage } from '../types.js';

export class SlackAdapter implements MessageAdapter {
  name = 'slack';
  private client: WebClient | null = null;
  private botUserId: string = '';

  constructor() {
    const token = process.env.SLACK_BOT_TOKEN;
    if (token) {
      this.client = new WebClient(token);
      this.initializeBotInfo();
    }
  }

  private async initializeBotInfo() {
    if (!this.client) return;
    try {
      const auth = await this.client.auth.test();
      this.botUserId = auth.user_id as string;
    } catch (error) {
      console.error('Error initializing Slack bot info:', error);
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async fetchRecentMessages(limit = 50, since?: Date): Promise<UnifiedMessage[]> {
    if (!this.client) {
      console.warn('Slack adapter not configured');
      return [];
    }

    try {
      // Get list of conversations (channels/DMs) where bot is a member
      const conversations = await this.client.conversations.list({
        types: 'public_channel,private_channel,im',
        limit: 100
      });

      const allMessages: UnifiedMessage[] = [];

      // Fetch messages from each conversation
      for (const channel of conversations.channels || []) {
        try {
          const options: any = {
            channel: channel.id!,
            limit: Math.min(limit, 100)
          };

          if (since) {
            options.oldest = since.getTime() / 1000; // Slack uses Unix timestamp
          }

          const history = await this.client.conversations.history(options);

          if (history.messages) {
            for (const msg of history.messages) {
              // Skip bot's own messages and system messages
              if (msg.user !== this.botUserId && msg.type === 'message' && !msg.subtype) {
                allMessages.push(await this.toUnifiedMessage(msg, channel));
              }
            }
          }
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

  async getMessageById(id: string): Promise<UnifiedMessage | null> {
    // Slack message IDs are format: channel-timestamp
    const [channelId, timestamp] = id.replace('slack-', '').split('-');
    
    if (!this.client || !channelId || !timestamp) return null;

    try {
      const result = await this.client.conversations.history({
        channel: channelId,
        latest: timestamp,
        inclusive: true,
        limit: 1
      });

      if (result.messages && result.messages.length > 0) {
        const channel = await this.client.conversations.info({ channel: channelId });
        return this.toUnifiedMessage(result.messages[0], channel.channel);
      }
      return null;
    } catch (error) {
      console.error('Error fetching Slack message by ID:', error);
      return null;
    }
  }

  private async toUnifiedMessage(slackMsg: any, channel: any): Promise<UnifiedMessage> {
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
      platform: 'slack',
      sender: {
        id: slackMsg.user || 'unknown',
        name: senderName,
        email: senderEmail
      },
      content: {
        text: slackMsg.text || '',
        attachments: slackMsg.files ? this.extractAttachments(slackMsg.files) : undefined
      },
      timestamp: new Date(parseFloat(slackMsg.ts) * 1000),
      threadId: slackMsg.thread_ts ? `slack-${channel.id}-${slackMsg.thread_ts}` : undefined,
      channel: {
        id: channel.id,
        name: channel.name || channel.id
      },
      metadata: {
        platformMessageId: slackMsg.ts,
        raw: slackMsg
      }
    };
  }

  private extractAttachments(files: any[]): any[] {
    return files.map(file => ({
      type: this.getFileType(file.mimetype),
      url: file.url_private || file.permalink,
      name: file.name,
      mimeType: file.mimetype,
      size: file.size
    }));
  }

  private getFileType(mimeType: string): 'image' | 'file' | 'video' | 'audio' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  }
}
