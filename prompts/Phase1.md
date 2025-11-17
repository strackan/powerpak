```markdown
# Universal Messenger MCP Dataplane - Complete Build Guide

## Project Overview

Build a universal instant messenger aggregator that:
- Connects to multiple chat platforms (Slack, Teams, WhatsApp, SMS)
- Aggregates all messages into a unified interface
- Routes replies back to the correct platform
- Runs entirely over MCP protocol
- Works with Claude Desktop and Claude Code

---

## Phase 1: Project Scaffolding & Foundation (Days 1-2)

### Objective
Set up the monorepo structure, tooling, and basic platform connections.

### Initial Setup

```bash
# Create project directory
mkdir universal-messenger-mcp
cd universal-messenger-mcp

# Initialize git
git init
echo "node_modules/\n.env\ndist/\nbuild/\n*.log" > .gitignore

# Initialize root package.json (monorepo)
npm init -y
```

### Monorepo Structure

```
universal-messenger-mcp/
├── packages/
│   ├── server/              # MCP server (core aggregation engine)
│   ├── client/              # Electron/web client UI
│   └── cli/                 # CLI tools for Claude Code
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   └── MCP_INTEGRATION.md
├── config/
│   ├── platforms.example.json
│   └── .env.example
├── scripts/
│   └── setup-worktrees.sh
├── package.json             # Root package (workspace manager)
├── tsconfig.json            # Root TypeScript config
└── README.md
```

### Task 1: Set Up Monorepo

```bash
# Install workspace tools
npm install -D typescript @types/node turbo

# Create root package.json with workspaces
```

**package.json:**
```json
{
  "name": "universal-messenger-mcp",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.0",
    "turbo": "^1.11.0"
  }
}
```

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    }
  }
}
```

**Root tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### Task 2: Create Server Package (MCP Core)

```bash
mkdir -p packages/server/src
cd packages/server
npm init -y
```

**packages/server/package.json:**
```json
{
  "name": "@universal-messenger/server",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "vitest",
    "lint": "eslint src --ext .ts",
    "mcp:test": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4",
    "@slack/web-api": "^7.0.0",
    "@microsoft/microsoft-graph-client": "^3.0.7",
    "express": "^4.18.2",
    "better-sqlite3": "^9.2.2",
    "dotenv": "^16.3.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "vitest": "^1.0.4",
    "@types/express": "^4.17.21",
    "@types/better-sqlite3": "^7.6.8"
  }
}
```

**packages/server/tsconfig.json:**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Task 3: Basic MCP Server Structure

```bash
cd packages/server
mkdir -p src/{mcp,platforms,store,auth,webhooks,types}
```

**packages/server/src/index.ts:**
```typescript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { MessageStore } from './store/message-store.js';
import { setupPlatforms } from './platforms/index.js';

const MESSAGE_STORE = new MessageStore();

const server = new Server(
  {
    name: 'universal-messenger',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// List available MCP resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'messenger://conversations',
        name: 'All Conversations',
        description: 'List all conversations across all platforms',
        mimeType: 'application/json',
      },
      {
        uri: 'messenger://messages/unread',
        name: 'Unread Messages',
        description: 'All unread messages',
        mimeType: 'application/json',
      },
      {
        uri: 'messenger://platforms',
        name: 'Platform Status',
        description: 'Connected platforms and their status',
        mimeType: 'application/json',
      },
    ],
  };
});

// Read specific resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === 'messenger://conversations') {
    const conversations = await MESSAGE_STORE.getConversations();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(conversations, null, 2),
        },
      ],
    };
  }

  if (uri === 'messenger://messages/unread') {
    const unread = await MESSAGE_STORE.getUnreadMessages();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(unread, null, 2),
        },
      ],
    };
  }

  if (uri === 'messenger://platforms') {
    const platforms = await MESSAGE_STORE.getPlatformStatus();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(platforms, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'send_message',
        description: 'Send a message to a conversation (routes to correct platform)',
        inputSchema: {
          type: 'object',
          properties: {
            conversation_id: {
              type: 'string',
              description: 'The conversation ID to send to',
            },
            content: {
              type: 'string',
              description: 'The message content',
            },
          },
          required: ['conversation_id', 'content'],
        },
      },
      {
        name: 'mark_read',
        description: 'Mark a message as read',
        inputSchema: {
          type: 'object',
          properties: {
            message_id: {
              type: 'string',
              description: 'The message ID to mark as read',
            },
          },
          required: ['message_id'],
        },
      },
      {
        name: 'search_messages',
        description: 'Search messages across all platforms',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'send_message') {
    const { conversation_id, content } = args as { conversation_id: string; content: string };
    const result = await MESSAGE_STORE.sendMessage(conversation_id, content);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  if (name === 'mark_read') {
    const { message_id } = args as { message_id: string };
    await MESSAGE_STORE.markRead(message_id);
    return {
      content: [
        {
          type: 'text',
          text: `Marked message ${message_id} as read`,
        },
      ],
    };
  }

  if (name === 'search_messages') {
    const { query } = args as { query: string };
    const results = await MESSAGE_STORE.searchMessages(query);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  console.error('Starting Universal Messenger MCP Server...');
  
  // Set up platform connections
  await setupPlatforms(MESSAGE_STORE);
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Universal Messenger MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

### Task 4: Core Types

**packages/server/src/types/index.ts:**
```typescript
export enum Platform {
  SLACK = 'slack',
  TEAMS = 'teams',
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
}

