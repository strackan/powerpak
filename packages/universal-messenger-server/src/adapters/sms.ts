import twilio from 'twilio';
import {
  Platform,
  Message,
  Conversation,
  PlatformAdapter,
  GetMessagesOptions,
  PlatformStatus,
} from '@mcp-world/shared-types';

/**
 * SMS adapter using Twilio
 */
export class SMSAdapter implements PlatformAdapter {
  platform = Platform.SMS;
  private client: ReturnType<typeof twilio> | null = null;
  private phoneNumber: string = '';

  async initialize(): Promise<void> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (!accountSid || !authToken || !this.phoneNumber) {
      console.warn(
        'SMS adapter not configured: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER missing'
      );
      return;
    }

    this.client = twilio(accountSid, authToken);
    console.error(`SMS adapter initialized with number: ${this.phoneNumber}`);
  }

  async getMessages(options: GetMessagesOptions = {}): Promise<Message[]> {
    if (!this.client) {
      console.warn('SMS adapter not configured');
      return [];
    }

    try {
      const twilioOptions: any = {
        to: this.phoneNumber,
        limit: options.limit || 50,
      };

      if (options.since) {
        twilioOptions.dateSentAfter = options.since;
      }

      const messages = await this.client.messages.list(twilioOptions);

      return messages.map((msg) => this.toUnifiedMessage(msg));
    } catch (error) {
      console.error('Error fetching SMS messages:', error);
      return [];
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    if (!this.client) {
      throw new Error('SMS adapter not configured');
    }

    try {
      // conversationId for SMS is the phone number
      const message = await this.client.messages.create({
        from: this.phoneNumber,
        to: conversationId,
        body: content,
      });

      return this.toUnifiedMessage(message);
    } catch (error) {
      console.error('Error sending SMS message:', error);
      throw error;
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    // SMS/Twilio doesn't support marking messages as read
    console.warn('markAsRead not supported for SMS');
  }

  async getConversations(): Promise<Conversation[]> {
    if (!this.client) {
      console.warn('SMS adapter not configured');
      return [];
    }

    try {
      // Get recent messages and group by phone number
      const messages = await this.client.messages.list({ limit: 100 });
      const conversationMap = new Map<string, any>();

      for (const msg of messages) {
        const phoneNumber = msg.direction === 'inbound' ? msg.from : msg.to;

        if (!conversationMap.has(phoneNumber)) {
          conversationMap.set(phoneNumber, {
            phoneNumber,
            lastMessageAt: new Date(msg.dateSent),
            messageCount: 1,
          });
        } else {
          const conv = conversationMap.get(phoneNumber);
          conv.messageCount++;
          if (new Date(msg.dateSent) > conv.lastMessageAt) {
            conv.lastMessageAt = new Date(msg.dateSent);
          }
        }
      }

      return Array.from(conversationMap.values()).map((conv) => ({
        id: conv.phoneNumber,
        platform: Platform.SMS,
        name: conv.phoneNumber,
        participants: [
          {
            id: conv.phoneNumber,
            name: conv.phoneNumber,
          },
        ],
        lastMessageAt: conv.lastMessageAt,
        unreadCount: 0,
        metadata: {
          messageCount: conv.messageCount,
        },
      }));
    } catch (error) {
      console.error('Error fetching SMS conversations:', error);
      return [];
    }
  }

  async getStatus(): Promise<PlatformStatus> {
    if (!this.client) {
      return {
        platform: Platform.SMS,
        connected: false,
        error: 'Twilio credentials not configured',
      };
    }

    try {
      // Test connection by fetching account info
      await this.client.api.accounts.list({ limit: 1 });
      return {
        platform: Platform.SMS,
        connected: true,
        lastSync: new Date(),
      };
    } catch (error) {
      return {
        platform: Platform.SMS,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private toUnifiedMessage(twilioMsg: any): Message {
    return {
      id: `sms-${twilioMsg.sid}`,
      platform: Platform.SMS,
      conversationId: twilioMsg.direction === 'inbound' ? twilioMsg.from : twilioMsg.to,
      sender: {
        id: twilioMsg.from,
        name: twilioMsg.from,
      },
      content: twilioMsg.body,
      timestamp: new Date(twilioMsg.dateSent),
      metadata: {
        platformMessageId: twilioMsg.sid,
        direction: twilioMsg.direction,
        status: twilioMsg.status,
        numMedia: twilioMsg.numMedia,
      },
    };
  }
}
