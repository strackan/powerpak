# Universal Messenger - MCP Tools Quick Reference

## Available Tools

### 1. get_recent_messages

**Description**: Fetch recent messages from configured messaging platforms

**Parameters**:
- `platform` (optional): Filter by platform - `slack`, `teams`, `whatsapp`, `sms`, `google_chat`
- `conversationId` (optional): Filter by specific conversation ID
- `limit` (optional, default: 50): Maximum number of messages to return
- `since` (optional): ISO date string (e.g., "2025-11-01T00:00:00Z")

**Example Usage**:
```json
{
  "platform": "slack",
  "limit": 10
}
```

**Returns**:
```json
{
  "count": 10,
  "messages": [
    {
      "id": "slack-C01234-1234567890.123",
      "platform": "slack",
      "conversationId": "C01234",
      "sender": {
        "id": "U01234",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "content": "Hello team!",
      "timestamp": "2025-11-17T20:00:00.000Z",
      "threadId": null,
      "metadata": {}
    }
  ]
}
```

---

### 2. send_message

**Description**: Send a message to a specific platform and conversation

**Parameters**:
- `platform` (required): Target platform - `slack`, `teams`, `whatsapp`, `sms`, `google_chat`
- `conversationId` (required): Channel ID, phone number, or space name
- `content` (required): Message text to send

**Example Usage**:
```json
{
  "platform": "slack",
  "conversationId": "C01234ABCD",
  "content": "Hello from Claude!"
}
```

**Returns**:
```json
{
  "success": true,
  "message": {
    "id": "slack-C01234ABCD-1234567890.123",
    "platform": "slack",
    "conversationId": "C01234ABCD",
    "sender": {
      "id": "U_BOT_123",
      "name": "Bot"
    },
    "content": "Hello from Claude!",
    "timestamp": "2025-11-17T20:30:00.000Z",
    "metadata": {}
  }
}
```

**Platform-Specific conversationId Formats**:
- Slack: Channel ID (e.g., `C01234ABCD`)
- SMS: Phone number (e.g., `+1234567890`)
- WhatsApp: `whatsapp:+1234567890`
- Google Chat: Space name (e.g., `spaces/AAAAA`)
- Teams: Channel/chat ID (when fully implemented)

---

### 3. search_messages

**Description**: Search messages by keyword across all platforms or specific platform

**Parameters**:
- `query` (required): Search term to find in message content
- `platform` (optional): Filter by platform
- `limit` (optional, default: 50): Maximum number of results

**Example Usage**:
```json
{
  "query": "project update",
  "platform": "slack",
  "limit": 20
}
```

**Returns**:
```json
{
  "count": 5,
  "query": "project update",
  "messages": [
    {
      "id": "slack-C01234-1234567890.123",
      "platform": "slack",
      "content": "Here's the project update for this week...",
      "timestamp": "2025-11-17T15:00:00.000Z"
    }
  ]
}
```

---

### 4. get_conversations

**Description**: Get list of all conversations across platforms

**Parameters**:
- `platform` (optional): Filter by specific platform

**Example Usage**:
```json
{
  "platform": "slack"
}
```

**Returns**:
```json
{
  "count": 3,
  "conversations": [
    {
      "id": "C01234ABCD",
      "platform": "slack",
      "name": "general",
      "participants": [],
      "lastMessageAt": "2025-11-17T20:00:00.000Z",
      "unreadCount": 0,
      "metadata": {
        "isChannel": true,
        "isPrivate": false
      }
    }
  ]
}
```

---

### 5. get_platform_status

**Description**: Check which messaging platforms are configured and connected

**Parameters**: None

**Example Usage**:
```json
{}
```

**Returns**:
```json
{
  "platforms": [
    {
      "platform": "slack",
      "connected": true,
      "lastSync": "2025-11-17T20:00:00.000Z"
    },
    {
      "platform": "sms",
      "connected": false,
      "error": "Twilio credentials not configured"
    }
  ],
  "connectedCount": 1,
  "totalCount": 5
}
```

---

### 6. mark_as_read

**Description**: Mark a message as read (limited platform support)

