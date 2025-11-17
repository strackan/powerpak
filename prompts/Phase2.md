## Phase 2: Authentication & MCP Server Core (Days 3-5)

### Objective
Implement OAuth flows for each platform and build the core MCP server that exposes unified messaging resources.

### Tasks

1. **Authentication Infrastructure**
````
   src/auth/
   ├── providers/
   │   ├── slack-auth.ts
   │   ├── teams-auth.ts
   │   ├── whatsapp-auth.ts
   │   └── sms-auth.ts
   ├── token-manager.ts
   └── auth-router.ts
````

   - Implement OAuth 2.0 flows for Slack, Teams
   - WhatsApp Business API authentication
   - SMS provider (Twilio) authentication
   - Secure token storage (encrypted JSON file initially, env vars for sensitive data)
   - Token refresh logic

2. **MCP Server Implementation**
````
   src/mcp/
   ├── server.ts          # Main MCP server using @modelcontextprotocol/sdk
   ├── resources/         # MCP resources (conversations, messages)
   ├── tools/             # MCP tools (send message, mark read, etc.)
   └── prompts/           # MCP prompts (optional)
````

   **Key MCP Resources to Expose:**
   - `messenger://conversations` - List of all conversations across platforms
   - `messenger://conversations/{id}` - Specific conversation with messages
   - `messenger://messages/unread` - All unread messages
   - `messenger://platforms` - Connected platforms status

   **Key MCP Tools to Implement:**
   - `send_message(conversation_id, content)` - Send reply to correct platform
   - `mark_read(message_id)` - Mark message as read
   - `search_messages(query)` - Search across all platforms
   - `get_conversation_context(conversation_id)` - Get full thread context

3. **Webhook Receivers**
````
   src/webhooks/
   ├── slack-webhook.ts
   ├── teams-webhook.ts
   ├── whatsapp-webhook.ts
   └── webhook-router.ts
````

   - Implement webhook endpoints for each platform
   - Parse incoming messages into unified format
   - Trigger MCP resource updates
   - Handle real-time message delivery

### Acceptance Criteria
- All 4 platforms can authenticate successfully
- Tokens are stored securely and refresh automatically
- MCP server starts and exposes resources via stdio
- Can query `messenger://conversations` from Claude Desktop
- Webhooks receive and parse messages correctly

### Testing
````bash
# Test MCP server
npm run mcp:test

# Test authentication
npm run auth:test

# Test webhook parsing
npm run webhook:test
````

---

## Phase 3: Message Aggregation & Routing Engine (Days 6-8)

### Objective
Build the core business logic that aggregates messages and routes responses.

### Tasks

1. **Message Store**
````
   src/store/
   ├── message-store.ts      # In-memory store with persistence
   ├── conversation-store.ts
   └── sync-engine.ts        # Keeps store in sync with platforms
````

   - SQLite database for message persistence
   - In-memory cache for fast access
   - Conversation threading logic
   - Deduplication (same message from multiple sources)
   - Message status tracking (sent, delivered, read)

2. **Aggregation Engine**
````
   src/aggregation/
   ├── message-aggregator.ts
   ├── priority-ranker.ts
   └── notification-manager.ts
````

   - Merge messages from all platforms
   - Intelligent prioritization (urgent keywords, important contacts, etc.)
   - Group related messages into conversations
   - Real-time update stream

3. **Routing Engine**
````
   src/routing/
   ├── message-router.ts
   ├── platform-sender.ts
   └── delivery-tracker.ts
````

   - Route outbound messages to correct platform
   - Handle platform-specific formatting (mentions, emojis, attachments)
   - Retry logic for failed sends
   - Delivery confirmation tracking

4. **MCP Tool Implementation**
   - Wire tools to routing engine
   - Implement `send_message` with automatic platform detection
   - Add conversation context to tool responses
   - Error handling and user feedback

### Acceptance Criteria
- Messages from all platforms appear in unified store
- Can send message via MCP tool and it routes correctly
- Conversations are threaded properly
- Message status updates in real-time
- No duplicate messages

### Testing
````bash
# Send test message from each platform
npm run test:send-all

# Verify routing
npm run test:routing

# Load test with 100+ messages
npm run test:load
````

---

## Phase 4: Client Application (Days 9-12)

### Objective
Build a minimal but functional UI to view and respond to messages.

### Tasks

