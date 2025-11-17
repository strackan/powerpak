/**
 * Shared types and interfaces for MCP-World
 */

// Platform Types
export enum Platform {
  SLACK = 'slack',
  TEAMS = 'teams',
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
  GOOGLE_CHAT = 'google_chat',
}

// Message Types
export interface Message {
  id: string;
  platform: Platform;
  conversationId: string;
  sender: {
    id: string;
    name: string;
    email?: string;
  };
  content: string;
  timestamp: Date;
  threadId?: string;
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  platform: Platform;
  name: string;
  participants: Array<{
    id: string;
    name: string;
    email?: string;
  }>;
  lastMessageAt: Date;
  unreadCount: number;
  metadata?: Record<string, unknown>;
}

// Platform Configuration
export interface PlatformConfig {
  platform: Platform;
  enabled: boolean;
  credentials: Record<string, string>;
}

export interface PlatformStatus {
  platform: Platform;
  connected: boolean;
  lastSync?: Date;
  error?: string;
}

// Platform Adapter Interface
export interface PlatformAdapter {
  platform: Platform;
  initialize(): Promise<void>;
  getMessages(options?: GetMessagesOptions): Promise<Message[]>;
  sendMessage(conversationId: string, content: string): Promise<Message>;
  markAsRead(messageId: string): Promise<void>;
  getConversations(): Promise<Conversation[]>;
  getStatus(): Promise<PlatformStatus>;
}

export interface GetMessagesOptions {
  conversationId?: string;
  limit?: number;
  since?: Date;
  includeThreads?: boolean;
}

// Justin's Voice Types
export interface VoiceTemplate {
  id: string;
  category: 'beginning' | 'middle' | 'ending';
  content: string;
  mood?: string[];
  context?: string[];
}

export interface BlendRecipe {
  name: string;
  mood: string;
  context: string;
  beginningTemplateId: string;
  middleTemplateId: string;
  endingTemplateId: string;
  description?: string;
}

export interface ContentGenerationRequest {
  templateIds?: {
    beginning?: string;
    middle?: string;
    ending?: string;
  };
  blendName?: string;
  context?: string;
  topic?: string;
}

export interface ContentGenerationResponse {
  content: string;
  templatesUsed: {
    beginning: string;
    middle: string;
    ending: string;
  };
  voiceScore: number; // 0-100, how "Justin-like" it is
}

export interface VoiceAnalysisResult {
  overallScore: number; // 0-100
  strengths: string[];
  improvements: string[];
  suggestions: Array<{
    issue: string;
    suggestion: string;
    example?: string;
  }>;
}