export interface Message {
  id: string;
  conversation_id: string;
  platform: Platform;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  read: boolean;
  platform_message_id: string;
}

export interface Conversation {
  id: string;
  platform: Platform;
  title: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  last_message?: Message;
  unread_count: number;
  platform_conversation_id: string;
}

export interface PlatformConfig {
  enabled: boolean;
  credentials: Record<string, string>;
}

export interface PlatformStatus {
  platform: Platform;
  connected: boolean;
  last_sync?: Date;
  error?: string;
}
```

### Task 5: Message Store (Stub)

**packages/server/src/store/message-store.ts:**
```typescript
import { Message, Conversation, Platform, PlatformStatus } from '../types/index.js';

export class MessageStore {
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message> = new Map();
  private platformStatus: Map<Platform, PlatformStatus> = new Map();

  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values());
  }

  async getUnreadMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).filter((m) => !m.read);
  }

  async getPlatformStatus(): Promise<PlatformStatus[]> {
    return Array.from(this.platformStatus.values());
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    // Stub: will implement routing in Phase 3
    console.log(`Sending message to ${conversationId}: ${content}`);
    
    const message: Message = {
      id: `msg_${Date.now()}`,
      conversation_id: conversationId,
      platform: Platform.SLACK, // Will be determined by conversation
      sender: { id: 'me', name: 'Me' },
      content,
      timestamp: new Date(),
      read: true,
      platform_message_id: '',
    };
    
    this.messages.set(message.id, message);
    return message;
  }

  async markRead(messageId: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.read = true;
    }
  }

  async searchMessages(query: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter((m) =>
      m.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Internal methods for platform adapters to use
  addMessage(message: Message): void {
    this.messages.set(message.id, message);
    
    // Update conversation's last message
    const conv = this.conversations.get(message.conversation_id);
    if (conv) {
      conv.last_message = message;
      if (!message.read) {
        conv.unread_count++;
      }
    }
  }

  addConversation(conversation: Conversation): void {
    this.conversations.set(conversation.id, conversation);
  }

  setPlatformStatus(status: PlatformStatus): void {
    this.platformStatus.set(status.platform, status);
  }
}
```

### Task 6: Platform Setup (Stub)

**packages/server/src/platforms/index.ts:**
```typescript
import { MessageStore } from '../store/message-store.js';
import { Platform } from '../types/index.js';

export async function setupPlatforms(store: MessageStore): Promise<void> {
  console.error('Setting up platform connections...');
  
  // Stub: will implement actual connections in Phase 2
  store.setPlatformStatus({
    platform: Platform.SLACK,
    connected: false,
    error: 'Not implemented yet',
  });
  
  store.setPlatformStatus({
    platform: Platform.TEAMS,
    connected: false,
    error: 'Not implemented yet',
  });
  
  store.setPlatformStatus({
    platform: Platform.WHATSAPP,
    connected: false,
    error: 'Not implemented yet',
  });
  
  store.setPlatformStatus({
    platform: Platform.SMS,
    connected: false,
    error: 'Not implemented yet',
  });
  
  console.error('Platform setup complete (stub mode)');
}
```

### Task 7: Configuration Files

**config/platforms.example.json:**
```json
{
  "slack": {
    "enabled": true,
    "clientId": "your-slack-client-id",
    "clientSecret": "your-slack-client-secret",
    "signingSecret": "your-slack-signing-secret"
  },
  "teams": {
    "enabled": true,
    "clientId": "your-teams-client-id",
    "clientSecret": "your-teams-client-secret",
    "tenantId": "your-tenant-id"
  },
  "whatsapp": {
    "enabled": true,
    "phoneNumberId": "your-phone-number-id",
    "accessToken": "your-whatsapp-access-token",
    "verifyToken": "your-verify-token"
  },
  "sms": {
    "enabled": true,
    "provider": "twilio",
    "accountSid": "your-twilio-sid",
    "authToken": "your-twilio-token",
    "phoneNumber": "your-twilio-number"
  }
}
```

**config/.env.example:**
```bash
# Slack
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_SIGNING_SECRET=
SLACK_BOT_TOKEN=

# Microsoft Teams
TEAMS_CLIENT_ID=
TEAMS_CLIENT_SECRET=
TEAMS_TENANT_ID=

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=

# Twilio (SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Server
PORT=3000
NODE_ENV=development
```

### Task 8: Git Worktree Setup

**scripts/setup-worktrees.sh:**
```bash
#!/bin/bash

# Set up git worktrees for phase-based development
echo "Setting up git worktrees..."

git worktree add ../universal-messenger-phase1 -b phase1
git worktree add ../universal-messenger-phase2 -b phase2
git worktree add ../universal-messenger-phase3 -b phase3
git worktree add ../universal-messenger-phase4 -b phase4
git worktree add ../universal-messenger-phase5 -b phase5

echo "Worktrees created:"
git worktree list

echo "
To work on a specific phase:
  cd ../universal-messenger-phase1
  # Make changes
  git add .
  git commit -m 'Phase 1: ...'
  git push origin phase1

To merge phase into main:
  git checkout main
  git merge phase1
"
```

```bash
chmod +x scripts/setup-worktrees.sh
```

### Task 9: Documentation

**README.md:**
```markdown
# Universal Messenger MCP Dataplane

AI-native universal messaging aggregator built on Model Context Protocol (MCP).

## Features

- **Unified Inbox**: All messages from Slack, Teams, WhatsApp, SMS in one place
- **Smart Routing**: Replies automatically route to the correct platform
- **MCP Native**: Works with Claude Desktop, Claude Code, and any MCP client
- **Local-First**: Your messages stay on your machine
- **Open Protocol**: Built on Anthropic's Model Context Protocol

## Quick Start

```bash
# Install dependencies
npm install

# Set up configuration
cp config/.env.example .env
cp config/platforms.example.json config/platforms.json
# Edit both files with your credentials

# Start the MCP server
cd packages/server
npm run dev

# In another terminal, start the client
cd packages/client
npm run dev
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical details.

## Development

This is a monorepo using npm workspaces:

```bash
# Run all packages in dev mode
npm run dev

# Build all packages
npm run build

# Run tests
npm run test

# Work on specific phases
./scripts/setup-worktrees.sh
cd ../universal-messenger-phase1
```

## MCP Integration

Once built, add to Claude Desktop's config:

```json
{
  "mcpServers": {
    "universal-messenger": {
      "command": "node",
      "args": ["/path/to/packages/server/dist/index.js"]
    }
  }
}
```

Then in Claude Desktop:
- "Check my messages"
- "Reply to Sarah that I'll be there in 10 minutes"
- "Summarize my urgent messages from today"

## License

MIT
```

**docs/ARCHITECTURE.md:**
```markdown
# Architecture

## Overview

Universal Messenger is built in three layers:

1. **Platform Adapters**: Connect to each messaging platform's API
2. **MCP Server**: Aggregates messages and exposes unified MCP interface
3. **Clients**: UI app, Claude Desktop, Claude Code all use MCP protocol

## Data Flow

```
[Slack API] ─┐
[Teams API] ─┤
[WhatsApp] ──┼─→ [Platform Adapters] ─→ [Message Store] ─→ [MCP Server] ─→ [Clients]
[SMS/Twilio]─┘
```

## Components

### Platform Adapters (`src/platforms/`)
- Authenticate with each platform
- Translate platform-specific formats to unified Message type
- Handle webhooks for real-time updates
- Route outbound messages back to platforms

### Message Store (`src/store/`)
- SQLite database for persistence
- In-memory cache for fast access
- Conversation threading
- Deduplication logic

### MCP Server (`src/mcp/`)
- Exposes resources (conversations, messages, platform status)
- Provides tools (send_message, mark_read, search)
- stdio transport for local use
- SSE transport for cloud deployment (future)

### Client (`packages/client/`)
- Electron app with React UI
- Connects to MCP server via stdio
- Real-time message updates
- Desktop notifications

## MCP Protocol Usage

### Resources

- `messenger://conversations` - All conversations across platforms
- `messenger://messages/unread` - Unread messages only
- `messenger://platforms` - Connection status

### Tools

- `send_message(conversation_id, content)` - Send reply
- `mark_read(message_id)` - Mark as read
- `search_messages(query)` - Search all messages

## Security

- OAuth tokens encrypted at rest
- No message content stored in logs
- Platform credentials in environment variables only
- Local-first architecture (no cloud storage)
```

### Acceptance Criteria - Phase 1

At the end of Phase 1, you should have:

- ✅ Monorepo structure set up with npm workspaces
- ✅ Server package scaffolded with TypeScript
- ✅ MCP server skeleton that starts without errors
- ✅ Basic types defined (Message, Conversation, Platform)
- ✅ Message store stub that compiles
- ✅ Configuration files and examples
- ✅ Git worktrees ready for phase-based development
- ✅ Documentation (README, ARCHITECTURE)

### Testing Phase 1

```bash
# Install all dependencies
npm install

# Build the server
cd packages/server
npm run build

# Test that MCP server starts
npm run mcp:test

# Should see:
# Starting Universal Messenger MCP Server...
# Setting up platform connections...
# Platform setup complete (stub mode)
# Universal Messenger MCP Server running on stdio
```

### Next Steps

Once Phase 1 is complete:
- Move to Phase 2: Implement authentication and platform connections
- The foundation is ready for real integration work
- All stubbed functions will be implemented with actual logic

---

**Phase 1 Complete! Ready for Phase 2.**
```