1. **Technology Choice**
   
   **Recommended: Electron + React + Tailwind**
   - Cross-platform (Mac/Windows/Linux)
   - Can package MCP server inside app
   - Native system tray integration
   - Local-first architecture

   Alternative: Web app with Next.js (if you prefer web-first)

2. **Client Structure**
````
   client/
   ├── src/
   │   ├── main/              # Electron main process
   │   │   ├── mcp-bridge.ts  # Communicates with MCP server
   │   │   └── main.ts
   │   ├── renderer/          # React UI
   │   │   ├── components/
   │   │   │   ├── ConversationList.tsx
   │   │   │   ├── MessageThread.tsx
   │   │   │   ├── MessageInput.tsx
   │   │   │   └── PlatformBadge.tsx
   │   │   ├── hooks/
   │   │   │   └── useMCP.ts
   │   │   └── App.tsx
   │   └── preload/
   │       └── preload.ts     # Secure IPC bridge
   ├── package.json
   └── electron-builder.yml
````

3. **Core UI Components**

   **Conversation List (Left Panel)**
   - Show all conversations sorted by recent activity
   - Display platform badges (Slack icon, Teams icon, etc.)
   - Unread count per conversation
   - Search/filter conversations
   - Priority indicators

   **Message Thread (Main Panel)**
   - Show selected conversation
   - Messages grouped by sender
   - Platform-specific formatting preserved
   - Timestamps
   - Message status (sending, sent, delivered, read)

   **Message Input (Bottom)**
   - Rich text composer
   - @ mentions (when supported by platform)
   - Emoji picker
   - File attachment (future)
   - Send to all platforms in conversation (if multi-platform thread)

   **Status Bar (Top)**
   - Connected platforms indicator
   - Sync status
   - Settings button

4. **MCP Bridge**
````typescript
   // client/src/main/mcp-bridge.ts
   
   import { Client } from '@modelcontextprotocol/sdk/client/index.js';
   import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
   
   class MCPBridge {
     private client: Client;
     
     async connect() {
       const transport = new StdioClientTransport({
         command: 'node',
         args: ['../../dist/index.js'], // Path to MCP server
       });
       
       this.client = new Client({
         name: 'universal-messenger-client',
         version: '1.0.0',
       }, {
         capabilities: {}
       });
       
       await this.client.connect(transport);
     }
     
     async getConversations() {
       return await this.client.request({
         method: 'resources/list'
       }, { uri: 'messenger://conversations' });
     }
     
     async sendMessage(conversationId: string, content: string) {
       return await this.client.request({
         method: 'tools/call'
       }, {
         name: 'send_message',
         arguments: { conversation_id: conversationId, content }
       });
     }
   }
````

5. **Real-time Updates**
   - MCP server emits events on new messages
   - Client listens and updates UI instantly
   - Desktop notifications for new messages
   - System tray badge with unread count

