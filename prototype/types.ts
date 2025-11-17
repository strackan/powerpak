/**
 * Unified message format across all platforms
 */
export interface UnifiedMessage {
  id: string;                    // Unique message ID
  platform: 'sms' | 'slack' | 'gchat' | 'whatsapp';
  sender: {
    id: string;                  // Platform-specific user ID
    name: string;                // Display name
    phone?: string;              // For SMS/WhatsApp
    email?: string;              // For Slack/GChat
  };
  content: {
    text: string;                // Message text
    attachments?: Attachment[];  // Files, images, etc.
  };
  timestamp: Date;               // When message was sent
  threadId?: string;             // For threaded conversations
  channel?: {
    id: string;                  // Channel/room/conversation ID
    name: string;                // Channel name
  };
  metadata: {
    platformMessageId: string;   // Original platform ID
    raw?: any;                   // Original platform message object
  };
}

export interface Attachment {
  type: 'image' | 'file' | 'video' | 'audio';
  url: string;
  name?: string;
  mimeType?: string;
  size?: number;
}

/**
 * Interface for platform-specific message adapters
 */
export interface MessageAdapter {
  name: string;
  fetchRecentMessages(limit?: number, since?: Date): Promise<UnifiedMessage[]>;
  getMessageById(id: string): Promise<UnifiedMessage | null>;
  isConfigured(): boolean;
}

/**
 * Options for fetching messages
 */
export interface FetchOptions {
  limit?: number;              // Max number of messages
  since?: string;              // ISO date string
  platforms?: string[];        // Filter by platform
  searchTerm?: string;         // Search message content
}