**Parameters**:
- `messageId` (required): The message ID to mark as read

**Example Usage**:
```json
{
  "messageId": "slack-C01234-1234567890.123"
}
```

**Returns**:
```json
{
  "success": true,
  "messageId": "slack-C01234-1234567890.123"
}
```

**Platform Support**:
- ✅ Slack (limited)
- ✅ Google Chat (limited)
- ❌ SMS (not supported)
- ❌ WhatsApp (not supported)
- ❌ Teams (stub)

---

## MCP Resources

### messenger://conversations
List of all conversations across all platforms

### messenger://messages/recent
Most recent messages from all platforms (limit 50)

### messenger://platforms
Status of all configured messaging platforms

### messenger://conversation/{id}
Messages for a specific conversation (limit 100)

---

## Common Use Cases

### Use Case 1: Check All Recent Messages
```
"Get my recent messages from all platforms"
```
Tool: `get_recent_messages` with default parameters

### Use Case 2: Send to Specific Channel
```
"Send a message to the #engineering Slack channel saying 'Deploy complete'"
```
Tool: `send_message` with:
- platform: "slack"
- conversationId: "C01234" (channel ID)
- content: "Deploy complete"

### Use Case 3: Find Specific Topic
```
"Search for messages about 'budget review' in the last week"
```
Tool: `search_messages` with:
- query: "budget review"
- Can combine with get_recent_messages using since parameter

### Use Case 4: List Active Conversations
```
"Show me all my active WhatsApp conversations"
```
Tool: `get_conversations` with:
- platform: "whatsapp"

### Use Case 5: Platform Health Check
```
"Which messaging platforms are currently working?"
```
Tool: `get_platform_status`

---

## Error Handling

### Common Errors

**Platform Not Configured**:
```json
{
  "error": "Platform slack not configured"
}
```
**Solution**: Add credentials to .env file

**Invalid Conversation ID**:
```json
{
  "error": "Conversation not found"
}
```
**Solution**: Verify conversation ID is correct for the platform

**Send Message Failed**:
```json
{
  "error": "Error sending message: [platform-specific error]"
}
```
**Solution**: Check bot permissions and conversation access

---

## Platform-Specific Notes

### Slack
- **Conversation ID**: Get from channel URL or use Slack API
- **Bot Setup**: Must invite bot to channels first
- **Permissions**: Requires specific OAuth scopes (see SETUP.md)

### SMS
- **Conversation ID**: E.164 format phone number (e.g., `+1234567890`)
- **Requirements**: Twilio account with active number
- **Limits**: Twilio rate limits apply

### WhatsApp
- **Conversation ID**: Use `whatsapp:+1234567890` format
- **Requirements**: Twilio WhatsApp sandbox or approved number
- **Templates**: First message may require approved template

### Google Chat
- **Conversation ID**: Space name from Google Chat API
- **Bot Setup**: Service account with Chat API enabled
- **Permissions**: Bot must be added to spaces

### Teams (Stub)
- **Status**: Not fully implemented
- **Future**: Will require Azure AD app + Bot Framework

---

## Tips for Claude Desktop Users

1. **Natural Language Works**: You don't need to know exact tool parameters - Claude will figure them out:
   - "Show my Slack messages" → `get_recent_messages`
   - "Send a text to +1234567890" → `send_message`

2. **Combine Operations**: Claude can chain tools:
   - "Search for messages about X and send a summary to Y"

3. **Check Status First**: If messages aren't appearing:
   - Ask "What platforms are connected?"
   - Claude will use `get_platform_status`

4. **Platform Discovery**: Don't remember conversation IDs?
   - "Show my conversations" → `get_conversations`
   - Claude will display available channels/chats

---

## Quick Reference Table

| Task | Tool | Key Parameters |
|------|------|----------------|
| Read messages | get_recent_messages | platform, limit |
| Send message | send_message | platform, conversationId, content |
| Search content | search_messages | query |
| List chats | get_conversations | platform |
| Check status | get_platform_status | none |
| Mark read | mark_as_read | messageId |

---

**Version**: 1.0.0
**Last Updated**: November 17, 2025
**See Also**: README.md, SETUP.md
