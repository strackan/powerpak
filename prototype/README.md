# Universal Messaging MCP Server

An MCP (Model Context Protocol) server that aggregates inbound messages from multiple messaging platforms into a unified interface.

## Supported Platforms

- ✅ **SMS** (via Twilio)
- ✅ **Slack**
- ✅ **Google Chat**
- ✅ **WhatsApp** (via Twilio)

## Features

- **Unified Message Format**: All messages from different platforms are normalized into a consistent structure
- **Parallel Fetching**: Retrieves messages from all platforms simultaneously for better performance
- **Platform Filtering**: Query specific platforms or all at once
- **Search Capability**: Search across all messages for specific content
- **Timestamp Sorting**: Messages are automatically sorted by time (most recent first)
- **Flexible Configuration**: Only configure the platforms you need

## Installation

```bash
cd universal-messaging-mcp
npm install
npm run build
```

## Configuration

### 1. Copy the environment template

```bash
cp .env.example .env
```

### 2. Configure your platforms

You only need to configure the platforms you want to use. The server will work with any combination.

#### SMS (via Twilio)

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

Get credentials from: https://console.twilio.com/

#### Slack

```env
SLACK_BOT_TOKEN=xoxb-your-token-here
```

Get credentials:
1. Go to https://api.slack.com/apps
2. Create a new app or select existing
3. Navigate to "OAuth & Permissions"
4. Add these Bot Token Scopes:
   - `channels:history`
   - `channels:read`
   - `groups:history`
   - `groups:read`
   - `im:history`
   - `im:read`
   - `users:read`
5. Install app to workspace
6. Copy "Bot User OAuth Token"

#### Google Chat

```env
GOOGLE_CHAT_CREDENTIALS_PATH=./google-credentials.json
GOOGLE_CHAT_SPACE_NAME=spaces/AAAAxxxxxxxx
```

Get credentials:
1. Go to https://console.cloud.google.com/
2. Create a service account
3. Enable Google Chat API
4. Download credentials JSON
5. Get space name from Chat room URL

#### WhatsApp (via Twilio)

```env
WHATSAPP_NUMBER=whatsapp:+14155238886
```

Uses same Twilio credentials as SMS. Get WhatsApp number from Twilio console.

## Usage

