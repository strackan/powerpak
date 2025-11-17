# Universal Messenger MCP Server - Setup Guide

## Quick Start

### 1. Build the Server

```bash
# From the monorepo root
npm install
npm run build

# Or from the package directory
cd packages/universal-messenger-server
npm run build
```

### 2. Configure Credentials

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your platform credentials (see sections below).

### 3. Test the Server

```bash
npm start
```

You should see output like:
```
Universal Messenger MCP Server Starting...
Configured platforms:
  ✓ SLACK
  ✗ SMS
    Error: Twilio credentials not configured
...
Universal Messenger MCP Server running on stdio
```

## Platform Setup Instructions

### Slack Setup

1. **Create a Slack App**:
   - Go to https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - Name it (e.g., "Universal Messenger") and select your workspace

2. **Configure Bot Token Scopes**:
   - Navigate to "OAuth & Permissions"
   - Add these Bot Token Scopes:
     - `channels:history`
     - `channels:read`
     - `chat:write`
     - `groups:history`
     - `groups:read`
     - `im:history`
     - `im:read`
     - `im:write`
     - `mpim:history`
     - `mpim:read`
     - `users:read`
     - `users:read.email`

3. **Install App to Workspace**:
   - Click "Install to Workspace" and authorize
   - Copy the "Bot User OAuth Token" (starts with `xoxb-`)

4. **Add to .env**:
   ```env
   SLACK_BOT_TOKEN=xoxb-your-token-here
   ```

5. **Invite Bot to Channels**:
   - In Slack, go to each channel you want to monitor
   - Type `/invite @YourBotName`

### Twilio Setup (SMS & WhatsApp)

1. **Create Twilio Account**:
   - Sign up at https://www.twilio.com/try-twilio
   - Verify your email and phone number

2. **Get Credentials**:
   - Go to Twilio Console (https://console.twilio.com)
   - Copy "Account SID" and "Auth Token"

3. **Get a Phone Number**:
   - For SMS: Get a Twilio phone number
   - For WhatsApp: Request WhatsApp sandbox or approved number
   - Go to Phone Numbers → Manage → Active numbers

4. **Add to .env**:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
   ```

### Google Chat Setup

1. **Create Google Cloud Project**:
   - Go to https://console.cloud.google.com
   - Create a new project

2. **Enable Google Chat API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Chat API"
   - Click "Enable"

3. **Create Service Account**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Fill in details and create
   - Click on the service account
   - Go to "Keys" tab → "Add Key" → "Create new key"
   - Choose JSON format and download

4. **Configure Chat API**:
   - Go to "Google Chat API" → "Configuration"
   - Set up bot details and permissions

5. **Add to .env**:
   ```env
   GOOGLE_CHAT_CREDENTIALS_PATH=./google-service-account.json
   ```

   Place the downloaded JSON file in the package directory.

### Microsoft Teams Setup (Future - Currently Stub)

Teams integration requires:
1. Azure AD app registration
2. Bot Framework configuration
3. Proper OAuth setup with tenant admin consent

This will be fully implemented in a future release. For now, the adapter is stubbed.

## Claude Desktop Integration

### Windows

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "universal-messenger": {
      "command": "node",
      "args": [
        "C:\\Users\\strac\\dev\\MCP-World\\packages\\universal-messenger-server\\dist\\index.js"
      ],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token",
        "TWILIO_ACCOUNT_SID": "ACxxxxxx",
        "TWILIO_AUTH_TOKEN": "your_token",
        "TWILIO_PHONE_NUMBER": "+1234567890",
        "TWILIO_WHATSAPP_NUMBER": "whatsapp:+1234567890",
        "GOOGLE_CHAT_CREDENTIALS_PATH": "C:\\Users\\strac\\dev\\MCP-World\\packages\\universal-messenger-server\\google-credentials.json"
      }
    }
  }
}
```

### macOS/Linux

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "universal-messenger": {
      "command": "node",
      "args": [
        "/path/to/MCP-World/packages/universal-messenger-server/dist/index.js"
      ],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token",
        "TWILIO_ACCOUNT_SID": "ACxxxxxx",
        "TWILIO_AUTH_TOKEN": "your_token",
        "TWILIO_PHONE_NUMBER": "+1234567890"
      }
    }
  }
}
```

## Using the MCP Server in Claude

After configuring Claude Desktop, restart the app. You can now use these tools:

### Get Recent Messages

```
Please get my recent messages from Slack
```

Claude will call the `get_recent_messages` tool.

### Send a Message

```
Send a message to Slack channel C01234ABCD saying "Hello team!"
```

Claude will call the `send_message` tool with:
- platform: "slack"
- conversationId: "C01234ABCD"
- content: "Hello team!"

### Search Messages

```
Search for messages containing "project update"
```

Claude will call the `search_messages` tool.

### Get Conversations

```
Show me all my conversations
```

Claude will call the `get_conversations` tool.

### Check Platform Status

```
Which messaging platforms are connected?
```

Claude will call the `get_platform_status` tool.

## Troubleshooting

### Server Won't Start

1. **Check Node.js version**:
   ```bash
   node --version  # Should be 20.0.0 or higher
   ```

2. **Rebuild the project**:
   ```bash
   npm run clean
   npm run build
   ```

3. **Check for errors in logs**:
   - Claude Desktop logs: Check Developer Console
   - Server logs: Run `npm start` manually

### Platform Not Connecting

1. **Verify credentials**:
   - Check `.env` file has correct tokens
   - Test tokens directly with platform APIs

2. **Check permissions**:
   - Slack: Verify bot scopes
   - Twilio: Check account status
   - Google: Verify API enabled

3. **View detailed errors**:
   ```bash
   npm start
   ```
   Look for error messages from specific adapters.

### Database Issues

1. **Reset database**:
   ```bash
   rm messenger.db
   npm start  # Will recreate
   ```

2. **Check file permissions**:
   - Ensure write access to package directory

### No Messages Appearing

1. **Slack**: Invite bot to channels
2. **SMS/WhatsApp**: Send test messages to your number
3. **Google Chat**: Add bot to spaces

## Advanced Configuration

### Custom Database Location

Set in `.env`:
```env
DATABASE_PATH=/path/to/custom/location/messages.db
```

### Webhook Support (Future)

For real-time message delivery, configure webhooks for each platform. This is planned for a future release.

## Demo Preparation Checklist

- [ ] At least one platform configured (Slack recommended)
- [ ] Bot invited to test channels/conversations
- [ ] Test messages sent and received
- [ ] Claude Desktop config updated
- [ ] Claude Desktop restarted
- [ ] Test each MCP tool:
  - [ ] get_recent_messages
  - [ ] send_message
  - [ ] search_messages
  - [ ] get_conversations
  - [ ] get_platform_status

## Support

For issues or questions:
- Check README.md for architecture details
- Review error messages in Claude Desktop console
- Verify all credentials are correct
- Ensure platform bots/apps are properly configured

## Security Notes

- Never commit `.env` file to git
- Keep API tokens secure
- Use environment variables in production
- Rotate tokens periodically
- Limit bot permissions to minimum required
