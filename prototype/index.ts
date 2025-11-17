#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import {
  SMSAdapter,
  SlackAdapter,
  GoogleChatAdapter,
  WhatsAppAdapter,
} from './adapters/index.js';
import type { MessageAdapter, UnifiedMessage, FetchOptions } from './types.js';

// Load environment variables
dotenv.config();

/**
 * Universal Messaging MCP Server
 * Aggregates messages from SMS, Slack, Google Chat, and WhatsApp
 */
class UniversalMessagingServer {
  private server: Server;
  private adapters: MessageAdapter[];

  constructor() {
    this.server = new Server(
      {
        name: 'universal-messaging',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize all adapters
    this.adapters = [
      new SMSAdapter(),
      new SlackAdapter(),
      new GoogleChatAdapter(),
      new WhatsAppAdapter(),
    ];

    this.setupToolHandlers();
    
    // Log which adapters are configured
    this.logConfiguration();
  }

  private logConfiguration() {
    console.error('Universal Messaging MCP Server Starting...');
    console.error('Configured platforms:');
    this.adapters.forEach(adapter => {
      const status = adapter.isConfigured() ? '✓' : '✗';
      console.error(`  ${status} ${adapter.name.toUpperCase()}`);
    });
    console.error('');
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_recent_messages',
          description: 'Fetch recent messages from all configured messaging platforms (SMS, Slack, Google Chat, WhatsApp). Messages are returned in a unified format sorted by timestamp.',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of messages to return (default: 50)',
                default: 50,
              },
              since: {
                type: 'string',
                description: 'ISO date string to fetch messages after this time (optional)',
              },
              platforms: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['sms', 'slack', 'gchat', 'whatsapp'],
                },
                description: 'Filter by specific platforms (optional, defaults to all)',
              },
              searchTerm: {
                type: 'string',
                description: 'Search for messages containing this text (optional)',
              },
            },
          },
        },
        {
          name: 'get_message_by_id',
          description: 'Fetch a specific message by its unified ID (format: platform-originalId)',
          inputSchema: {
            type: 'object',
            properties: {
              messageId: {
                type: 'string',
                description: 'The unified message ID (e.g., "slack-C123-1234567890.123456")',
              },
            },
            required: ['messageId'],
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
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'get_recent_messages':
          return await this.handleGetRecentMessages(request.params.arguments);
        
        case 'get_message_by_id':
          return await this.handleGetMessageById(request.params.arguments);
        
        case 'get_platform_status':
          return await this.handleGetPlatformStatus();
        
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  private async handleGetRecentMessages(args: any) {
    const options: FetchOptions = {
      limit: args.limit || 50,
      since: args.since,
      platforms: args.platforms,
      searchTerm: args.searchTerm,
    };

    const sinceDate = options.since ? new Date(options.since) : undefined;
    
    // Filter adapters by platform if specified
    const activeAdapters = options.platforms
      ? this.adapters.filter(a => options.platforms!.includes(a.name))
      : this.adapters;

    // Fetch messages from all configured adapters in parallel
    const messagePromises = activeAdapters
      .filter(adapter => adapter.isConfigured())
      .map(adapter => adapter.fetchRecentMessages(options.limit, sinceDate));

    const messageArrays = await Promise.all(messagePromises);
    let allMessages = messageArrays.flat();

    // Apply search filter if provided
    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      allMessages = allMessages.filter(msg =>
        msg.content.text.toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp descending (most recent first)
    allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Limit to requested number
    allMessages = allMessages.slice(0, options.limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            count: allMessages.length,
            messages: allMessages,
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetMessageById(args: any) {
    const messageId = args.messageId as string;

    // Extract platform from message ID
    const platform = messageId.split('-')[0];
    const adapter = this.adapters.find(a => a.name === platform);

    if (!adapter || !adapter.isConfigured()) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Platform ${platform} is not configured or not found`,
            }),
          },
        ],
      };
    }

    const message = await adapter.getMessageById(messageId);

    if (!message) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Message not found: ${messageId}`,
            }),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(message, null, 2),
        },
      ],
    };
  }

  private async handleGetPlatformStatus() {
    const status = this.adapters.map(adapter => ({
      platform: adapter.name,
      configured: adapter.isConfigured(),
      displayName: this.getPlatformDisplayName(adapter.name),
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            platforms: status,
            configuredCount: status.filter(s => s.configured).length,
            totalCount: status.length,
          }, null, 2),
        },
      ],
    };
  }

  private getPlatformDisplayName(platform: string): string {
    const names: Record<string, string> = {
      sms: 'SMS',
      slack: 'Slack',
      gchat: 'Google Chat',
      whatsapp: 'WhatsApp',
    };
    return names[platform] || platform;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Universal Messaging MCP Server running on stdio');
  }
}

// Start the server
const server = new UniversalMessagingServer();
server.run().catch(console.error);