### As an MCP Server

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "universal-messaging": {
      "command": "node",
      "args": ["/path/to/universal-messaging-mcp/dist/index.js"],
      "env": {
        "TWILIO_ACCOUNT_SID": "your_sid",
        "TWILIO_AUTH_TOKEN": "your_token",
        "TWILIO_PHONE_NUMBER": "+1234567890",
        "SLACK_BOT_TOKEN": "xoxb-your-token",
        "GOOGLE_CHAT_CREDENTIALS_PATH": "/path/to/credentials.json",
        "GOOGLE_CHAT_SPACE_NAME": "spaces/xxxxx",
        "WHATSAPP_NUMBER": "whatsapp:+14155238886"
      }
    }
  }
}
```

### Available Tools

#### 1. `get_recent_messages`

Fetch recent messages from all configured platforms.

**Arguments:**
- `limit` (optional): Maximum number of messages to return (default: 50)
- `since` (optional): ISO date string to fetch messages after this time
- `platforms` (optional): Array of platforms to query: `['sms', 'slack', 'gchat', 'whatsapp']`
- `searchTerm` (optional): Search for messages containing this text

**Example:**
```javascript
{
  "limit": 20,
  "since": "2025-11-17T00:00:00Z",
  "platforms": ["slack", "sms"],
  "searchTerm": "renewal"
}
```

**Response:**
```json
{
  "count": 20,
  "messages": [
    {
      "id": "slack-C123-1234567890.123456",
      "platform": "slack",
      "sender": {
        "id": "U123",
        "name": "John Smith",
        "email": "john@example.com"
      },
      "content": {
        "text": "Hey, can we discuss the renewal?",
        "attachments": []
      },
      "timestamp": "2025-11-17T10:30:00Z",
      "channel": {
        "id": "C123",
        "name": "customer-success"
      }
    }
  ]
}
```

#### 2. `get_message_by_id`

Fetch a specific message by its unified ID.

**Arguments:**
- `messageId`: The unified message ID (e.g., "slack-C123-1234567890.123456")

#### 3. `get_platform_status`

Check which messaging platforms are currently configured and available.

**Response:**
```json
{
  "platforms": [
    { "platform": "sms", "configured": true, "displayName": "SMS" },
    { "platform": "slack", "configured": true, "displayName": "Slack" },
    { "platform": "gchat", "configured": false, "displayName": "Google Chat" },
    { "platform": "whatsapp", "configured": true, "displayName": "WhatsApp" }
  ],
  "configuredCount": 3,
  "totalCount": 4
}
```

## Testing

Run the test client to verify everything is working:

```bash
npm run dev  # Start the server
# In another terminal:
npx ts-node test-client.ts
```

## Using with Claude

Once configured, you can ask Claude things like:

- "Show me my recent messages from all platforms"
- "What Slack messages did I get today?"
- "Search my messages for 'renewal'"
- "Show me SMS messages from the last hour"

Claude will use the MCP tools to fetch and aggregate your messages.

## Message Format

All messages are normalized to this structure:

```typescript
{
  id: string;                    // Unique ID: platform-originalId
  platform: 'sms' | 'slack' | 'gchat' | 'whatsapp';
  sender: {
    id: string;                  // Platform-specific user ID
    name: string;                // Display name
    phone?: string;              // For SMS/WhatsApp
    email?: string;              // For Slack/GChat
  };
  content: {
    text: string;                // Message text
    attachments?: Array;         // Files, images, etc.
  };
  timestamp: Date;               // When message was sent
  threadId?: string;             // For threaded conversations
  channel?: {
    id: string;                  // Channel/room ID
    name: string;                // Channel name
  };
  metadata: {
    platformMessageId: string;   // Original platform ID
    raw?: any;                   // Original platform message
  };
}
```

## Troubleshooting

### "Platform not configured" warnings

This is normal if you haven't set up all platforms. The server will work with any configured platforms.

### Slack messages not appearing

Make sure your bot token has the required scopes and the bot is added to the channels you want to monitor.

### Google Chat not working

Verify that:
1. The service account has Chat API enabled
2. The bot is added to the space
3. The credentials file path is correct

### Twilio SMS/WhatsApp not working

Check that:
1. Your Twilio account is active
2. Phone numbers are in E.164 format (+1234567890)
3. For WhatsApp, ensure you're using Twilio's WhatsApp sandbox or approved number

## Architecture

```
┌─────────────────────────────────────────┐
│  MCP Client (Claude, Your App)         │
└──────────────────┬──────────────────────┘
                   │ MCP Protocol
                   ↓
┌─────────────────────────────────────────┐
│  Universal Messaging MCP Server         │
│  - Aggregates from all platforms        │
│  - Normalizes message format            │
│  - Provides unified tools               │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        ↓          ↓          ↓          ↓
    ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
    │ SMS  │  │Slack │  │GChat │  │WhatsApp│
    │Twilio│  │ API  │  │ API  │  │Twilio  │
    └──────┘  └──────┘  └──────┘  └──────┘
```

## Next Steps / Roadmap

- [ ] Add support for Microsoft Teams
- [ ] Add support for Discord
- [ ] Implement webhook support for real-time notifications
- [ ] Add message sending capability (outbound)
- [ ] Add conversation threading support
- [ ] Add caching layer for performance
- [ ] Add message persistence (SQLite/PostgreSQL)

## License

MIT

## Contributing

Contributions welcome! This is a proof-of-concept demonstrating MCP's potential as a universal adapter layer for business systems.
