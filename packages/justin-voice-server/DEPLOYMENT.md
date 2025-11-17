# Deployment Guide - Justin's Voice MCP Server

This guide covers deployment and setup for the December 4 demo.

## Pre-Demo Checklist

### ✅ Build Verification

```bash
cd C:\Users\strac\dev\MCP-World\packages\justin-voice-server

# Clean build
npm run clean
npm install
npm run build

# Extract templates
npm run extract-templates

# Verify output
ls dist/templates/
# Should see: templates.json, blends.json, rules.json
```

### ✅ Server Test

```bash
# Run integration test
node test-server.js

# Should see:
# - Server starts successfully
# - Templates loaded: 27
# - Blends loaded: 9
# - Writing rules loaded: 23
# - All tests pass
```

### ✅ Claude Desktop Integration

1. **Locate Claude Desktop config:**
   ```
   Windows: %APPDATA%\Claude\claude_desktop_config.json
   Mac: ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

2. **Add server configuration:**
   ```json
   {
     "mcpServers": {
       "justin-voice": {
         "command": "node",
         "args": [
           "C:\\Users\\strac\\dev\\MCP-World\\packages\\justin-voice-server\\dist\\index.js"
         ]
       }
     }
   }
   ```

3. **Restart Claude Desktop completely**

4. **Verify in Claude:**
   - Look for MCP icon in UI
   - Server should show as "justin-voice"
   - Resources should be available

### ✅ Demo Script

**Demo Flow (5-10 minutes):**

1. **Show Template System**
   ```
   "Show me all beginning templates from justin-voice"
   ```
   - Demonstrates 5 opening templates
   - Shows examples and use cases

2. **Analyze Bad Writing**
   ```
   "Analyze this corporate text with justin-voice:

   We are pleased to announce our new platform capabilities that will
   drive synergistic value and leverage best-in-class solutions."
   ```
   - Shows voice score (should be ~10-20)
   - Lists all the problems
   - Provides specific suggestions

3. **Generate Justin-Voice Content**
   ```
   "Use justin-voice to write a product launch post about our AI customer
   success platform. Use THE AUTHENTIC FOUNDER blend."
   ```
   - Generates content in Justin's style
   - Shows template usage
   - Reports voice score (should be 70+)

4. **Get Blend Recommendation**
   ```
   "I want to write a controversial take about CS metrics.
   What blend should I use from justin-voice?"
   ```
   - Recommends THE PROVOCATEUR
   - Explains why it works
   - Shows components

5. **Browse All Resources**
   ```
   "Show me all available resources from justin-voice"
   ```
   - Lists 7 resources
   - Demonstrates MCP integration

## Troubleshooting

### Server Not Showing Up

**Problem:** Claude Desktop doesn't show justin-voice server

**Solutions:**
1. Check config file path is correct (Windows uses `\\` not `/`)
2. Verify absolute path in config matches actual location
3. Ensure `dist/index.js` exists
4. Restart Claude Desktop (fully quit and reopen)
5. Check Claude Desktop logs for errors

### Build Errors

**Problem:** TypeScript compilation fails

**Solutions:**
1. Run `npm install` to ensure all dependencies installed
2. Check TypeScript version: `npx tsc --version` (should be 5.3+)
3. Clear old build: `npm run clean`
4. Rebuild: `npm run build`

### Template Extraction Fails

**Problem:** extract-templates script errors

**Solutions:**
1. Verify `justin_os/*.md` files exist
2. Check markdown format hasn't changed
3. Run manually: `node dist/scripts/extract-templates.js`
4. Check output in `dist/templates/`

### Server Crashes on Start

**Problem:** Server exits immediately

**Solutions:**
1. Test directly: `node dist/index.js`
2. Check console output for errors
3. Verify template files exist in `dist/templates/`
4. Ensure Node.js version is 18+ (`node --version`)

### Low Voice Scores

**Problem:** Generated content scores low (<60)

**Solutions:**
- This is expected for template-based generation
- Scores will improve with killer.tools API integration
- Current version provides structure, not full generation
- Use as a starting point and refine manually

## Production Deployment (Future)

### Option 1: Local Installation

Each user runs their own server:
```bash
npm install -g @mcp-world/justin-voice-server
justin-voice  # Starts server
```

### Option 2: Centralized Server

Host on cloud with HTTP transport:
```bash
# Server
npm start -- --transport http --port 3000

# Client config
{
  "mcpServers": {
    "justin-voice": {
      "url": "https://justin-voice.yourcompany.com"
    }
  }
}
```

### Option 3: Package as Binary

Use `pkg` to create standalone executable:
```bash
npm install -g pkg
pkg package.json
# Distributes as .exe (Windows), binary (Mac/Linux)
```

## Monitoring

### Server Logs

Server logs go to stderr:
```bash
node dist/index.js 2> server.log
```

### Usage Tracking

Add logging in `src/index.ts`:
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`Tool called: ${request.params.name}`);
  // ... existing code
});
```

### Performance Metrics

Track in production:
- Tool call frequency
- Average voice scores
- Most used templates/blends
- Error rates

## Backup Plan

If server fails during demo:

1. **Fallback to Manual Examples:**
   - Show `USAGE_EXAMPLES.md`
   - Walk through template structure
   - Demonstrate voice analysis manually

2. **Show Code:**
   - Open `src/engine/voice-engine.ts`
   - Explain template system
   - Show rule enforcement logic

3. **Show Data Files:**
   - Open `dist/templates/templates.json`
   - Show blend recipes
   - Demonstrate structured data

## Demo Day Preparation

### Day Before (December 3)

- [ ] Fresh build: `npm run clean && npm run build`
- [ ] Run full test suite: `node test-server.js`
- [ ] Verify Claude Desktop integration
- [ ] Test all demo scenarios
- [ ] Have backup slides ready
- [ ] Print USAGE_EXAMPLES.md

### Day Of (December 4)

- [ ] Restart computer (clean slate)
- [ ] Start Claude Desktop
- [ ] Verify justin-voice server connected
- [ ] Run through demo script once
- [ ] Have this deployment guide open
- [ ] Keep `test-server.js` ready as backup

## Success Criteria

Demo is successful if:

1. ✅ Server starts and connects to Claude Desktop
2. ✅ Can browse templates and resources
3. ✅ Voice analysis works and provides scores
4. ✅ Can generate content using blends
5. ✅ Recommendations work based on context
6. ✅ System responds quickly (<2s per request)
7. ✅ No crashes or errors during demo

## Contact Info

**If issues arise:**
- Check this deployment guide
- Review USAGE_EXAMPLES.md
- Test with test-server.js
- Check server logs (stderr)

**Last verified:** November 17, 2024
**Demo date:** December 4, 2024
**Status:** Production ready
