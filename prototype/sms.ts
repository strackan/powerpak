import twilio from 'twilio';
import type { MessageAdapter, UnifiedMessage } from '../types.js';

export class SMSAdapter implements MessageAdapter {
  name = 'sms';
  private client: ReturnType<typeof twilio> | null = null;
  private phoneNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    }
  }

  isConfigured(): boolean {
    return this.client !== null && this.phoneNumber !== '';
  }

  async fetchRecentMessages(limit = 50, since?: Date): Promise<UnifiedMessage[]> {
    if (!this.client) {
      console.warn('SMS adapter not configured');
      return [];
    }

    try {
      const options: any = {
        to: this.phoneNumber,
        limit: limit
      };

      if (since) {
        options.dateSentAfter = since;
      }

      const messages = await this.client.messages.list(options);

      return messages.map(msg => this.toUnifiedMessage(msg));
    } catch (error) {
      console.error('Error fetching SMS messages:', error);
      return [];
    }
  }

  async getMessageById(id: string): Promise<UnifiedMessage | null> {
    if (!this.client) return null;

    try {
      const message = await this.client.messages(id).fetch();
      return this.toUnifiedMessage(message);
    } catch (error) {
      console.error('Error fetching SMS message by ID:', error);
      return null;
    }
  }

  private toUnifiedMessage(twilioMsg: any): UnifiedMessage {
    return {
      id: `sms-${twilioMsg.sid}`,
      platform: 'sms',
      sender: {
        id: twilioMsg.from,
        name: twilioMsg.from,
        phone: twilioMsg.from
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
    // Twilio media URLs are available via mediaUrl0, mediaUrl1, etc.
    const attachments = [];
    for (let i = 0; i < twilioMsg.numMedia; i++) {
      const mediaUrl = (twilioMsg as any)[`mediaUrl${i}`];
      if (mediaUrl) {
        attachments.push({
          type: 'image', // Simplification - could parse content type
          url: mediaUrl,
          mimeType: (twilioMsg as any)[`mediaContentType${i}`]
        });
      }
    }
    return attachments;
  }
}
