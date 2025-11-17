# API Credentials Setup Guide

This guide walks you through getting API credentials for each platform. Start with the platforms you actually use.

## 🟢 Easiest: Slack (10 minutes)

### Step-by-Step

1. **Go to Slack API Console**
   - Visit: https://api.slack.com/apps
   - Click "Create New App"
   - Choose "From scratch"
   - Name it "Universal Messaging Bot"
   - Select your workspace

2. **Configure Bot Permissions**
   - Click "OAuth & Permissions" in sidebar
   - Scroll to "Scopes" section
   - Under "Bot Token Scopes", add these:
     ```
     channels:history    (View messages in public channels)
     channels:read       (View basic channel info)
     groups:history      (View messages in private channels)
     groups:read         (View basic private channel info)
     im:history          (View direct messages)
     im:read             (View direct message info)
     users:read          (View user info like names/emails)
     ```

3. **Install to Workspace**
   - Scroll up to "OAuth Tokens"
   - Click "Install to Workspace"
   - Authorize the app
   - Copy the "Bot User OAuth Token" (starts with `xoxb-`)

4. **Add Bot to Channels**
   - In Slack, go to each channel you want to monitor
   - Type `/invite @Universal Messaging Bot`
   - The bot now has access to that channel

5. **Add to .env**
   ```env
   SLACK_BOT_TOKEN=xoxb-your-token-here
   ```

**Test it:**
```bash
curl -H "Authorization: Bearer xoxb-your-token" \
  https://slack.com/api/auth.test
```

---

## 🟡 Medium: Twilio SMS (15 minutes)

### Step-by-Step

1. **Create Twilio Account**
   - Visit: https://www.twilio.com/try-twilio
   - Sign up (free trial gives you credit)
   - Verify your email and phone

2. **Get Account Credentials**
   - Go to: https://console.twilio.com/
   - You'll see your Dashboard
   - Copy "Account SID" and "Auth Token"

3. **Get a Phone Number**
   - In console, click "Phone Numbers" → "Manage" → "Buy a number"
   - Filter by "SMS" capability
   - Choose a number (trial accounts get one free)
   - Buy/Assign the number

4. **Configure for Inbound**
   - Click on your phone number
   - Under "Messaging Configuration":
     - Configure With: "Webhooks/TwiML"
     - A Message Comes In: (leave blank for now, or set to any URL)
   - Save

5. **Add to .env**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+15555551234
   ```

**Test it:**
```bash
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
```

**Send yourself a test SMS** to verify:
- Text your Twilio number from your phone
- You should see it in the MCP server

---

## 🟡 Medium: WhatsApp (via Twilio) (10 minutes)

**Prerequisites:** You need Twilio credentials (see above)

### Step-by-Step

1. **Access WhatsApp Sandbox**
   - Go to: https://console.twilio.com/
   - Navigate to "Messaging" → "Try it out" → "Send a WhatsApp message"
   - You'll see instructions for the sandbox

2. **Join Sandbox**
   - Send a WhatsApp message from your phone to the sandbox number (shown in console)
   - Message format: `join [your-sandbox-code]`
   - Example: `join happy-elephant`
   - You'll get a confirmation

3. **Get Sandbox Number**
   - In the console, note the "From WhatsApp Number"
   - Format: `whatsapp:+14155238886` (example)

4. **Add to .env**
   ```env
   WHATSAPP_NUMBER=whatsapp:+14155238886
   ```
   Note: Use same TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN from SMS setup

**Test it:**
- Send a WhatsApp message to the sandbox number
- Should appear in your MCP server

**For Production (optional):**
- Go to WhatsApp Business API settings in Twilio
- Submit your business for approval
- Get a dedicated WhatsApp number ($15/month)

---

## 🔴 Advanced: Google Chat (30 minutes)

### Step-by-Step

1. **Create Google Cloud Project**
   - Visit: https://console.cloud.google.com/
   - Click "Select Project" → "New Project"
   - Name it "Universal Messaging"
   - Click "Create"

2. **Enable Google Chat API**
   - In the project, go to "APIs & Services" → "Library"
   - Search for "Google Chat API"
   - Click it, then click "Enable"

3. **Create Service Account**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Name: "messaging-bot"
   - Role: "Project" → "Editor"
   - Click "Done"

4. **Download Credentials**
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON"
   - Save the file as `google-credentials.json` in your project root

5. **Configure Google Chat App**
   - Go to: https://console.cloud.google.com/apis/api/chat.googleapis.com/googleapps
   - Click "Configuration"
   - App name: "Universal Messaging Bot"
   - Avatar URL: (optional)
   - Description: "Message aggregation bot"
   - Functionality: Check "Receive 1:1 messages"
   - Connection settings: "Cloud Pub/Sub" (or leave default)
   - Visibility: Add your email under "Specific people and groups"
   - Click "Save"

6. **Add Bot to Space**
   - Open Google Chat (chat.google.com)
   - Create a space or use existing
   - Click space name → "Apps & integrations"
   - Search for your bot name
   - Add it to the space

7. **Get Space Name**
   - In the browser, look at the URL when you're in the space
   - Format: `https://mail.google.com/chat/u/0/#chat/space/AAAAxxxxxxxx`
   - Copy the `AAAAxxxxxxxx` part
   - Space name: `spaces/AAAAxxxxxxxx`

