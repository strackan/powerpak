# Quick Start Guide - Justin's Voice MCP Server

Get up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Claude Desktop installed
- Terminal/command prompt access

## Installation (2 minutes)

```bash
# Navigate to the server directory
cd C:\Users\strac\dev\MCP-World\packages\justin-voice-server

# Install dependencies
npm install

# Build the server
npm run build

# Extract templates from Justin OS
npm run extract-templates
```

**Expected output:**
```
✓ Extracted 27 templates
✓ Extracted 9 blend recipes
✓ Extracted 23 writing rules
```

## Configuration (1 minute)

1. Open Claude Desktop config file:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add this configuration:
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

3. Save and close the file

## Verification (2 minutes)

1. **Test the server locally:**
   ```bash
   node test-server.js
   ```

   Should see:
   - Server starts successfully
   - Templates loaded: 27
   - All tests pass

2. **Restart Claude Desktop:**
   - Completely quit Claude Desktop
   - Reopen it
   - Look for MCP server indicator

3. **Test in Claude Desktop:**

   Try this prompt:
   ```
   Show me all beginning templates from justin-voice
   ```

   Should see 5 templates listed (O1-O6)

## First Use

### Example 1: Analyze Your Writing

```
Analyze this text with justin-voice:

"We are excited to announce our new platform capabilities that drive synergistic value."
```

You'll get:
- Voice score (probably low ~15/100)
- List of problems
- Specific suggestions

### Example 2: Generate Content

```
Use justin-voice to write a product launch post about our AI features.
Use THE AUTHENTIC FOUNDER blend.
```

You'll get:
- Content in Justin's style
- Templates used
- Voice score

### Example 3: Get Recommendations

```
I want to write a hot take about customer success.
What blend should I use from justin-voice?
```

You'll get:
- Recommended blend (probably THE PROVOCATEUR)
- Why it works
- Component templates

## Common Issues

### Server not showing up in Claude

**Fix:**
1. Check the path in config is correct (use `\\` on Windows)
2. Restart Claude Desktop completely
3. Verify `dist/index.js` exists

### Build errors

**Fix:**
```bash
npm run clean
npm install
npm run build
```

### Template extraction fails

**Fix:**
Check that `justin_os/` folder exists with markdown files:
```bash
ls ../../justin_os/*.md
```

## Next Steps

- Read [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for detailed scenarios
- Check [README.md](README.md) for full documentation
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for demo preparation

## Commands Reference

```bash
npm run build              # Compile TypeScript
npm run extract-templates  # Parse Justin OS docs
npm start                  # Run the server
npm run dev               # Watch mode for development
npm run clean             # Remove build files
node test-server.js       # Run integration test
```

## Help

If you're stuck:
1. Run `node test-server.js` to verify server works
2. Check Claude Desktop logs for errors
3. Review [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
4. Verify all files exist: `ls dist/templates/`

## Success!

If you can:
- See justin-voice in Claude Desktop
- Browse templates
- Analyze text
- Generate content

You're ready to go!

---

**Setup Time:** ~5 minutes
**Status:** Production ready for December 4 demo
