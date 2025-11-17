import { google } from 'googleapis';
import type { MessageAdapter, UnifiedMessage } from '../types.js';

export class GoogleChatAdapter implements MessageAdapter {
  name = 'gchat';
  private chat: any = null;
  private spaceName: string;

  constructor() {
    this.spaceName = process.env.GOOGLE_CHAT_SPACE_NAME || '';
    const credentialsPath = process.env.GOOGLE_CHAT_CREDENTIALS_PATH;

    if (credentialsPath) {
      try {
        const auth = new google.auth.GoogleAuth({
          keyFile: credentialsPath,
          scopes: ['https://www.googleapis.com/auth/chat.bot']
        });

        this.chat = google.chat({ version: 'v1', auth });
      } catch (error) {
        console.error('Error initializing Google Chat adapter:', error);
      }
    }
  }

  isConfigured(): boolean {
    return this.chat !== null && this.spaceName !== '';
  }

  async fetchRecentMessages(limit = 50, since?: Date): Promise<UnifiedMessage[]> {
    if (!this.chat || !this.spaceName) {
      console.warn('Google Chat adapter not configured');
      return [];
    }

    try {
      const response = await this.chat.spaces.messages.list({
        parent: this.spaceName,
        pageSize: limit,
        orderBy: 'createTime desc'
      });

      const messages = response.data.messages || [];
      
      return messages
        .filter((msg: any) => {
          // Filter by date if provided
          if (since) {
            const msgDate = new Date(msg.createTime);
            return msgDate >= since;
          }
          return true;
        })
        .map((msg: any) => this.toUnifiedMessage(msg));
    } catch (error) {
      console.error('Error fetching Google Chat messages:', error);
      return [];
    }
  }

  async getMessageById(id: string): Promise<UnifiedMessage | null> {
    if (!this.chat) return null;

    const messageName = id.replace('gchat-', '');

    try {
      const response = await this.chat.spaces.messages.get({
        name: messageName
      });

      return this.toUnifiedMessage(response.data);
    } catch (error) {
      console.error('Error fetching Google Chat message by ID:', error);
      return null;
    }
  }

  private toUnifiedMessage(gchatMsg: any): UnifiedMessage {
    const sender = gchatMsg.sender || {};
    
    return {
      id: `gchat-${gchatMsg.name}`,
      platform: 'gchat',
      sender: {
        id: sender.name || 'unknown',
        name: sender.displayName || 'Unknown User',
        email: sender.email
      },
      content: {
        text: gchatMsg.text || '',
        attachments: gchatMsg.attachment ? this.extractAttachments(gchatMsg.attachment) : undefined
      },
      timestamp: new Date(gchatMsg.createTime),
      threadId: gchatMsg.thread?.name ? `gchat-${gchatMsg.thread.name}` : undefined,
      channel: {
        id: gchatMsg.space?.name || '',
        name: gchatMsg.space?.displayName || 'Google Chat Space'
      },
      metadata: {
        platformMessageId: gchatMsg.name,
        raw: gchatMsg
      }
    };
  }

  private extractAttachments(attachments: any[]): any[] {
    if (!Array.isArray(attachments)) {
      attachments = [attachments];
    }

    return attachments.map(att => ({
      type: this.getFileType(att.contentType || att.mimeType),
      url: att.downloadUri || att.thumbnailUri,
      name: att.name,
      mimeType: att.contentType || att.mimeType
    }));
  }

  private getFileType(mimeType: string): 'image' | 'file' | 'video' | 'audio' {
    if (!mimeType) return 'file';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  }
}
