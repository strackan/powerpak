# Universal Messenger MCP Server

A comprehensive Model Context Protocol (MCP) server that aggregates messages from multiple messaging platforms into a unified interface for Claude Desktop and other MCP clients.

## Features

- **Multi-Platform Support**: Slack, Microsoft Teams, WhatsApp, SMS, Google Chat
- **Bidirectional Messaging**: Both read and send messages
- **Persistent Storage**: SQLite database with sql.js for cross-platform compatibility
- **Conversation Threading**: Support for threaded conversations
- **OAuth 2.0 Ready**: Infrastructure for OAuth flows (using bot tokens for MVP)
- **MCP Resources**: Expose conversations and messages as resources
- **Graceful Degradation**: Works with partial platform configuration

## Supported Platforms

| Platform | Read Messages | Send Messages | Mark as Read | Status |
|----------|---------------|---------------|--------------|--------|
| Slack | ✅ | ✅ | ⚠️ Limited | Production |
| SMS (Twilio) | ✅ | ✅ | ❌ | Production |
| WhatsApp (Twilio) | ✅ | ✅ | ❌ | Production |
| Google Chat | ✅ | ✅ | ⚠️ Limited | Production |
| Microsoft Teams | ⚠️ Stub | ⚠️ Stub | ❌ | Development |

## Installation

### Prerequisites

- Node.js 18+ and npm
- Access to messaging platforms (bot tokens, API keys)
- Twilio account for SMS/WhatsApp
- Google Cloud service account for Google Chat
- Slack workspace with bot installed

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Build the server**:
   ```bash
   npm run build
   ```

4. **Test the server**:
   ```bash
   npm start
   ```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

#### Slack
```env
SLACK_BOT_TOKEN=xoxb-your-token
```

#### Twilio (SMS & WhatsApp)
```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

#### Google Chat
```env
GOOGLE_CHAT_CREDENTIALS_PATH=./google-credentials.json
```

#### Microsoft Teams (Future)
```env
TEAMS_CLIENT_ID=your-client-id
TEAMS_CLIENT_SECRET=your-client-secret
TEAMS_TENANT_ID=your-tenant-id
```

### Claude Desktop Integration

Add to your Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "universal-messenger": {
      "command": "node",
      "args": [
        "C:\\Users\\strac\\dev\\MCP-World\\packages\\universal-messenger-server\\dist\\index.js"
      ],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-...",
        "TWILIO_ACCOUNT_SID": "...",
        "TWILIO_AUTH_TOKEN": "...",
        "TWILIO_PHONE_NUMBER": "+1234567890"
      }
    }
  }
}
```

## MCP Tools

### `get_recent_messages`
Fetch recent messages from configured platforms.

**Parameters**:
- `platform` (optional): Filter by specific platform
- `conversationId` (optional): Filter by conversation
- `limit` (default: 50): Maximum messages to return
- `since` (optional): ISO date string for filtering

**Example**:
```typescript
{
  "platform": "slack",
  "limit": 10
}
```

### `send_message`
Send a message to a specific platform and conversation.

**Parameters**:
- `platform` (required): Target platform
- `conversationId` (required): Channel ID, phone number, or space name
- `content` (required): Message text

**Example**:
```typescript
{
  "platform": "slack",
  "conversationId": "C01234ABCD",
  "content": "Hello from Claude!"
}
```

### `search_messages`
Search messages by keyword across all platforms.

**Parameters**:
- `query` (required): Search term
- `platform` (optional): Filter by platform
- `limit` (default: 50): Maximum results

### `get_conversations`
Get list of all conversations across platforms.

**Parameters**:
- `platform` (optional): Filter by specific platform

### `get_platform_status`
Check which platforms are configured and connected.

### `mark_as_read`
Mark a message as read (limited platform support).

**Parameters**:
- `messageId` (required): Message ID to mark

## MCP Resources

### `messenger://conversations`
List of all conversations across all platforms.

### `messenger://messages/recent`
Most recent messages from all platforms.

### `messenger://platforms`
Status of all configured messaging platforms.

### `messenger://conversation/{id}`
Messages for a specific conversation.

## Database

The server uses SQLite (via sql.js) for persistent storage:

- **Location**: `./messenger.db` (configurable via `DATABASE_PATH`)
- **Schema**: Messages, conversations, platform configs
- **Auto-save**: Saves to disk after each write operation

### Tables

- `messages`: All messages with full metadata
- `conversations`: Conversation metadata and participants
- `platform_configs`: Platform status and credentials validation

## Development

### Building
```bash
npm run build
```

### Watch Mode
```bash
npm run dev
```

### Type Checking
```bash
npm run typecheck
```

### Clean Build
```bash
npm run clean
npm run build
```

## Architecture

```
src/
├── adapters/          # Platform-specific adapters
│   ├── slack.ts       # Slack Web API
│   ├── sms.ts         # Twilio SMS
│   ├── whatsapp.ts    # Twilio WhatsApp
│   ├── gchat.ts       # Google Chat API
│   ├── teams.ts       # MS Teams (stub)
│   └── index.ts       # Adapter exports
├── auth/              # OAuth infrastructure
│   ├── oauth-manager.ts
│   ├── slack-oauth.ts
│   ├── gchat-oauth.ts
│   └── index.ts
├── db/                # Database layer
│   ├── database.ts    # sql.js wrapper
│   └── schema.sql     # Database schema
└── index.ts           # MCP server implementation
```

## Platform-Specific Notes

### Slack
- Requires bot token with specific scopes
- Automatically filters out bot's own messages
- Thread support via `thread_ts`

### SMS/WhatsApp (Twilio)
- Uses same Twilio client
- WhatsApp requires approved template for first message
- Phone numbers must be E.164 format

### Google Chat
- Requires service account with Chat API enabled
- Space names format: `spaces/{space_id}`
- Limited bot message capabilities

### Microsoft Teams
- Currently stubbed for MVP
- Full implementation requires Azure AD app + Bot Framework
- OAuth flow ready for future implementation

## Troubleshooting

### Database Issues
- Delete `messenger.db` to reset database
- Check file permissions in working directory

### Platform Connection Errors
- Verify credentials in `.env`
- Check API quotas and rate limits
- Review platform-specific bot permissions

### MCP Client Integration
- Ensure absolute paths in Claude Desktop config
- Check server logs in Claude Desktop developer console
- Verify environment variables are passed correctly

## Future Enhancements

- [ ] Full OAuth 2.0 web flows with token storage
- [ ] Microsoft Teams full implementation
- [ ] Discord adapter
- [ ] Telegram adapter
- [ ] Email adapter (Gmail, Outlook)
- [ ] Message attachments support
- [ ] Rich message formatting
- [ ] Real-time message streaming via webhooks
- [ ] Message reactions and emoji support
- [ ] User presence indicators
- [ ] Conversation search with filters

## License

MIT

## Author

Justin Strackany

## Contributing

Contributions welcome! Please ensure:
- TypeScript strict mode compliance
- Zod validation for all inputs
- Proper error handling with graceful degradation
- Tests for new features
