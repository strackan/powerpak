#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { z } from 'zod';
import { Platform, PlatformAdapter } from '@mcp-world/shared-types';
import {
  SlackAdapter,
  SMSAdapter,
  WhatsAppAdapter,
  GoogleChatAdapter,
  TeamsAdapter,
} from './adapters/index.js';
import { DatabaseManager } from './db/database.js';

// Load environment variables
dotenv.config();

/**
 * Enhanced Universal Messenger MCP Server
 *
 * Features:
 * - Bidirectional messaging (send and receive)
 * - SQLite persistence with sql.js
 * - OAuth 2.0 support
 * - Conversation threading
 * - Enhanced MCP resources and tools
 */
class UniversalMessengerServer {
  private server: Server;
  private adapters: Map<Platform, PlatformAdapter> = new Map();
  private db: DatabaseManager;

  constructor() {
    this.server = new Server(
      {
        name: 'universal-messenger-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // Initialize database
    this.db = new DatabaseManager();

    // Initialize adapters
    this.initializeAdapters();

    // Setup handlers
    this.setupToolHandlers();
    this.setupResourceHandlers();
  }

  private async initializeAdapters(): Promise<void> {
    const adapterClasses = [
      SlackAdapter,
      SMSAdapter,
      WhatsAppAdapter,
      GoogleChatAdapter,
      TeamsAdapter,
    ];

    for (const AdapterClass of adapterClasses) {
      try {
        const adapter = new AdapterClass();
        await adapter.initialize();
        this.adapters.set(adapter.platform, adapter);
      } catch (error) {
        console.error(`Error initializing ${AdapterClass.name}:`, error);
      }
    }
  }

  private async logConfiguration(): Promise<void> {
    console.error('Universal Messenger MCP Server Starting...');
    console.error('Configured platforms:');

    for (const [platform, adapter] of this.adapters) {
      const status = await adapter.getStatus();
      const icon = status.connected ? '✓' : '✗';
      console.error(`  ${icon} ${platform.toUpperCase()}`);
      if (status.error) {
        console.error(`    Error: ${status.error}`);
      }
    }

    console.error('');
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_recent_messages',
          description:
            'Fetch recent messages from configured platforms. Returns messages in unified format sorted by timestamp.',
          inputSchema: {
            type: 'object',
            properties: {
              platform: {
                type: 'string',
                enum: ['slack', 'teams', 'whatsapp', 'sms', 'google_chat'],
                description: 'Filter by specific platform (optional)',
              },
              conversationId: {
                type: 'string',
                description: 'Filter by specific conversation ID (optional)',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of messages to return (default: 50)',
                default: 50,
              },
              since: {
                type: 'string',
                description: 'ISO date string to fetch messages after this time (optional)',
              },
            },
          },
        },
        {
          name: 'send_message',
          description: 'Send a message to a specific platform and conversation',
          inputSchema: {
            type: 'object',
            properties: {
              platform: {
                type: 'string',
                enum: ['slack', 'teams', 'whatsapp', 'sms', 'google_chat'],
                description: 'Platform to send message on',
              },
              conversationId: {
                type: 'string',
                description:
                  'Conversation ID (channel ID for Slack, phone number for SMS/WhatsApp, space name for Google Chat)',
              },
              content: {
                type: 'string',
                description: 'Message content to send',
              },
            },
            required: ['platform', 'conversationId', 'content'],
          },
        },
        {
          name: 'search_messages',
          description: 'Search messages by keyword across all platforms',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search term to find in message content',
              },
              platform: {
                type: 'string',
                enum: ['slack', 'teams', 'whatsapp', 'sms', 'google_chat'],
                description: 'Filter by specific platform (optional)',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results (default: 50)',
                default: 50,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_conversations',
          description: 'Get list of all conversations across platforms',
          inputSchema: {
            type: 'object',
            properties: {
              platform: {
                type: 'string',
                enum: ['slack', 'teams', 'whatsapp', 'sms', 'google_chat'],
                description: 'Filter by specific platform (optional)',
              },
            },
          },
        },
        {
          name: 'get_platform_status',
          description: 'Check which messaging platforms are currently configured and available',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'mark_as_read',
          description: 'Mark a message as read (where supported by platform)',
          inputSchema: {
            type: 'object',
            properties: {
              messageId: {
                type: 'string',
                description: 'The message ID to mark as read',
              },
            },
            required: ['messageId'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'get_recent_messages':
          return await this.handleGetRecentMessages(request.params.arguments);

        case 'send_message':
          return await this.handleSendMessage(request.params.arguments);

        case 'search_messages':
          return await this.handleSearchMessages(request.params.arguments);

        case 'get_conversations':
          return await this.handleGetConversations(request.params.arguments);

        case 'get_platform_status':
          return await this.handleGetPlatformStatus();

        case 'mark_as_read':
          return await this.handleMarkAsRead(request.params.arguments);

        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  private setupResourceHandlers(): void {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'messenger://conversations',
          mimeType: 'application/json',
          name: 'All Conversations',
          description: 'List of all conversations across all platforms',
        },
        {
          uri: 'messenger://messages/recent',
          mimeType: 'application/json',
          name: 'Recent Messages',
          description: 'Most recent messages from all platforms',
        },
        {
          uri: 'messenger://platforms',
          mimeType: 'application/json',
          name: 'Platform Status',
          description: 'Status of all configured messaging platforms',
        },
      ],
    }));

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;

      if (uri === 'messenger://conversations') {
        return await this.handleConversationsResource();
      } else if (uri === 'messenger://messages/recent') {
        return await this.handleRecentMessagesResource();
      } else if (uri === 'messenger://platforms') {
        return await this.handlePlatformsResource();
      } else if (uri.startsWith('messenger://conversation/')) {
        const conversationId = uri.replace('messenger://conversation/', '');
        return await this.handleConversationResource(conversationId);
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  private async handleGetRecentMessages(args: any) {
    try {
      const schema = z.object({
        platform: z.nativeEnum(Platform).optional(),
        conversationId: z.string().optional(),
        limit: z.number().default(50),
        since: z.string().optional(),
      });

      const options = schema.parse(args);
      const messages = [];

      // Determine which adapters to query
      const adaptersToQuery =
        options.platform && this.adapters.has(options.platform)
          ? [this.adapters.get(options.platform)!]
          : Array.from(this.adapters.values());

      // Fetch messages from adapters
      for (const adapter of adaptersToQuery) {
        try {
          const adapterMessages = await adapter.getMessages({
            conversationId: options.conversationId,
            limit: options.limit,
            since: options.since ? new Date(options.since) : undefined,
          });

          messages.push(...adapterMessages);

          // Save messages to database
          if (adapterMessages.length > 0) {
            await this.db.saveMessages(adapterMessages);
          }
        } catch (error) {
          console.error(`Error fetching from ${adapter.platform}:`, error);
        }
      }

      // Sort by timestamp descending
      messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Limit results
      const limitedMessages = messages.slice(0, options.limit);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                count: limitedMessages.length,
                messages: limitedMessages,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          },
        ],
        isError: true,
      };
    }
  }

  private async handleSendMessage(args: any) {
    try {
      const schema = z.object({
        platform: z.nativeEnum(Platform),
        conversationId: z.string(),
        content: z.string(),
      });

      const options = schema.parse(args);
      const adapter = this.adapters.get(options.platform);

      if (!adapter) {
        throw new Error(`Platform ${options.platform} not configured`);
      }

      const message = await adapter.sendMessage(options.conversationId, options.content);

      // Save to database
      await this.db.saveMessage(message);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                message,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          },
        ],
        isError: true,
      };
    }
  }

  private async handleSearchMessages(args: any) {
    try {
      const schema = z.object({
        query: z.string(),
        platform: z.nativeEnum(Platform).optional(),
        limit: z.number().default(50),
      });

      const options = schema.parse(args);

      // Search in database first
      const messages = await this.db.searchMessages(options.query, options.limit);

      // Filter by platform if specified
      const filteredMessages = options.platform
        ? messages.filter((m) => m.platform === options.platform)
        : messages;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                count: filteredMessages.length,
                query: options.query,
                messages: filteredMessages,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          },
        ],
        isError: true,
      };
    }
  }

  private async handleGetConversations(args: any) {
    try {
      const schema = z.object({
        platform: z.nativeEnum(Platform).optional(),
      });

      const options = schema.parse(args);
      const conversations = [];

      // Determine which adapters to query
      const adaptersToQuery =
        options.platform && this.adapters.has(options.platform)
          ? [this.adapters.get(options.platform)!]
          : Array.from(this.adapters.values());

      // Fetch conversations from adapters
      for (const adapter of adaptersToQuery) {
        try {
          const adapterConversations = await adapter.getConversations();
          conversations.push(...adapterConversations);

          // Save to database
          for (const conv of adapterConversations) {
            await this.db.saveConversation(conv);
          }
        } catch (error) {
          console.error(`Error fetching conversations from ${adapter.platform}:`, error);
        }
      }

      // Sort by last message time
      conversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                count: conversations.length,
                conversations,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          },
        ],
        isError: true,
      };
    }
  }

  private async handleGetPlatformStatus() {
    try {
      const statuses = [];

      for (const adapter of this.adapters.values()) {
        const status = await adapter.getStatus();
        statuses.push(status);

        // Update database
        await this.db.updatePlatformStatus(status);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                platforms: statuses,
                connectedCount: statuses.filter((s) => s.connected).length,
                totalCount: statuses.length,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          },
        ],
        isError: true,
      };
    }
  }

  private async handleMarkAsRead(args: any) {
    try {
      const schema = z.object({
        messageId: z.string(),
      });

      const options = schema.parse(args);

      // Extract platform from message ID
      const platform = options.messageId.split('-')[0] as Platform;
      const adapter = this.adapters.get(platform);

      if (!adapter) {
        throw new Error(`Platform ${platform} not found`);
      }

      await adapter.markAsRead(options.messageId);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              messageId: options.messageId,
            }),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          },
        ],
        isError: true,
      };
    }
  }

  // Resource handlers
  private async handleConversationsResource() {
    const conversations = await this.db.getConversations();

    return {
      contents: [
        {
          uri: 'messenger://conversations',
          mimeType: 'application/json',
          text: JSON.stringify(conversations, null, 2),
        },
      ],
    };
  }

  private async handleRecentMessagesResource() {
    const messages = await this.db.getMessages({ limit: 50 });

    return {
      contents: [
        {
          uri: 'messenger://messages/recent',
          mimeType: 'application/json',
          text: JSON.stringify(messages, null, 2),
        },
      ],
    };
  }

  private async handlePlatformsResource() {
    const statuses = await this.db.getPlatformStatus();

    return {
      contents: [
        {
          uri: 'messenger://platforms',
          mimeType: 'application/json',
          text: JSON.stringify(statuses, null, 2),
        },
      ],
    };
  }

  private async handleConversationResource(conversationId: string) {
    const messages = await this.db.getMessages({ conversationId, limit: 100 });

    return {
      contents: [
        {
          uri: `messenger://conversation/${conversationId}`,
          mimeType: 'application/json',
          text: JSON.stringify(messages, null, 2),
        },
      ],
    };
  }

  async run() {
    try {
      // Initialize database
      await this.db.initialize();

      // Log configuration
      await this.logConfiguration();

      // Start server
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      console.error('Universal Messenger MCP Server running on stdio');
    } catch (error) {
      console.error('Error starting server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new UniversalMessengerServer();
server.run().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
  console.error('Shutting down gracefully...');
  process.exit(0);
});