### Acceptance Criteria
- Client launches and connects to MCP server
- Can see all conversations from all platforms
- Can click into a conversation and see message history
- Can type a reply and it sends to correct platform
- Receives new messages in real-time
- Clean, usable UI (doesn't need to be beautiful yet)

### Testing
````bash
# Launch client in dev mode
npm run client:dev

# Build production app
npm run client:build

# Test end-to-end flow
npm run test:e2e
````

---

## Phase 5: Claude Desktop & Claude Code Integration (Days 13-15)

### Objective
Make the MCP server discoverable and usable from Claude Desktop and Claude Code.

### Tasks

1. **Claude Desktop Configuration**
   
   Create installer/config script:
````typescript
   // scripts/install-claude-desktop.ts
   
   import fs from 'fs';
   import os from 'os';
   import path from 'path';
   
   const configPath = path.join(
     os.homedir(),
     'Library/Application Support/Claude/claude_desktop_config.json'
   );
   
   const config = {
     mcpServers: {
       "universal-messenger": {
         command: "node",
         args: [path.join(__dirname, "../dist/index.js")],
         env: {
           // Add any required env vars
         }
       }
     }
   };
   
   // Merge with existing config
   const existing = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
   fs.writeFileSync(
     configPath,
     JSON.stringify({ ...existing, mcpServers: { ...existing.mcpServers, ...config.mcpServers }}, null, 2)
   );
````

2. **Enhanced MCP Prompts**
   
   Make the MCP server easy to use from Claude:
````typescript
   // src/mcp/prompts.ts
   
   const prompts = [
     {
       name: "check_messages",
       description: "Check all unread messages across platforms",
       arguments: []
     },
     {
       name: "reply_to_thread",
       description: "Reply to a specific conversation",
       arguments: [
         { name: "conversation_id", required: true },
         { name: "message", required: true }
       ]
     },
     {
       name: "summarize_conversations",
       description: "Get summary of recent conversations",
       arguments: [
         { name: "hours", required: false, default: 24 }
       ]
     }
   ];
````

3. **Claude Code Integration**
   
   Create a CLI interface for Claude Code:
````typescript
   // src/cli/messenger-cli.ts
   
   import { Command } from 'commander';
   
   const program = new Command();
   
   program
     .name('messenger')
     .description('Universal Messenger CLI for Claude Code')
     .version('1.0.0');
   
   program
     .command('check')
     .description('Check unread messages')
     .action(async () => {
       // Connect to MCP server, fetch unread
     });
   
   program
     .command('send')
     .description('Send a message')
     .argument('<conversation>', 'Conversation ID')
     .argument('<message>', 'Message content')
     .action(async (conversation, message) => {
       // Route message via MCP
     });
   
   program.parse();
````

4. **Documentation for AI Usage**
````markdown
   # Universal Messenger - AI Integration Guide
   
   ## For Claude Desktop Users
   
   After installation, you can ask Claude to:
   
   - "Check my messages" → Claude will use `messenger://messages/unread`
   - "Reply to [person]" → Claude will find the conversation and use `send_message` tool
   - "What did [person] say about [topic]?" → Claude will search message history
   
   ## For Claude Code Users
```bash
   # Check messages while coding
   messenger check
   
   # Send quick reply
   messenger send conv_123 "Thanks, I'll look at that PR now"
   
   # Search for context
   messenger search "deployment issues"
```
   
   ## MCP Resources Available
   
   - `messenger://conversations` - All conversations
   - `messenger://messages/unread` - Unread messages only
   - `messenger://platforms` - Platform connection status
   - `messenger://search?q=query` - Search messages
   
   ## MCP Tools Available
   
   - `send_message(conversation_id, content)` - Send reply
   - `mark_read(message_id)` - Mark as read
   - `get_context(conversation_id)` - Get full thread
   - `search_messages(query)` - Search all messages
````

### Acceptance Criteria
- MCP server appears in Claude Desktop's server list
- Can ask Claude Desktop to check messages
- Claude Desktop can send replies using the MCP tools
- Claude Code can execute CLI commands
- Documentation is clear and tested

### Testing
````bash
# Test Claude Desktop integration
npm run test:claude-desktop

# Test Claude Code CLI
npm run test:cli

# Verify MCP protocol compliance
npm run test:mcp-compliance
````

---

## Phase 6: Polish & Deploy (Days 16-20)

### Objective
Make it production-ready, packageable, and shareable.

### Tasks

1. **Error Handling & Resilience**
   - Graceful degradation if one platform fails
   - Retry logic with exponential backoff
   - User-friendly error messages
   - Logging and debugging tools

2. **Configuration Management**
````
   config/
   ├── default.json
   ├── development.json
   └── production.json
````
   - Platform credentials
   - Webhook URLs
   - Message filtering rules
   - Notification preferences

3. **Packaging**
   - Electron app installer (Mac .dmg, Windows .exe, Linux .AppImage)
   - Docker container for server-only mode
   - npm package for CLI tools
   - Homebrew formula (optional)

4. **Documentation**
````
   docs/
   ├── README.md
   ├── SETUP.md              # Getting started guide
   ├── ARCHITECTURE.md       # Technical overview
   ├── MCP_INTEGRATION.md    # Claude Desktop/Code usage
   ├── PLATFORM_SETUP.md     # OAuth for each platform
   └── API.md                # MCP resources and tools reference
````

5. **Demo & Marketing**
   - Record demo video showing all platforms → unified view → reply → routed correctly
   - Claude Desktop integration demo
   - GitHub README with screenshots
   - Blog post explaining the architecture

### Acceptance Criteria
- Can install on fresh machine in < 10 minutes
- All platforms connect successfully
- Messages flow bidirectionally without loss
- Clean, professional documentation
- Demo-ready for showing others

---

## MVP Success Criteria (End of 20 Days)

You should be able to:

1. ✅ **Connect 4+ messaging platforms** (Slack, Teams, WhatsApp, SMS at minimum)
2. ✅ **See all messages in one unified interface** (client app)
3. ✅ **Reply to any message** and it routes to the correct platform
4. ✅ **Use from Claude Desktop** ("Claude, check my messages and summarize urgent ones")
5. ✅ **Use from Claude Code** while coding (`messenger check` in terminal)
6. ✅ **Everything runs via MCP protocol** (no proprietary APIs)

---

## Tech Stack Summary

**Backend (MCP Server):**
- Node.js + TypeScript
- @modelcontextprotocol/sdk
- Express (webhooks)
- SQLite (message store)
- Platform SDKs: @slack/web-api, @microsoft/microsoft-graph-client, etc.

**Client:**
- Electron (recommended) or Next.js (alternative)
- React + TypeScript
- Tailwind CSS
- @modelcontextprotocol/sdk/client

**Infrastructure:**
- stdio transport for local MCP (Claude Desktop)
- SSE transport for remote MCP (future cloud version)
- Webhooks (ngrok for local dev, real URLs for prod)

---

## Repository Structure
````
universal-messenger-mcp/
├── .git/
├── packages/
│   ├── server/           # MCP server (Phase 1-3)
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── client/           # Electron app (Phase 4)
│   │   ├── src/
│   │   ├── package.json
│   │   └── electron-builder.yml
│   └── cli/              # CLI tools (Phase 5)
│       ├── src/
│       └── package.json
├── docs/
├── config/
├── scripts/
│   └── install-claude-desktop.ts
├── package.json          # Root package (monorepo)
├── turbo.json            # Turborepo config (optional)
└── README.md
````

---

## Getting Started Commands
````bash
# Clone and setup
git clone <repo-url>
cd universal-messenger-mcp
npm install

# Set up git worktrees for phase-based development
git worktree add ../messenger-phase1 -b phase1
git worktree add ../messenger-phase2 -b phase2
# etc.

# Start development
cd packages/server
npm run dev

# In another terminal, start client
cd packages/client
npm run dev

# Test MCP integration
npm run mcp:test
````

---

## Extra Credit: Advanced Features (Post-MVP)

Once the MVP works, consider:

1. **Smart Reply Suggestions** - AI-generated reply options based on message context
2. **Cross-Platform Threads** - Link related conversations across platforms
3. **Message Templates** - Pre-written responses for common scenarios
4. **Analytics Dashboard** - Response time, platform usage stats
5. **Team Mode** - Share message routing with team members
6. **Mobile App** - React Native version
7. **Voice Integration** - Voice-to-text for quick replies
8. **Calendar Integration** - Auto-reply when in meetings
9. **SSE Transport** - Cloud-hosted version (not just local)
10. **Plugin System** - Let users add custom platforms

---

## Questions to Resolve During Build

1. **How to handle platform-specific features?** (e.g., Slack threads, Teams channels)
   - Start with lowest common denominator (basic messages)
   - Add platform-specific metadata later

2. **Should we support group chats differently from 1:1?**
   - MVP: Treat all as "conversations"
   - Future: Add group-specific features

3. **How to handle attachments/rich media?**
   - MVP: Text only
   - Phase 2: Download and re-upload attachments

4. **Rate limiting from platforms?**
   - Implement respectful rate limiting
   - Queue messages if needed

5. **How to handle message editing/deletion?**
   - MVP: Show edits as new messages
   - Future: True edit/delete support

---

## Success Looks Like

In 20 days, you should be able to:

1. Open your Universal Messenger app
2. See recent messages from Slack, Teams, WhatsApp, and SMS all in one list
3. Click on a conversation
4. Type a reply and hit send
5. Watch it appear in the correct platform
6. Open Claude Desktop and say "Check my urgent messages"
7. Claude uses your MCP server to fetch and summarize
8. Ask Claude "Reply to Sarah that I'll join the call in 5 min"
9. Claude sends the message via your MCP server
10. Sarah receives it in whatever platform she messaged you from

**That's the vision. Let's build it.**

---

## Next Steps

1. Copy this entire prompt to Claude Code
2. Let it scaffold the project structure
3. Start with Phase 1 (project setup)
4. Review and iterate on each phase
5. Keep this document updated as you make architectural decisions

Ready to start? Let's go! 🚀