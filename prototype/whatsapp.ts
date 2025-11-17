import twilio from 'twilio';
import type { MessageAdapter, UnifiedMessage } from '../types.js';

export class WhatsAppAdapter implements MessageAdapter {
  name = 'whatsapp';
  private client: ReturnType<typeof twilio> | null = null;
  private whatsappNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.whatsappNumber = process.env.WHATSAPP_NUMBER || '';

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    }
  }

  isConfigured(): boolean {
    return this.client !== null && this.whatsappNumber !== '';
  }

  async fetchRecentMessages(limit = 50, since?: Date): Promise<UnifiedMessage[]> {
    if (!this.client) {
      console.warn('WhatsApp adapter not configured');
      return [];
    }

    try {
      const options: any = {
        to: this.whatsappNumber,
        limit: limit
      };

      if (since) {
        options.dateSentAfter = since;
      }

      const messages = await this.client.messages.list(options);

      return messages
        .filter(msg => msg.from.startsWith('whatsapp:'))
        .map(msg => this.toUnifiedMessage(msg));
    } catch (error) {
      console.error('Error fetching WhatsApp messages:', error);
      return [];
    }
  }

  async getMessageById(id: string): Promise<UnifiedMessage | null> {
    if (!this.client) return null;

    try {
      const messageSid = id.replace('whatsapp-', '');
      const message = await this.client.messages(messageSid).fetch();
      return this.toUnifiedMessage(message);
    } catch (error) {
      console.error('Error fetching WhatsApp message by ID:', error);
      return null;
    }
  }

  private toUnifiedMessage(twilioMsg: any): UnifiedMessage {
    // Remove 'whatsapp:' prefix for display
    const phoneNumber = twilioMsg.from.replace('whatsapp:', '');

    return {
      id: `whatsapp-${twilioMsg.sid}`,
      platform: 'whatsapp',
      sender: {
        id: phoneNumber,
        name: phoneNumber, // WhatsApp doesn't provide name via Twilio
        phone: phoneNumber
      },
      content: {
        text: twilioMsg.body,
        attachments: twilioMsg.numMedia > 0 ? this.extractAttachments(twilioMsg) : undefined
      },
      timestamp: new Date(twilioMsg.dateSent),
      metadata: {
        platformMessageId: twilioMsg.sid,
        raw: twilioMsg
      }
    };
  }

  private extractAttachments(twilioMsg: any): any[] {
    const attachments = [];
    for (let i = 0; i < twilioMsg.numMedia; i++) {
      const mediaUrl = (twilioMsg as any)[`mediaUrl${i}`];
      if (mediaUrl) {
        attachments.push({
          type: this.getFileType((twilioMsg as any)[`mediaContentType${i}`]),
          url: mediaUrl,
          mimeType: (twilioMsg as any)[`mediaContentType${i}`]
        });
      }
    }
    return attachments;
  }

  private getFileType(mimeType: string): 'image' | 'file' | 'video' | 'audio' {
    if (!mimeType) return 'file';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  }
}