8. **Add to .env**
   ```env
   GOOGLE_CHAT_CREDENTIALS_PATH=./google-credentials.json
   GOOGLE_CHAT_SPACE_NAME=spaces/AAAAxxxxxxxx
   ```

**Test it:**
- Send a message in the Google Chat space
- Should appear in your MCP server

---

## Quick Start: Start with One Platform

**Recommended first platform: Slack**

Why?
- Easiest to set up (10 minutes)
- Most likely you already use it
- Great for testing the concept
- No cost

**Quick Slack-only setup:**

1. Get Slack token (see above)
2. Create `.env` with just:
   ```env
   SLACK_BOT_TOKEN=xoxb-your-token
   ```
3. Build and run:
   ```bash
   npm install
   npm run build
   npm run dev
   ```
4. Send a Slack message to a channel the bot is in
5. Test with Claude or the test client

Once Slack works, add other platforms one at a time.

---

## Troubleshooting

### Slack: "not_in_channel" error
- The bot needs to be invited to the channel
- In Slack, type: `/invite @YourBotName`

### Twilio: "Authentication failed"
- Double-check Account SID starts with "AC"
- Auth token is case-sensitive
- Make sure no extra spaces in .env file

### Google Chat: "Permission denied"
- Service account needs "Editor" role
- Make sure JSON file path is correct
- Verify bot is added to the space

### WhatsApp: "Not authorized"
- Make sure you joined the sandbox first
- Sandbox number must be exact format: `whatsapp:+1234567890`
- Uses same Twilio credentials as SMS

---

## Cost Breakdown

| Platform | Free Tier | Paid | Notes |
|----------|-----------|------|-------|
| Slack | ✅ Free forever | N/A | No usage limits |
| Twilio SMS | $15 trial credit | ~$0.0075/message | Free number included |
| WhatsApp | Same as SMS | ~$0.005/message | Requires business approval for production |
| Google Chat | ✅ Free | N/A | Part of Google Workspace |

**Total to get started: $0** (all have free options)

---

## Security Best Practices

1. **Never commit .env file**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use environment variables in production**
   ```bash
   # Set in your deployment environment
   export SLACK_BOT_TOKEN="xoxb-..."
   ```

3. **Rotate tokens regularly**
   - Especially if you suspect compromise
   - Slack: Regenerate in OAuth settings
   - Twilio: Regenerate in console
   - Google: Create new service account key

4. **Limit bot permissions**
   - Only grant necessary scopes
   - Review periodically
   - Remove unused integrations

---

## Need Help?

**Common issues:**

1. **"Platform not configured" warning**: This is normal if you only set up some platforms. The server works with whatever you configure.

2. **No messages appearing**: Make sure:
   - Bot has access to the channel/space
   - You've sent messages AFTER bot was added
   - Credentials are correct (test with curl commands above)

3. **Rate limiting**: Free tiers have limits:
   - Slack: 1 request per second
   - Twilio: Varies by plan
   - Google: 100 requests per 100 seconds

**Still stuck?** Check the platform's API documentation:
- Slack: https://api.slack.com/docs
- Twilio: https://www.twilio.com/docs
- Google Chat: https://developers.google.com/chat
