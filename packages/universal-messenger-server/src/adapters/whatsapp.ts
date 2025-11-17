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
 * WhatsApp adapter using Twilio WhatsApp API
 */
export class WhatsAppAdapter implements PlatformAdapter {
  platform = Platform.WHATSAPP;
  private client: ReturnType<typeof twilio> | null = null;
  private whatsappNumber: string = '';

  async initialize(): Promise<void> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';

    if (!accountSid || !authToken || !this.whatsappNumber) {
      console.warn(
        'WhatsApp adapter not configured: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_WHATSAPP_NUMBER missing'
      );
      return;
    }

    this.client = twilio(accountSid, authToken);
    console.error(`WhatsApp adapter initialized with number: ${this.whatsappNumber}`);
  }

  async getMessages(options: GetMessagesOptions = {}): Promise<Message[]> {
    if (!this.client) {
      console.warn('WhatsApp adapter not configured');
      return [];
    }

    try {
      const twilioOptions: any = {
        to: this.whatsappNumber,
        limit: options.limit || 50,
      };

      if (options.since) {
        twilioOptions.dateSentAfter = options.since;
      }

      const messages = await this.client.messages.list(twilioOptions);

      // Filter only WhatsApp messages
      return messages
        .filter((msg) => msg.from.startsWith('whatsapp:') || msg.to.startsWith('whatsapp:'))
        .map((msg) => this.toUnifiedMessage(msg));
    } catch (error) {
      console.error('Error fetching WhatsApp messages:', error);
      return [];
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    if (!this.client) {
      throw new Error('WhatsApp adapter not configured');
    }

    try {
      // Ensure conversationId has whatsapp: prefix
      const to = conversationId.startsWith('whatsapp:')
        ? conversationId
        : `whatsapp:${conversationId}`;

      const message = await this.client.messages.create({
        from: this.whatsappNumber,
        to: to,
        body: content,
      });

      return this.toUnifiedMessage(message);
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    // WhatsApp via Twilio doesn't support marking messages as read
    console.warn('markAsRead not supported for WhatsApp');
  }

  async getConversations(): Promise<Conversation[]> {
    if (!this.client) {
      console.warn('WhatsApp adapter not configured');
      return [];
    }

    try {
      // Get recent WhatsApp messages and group by phone number
      const messages = await this.client.messages.list({ limit: 100 });
      const whatsappMessages = messages.filter(
        (msg) => msg.from.startsWith('whatsapp:') || msg.to.startsWith('whatsapp:')
      );

      const conversationMap = new Map<string, any>();

      for (const msg of whatsappMessages) {
        const phoneNumber =
          msg.direction === 'inbound'
            ? msg.from.replace('whatsapp:', '')
            : msg.to.replace('whatsapp:', '');

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
        id: `whatsapp:${conv.phoneNumber}`,
        platform: Platform.WHATSAPP,
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
      console.error('Error fetching WhatsApp conversations:', error);
      return [];
    }
  }

  async getStatus(): Promise<PlatformStatus> {
    if (!this.client) {
      return {
        platform: Platform.WHATSAPP,
        connected: false,
        error: 'Twilio credentials not configured',
      };
    }

    try {
      // Test connection by fetching account info
      await this.client.api.accounts.list({ limit: 1 });
      return {
        platform: Platform.WHATSAPP,
        connected: true,
        lastSync: new Date(),
      };
    } catch (error) {
      return {
        platform: Platform.WHATSAPP,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private toUnifiedMessage(twilioMsg: any): Message {
    // Remove 'whatsapp:' prefix for display
    const from = twilioMsg.from.replace('whatsapp:', '');
    const to = twilioMsg.to.replace('whatsapp:', '');

    return {
      id: `whatsapp-${twilioMsg.sid}`,
      platform: Platform.WHATSAPP,
      conversationId:
        twilioMsg.direction === 'inbound' ? `whatsapp:${from}` : `whatsapp:${to}`,
      sender: {
        id: from,
        name: from,
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
