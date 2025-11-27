# Installing Neo4j on Windows (Without Docker)

## Option 1: Neo4j Desktop (Recommended for Windows)

### Download
https://neo4j.com/download/

### Installation Steps

1. **Download Neo4j Desktop**
   - Click "Download Neo4j Desktop"
   - No account required for local use
   - Size: ~500MB

2. **Install**
   - Run the installer
   - Default settings are fine
   - Launch Neo4j Desktop when complete

3. **Create Database**
   - Click "New" to create a project
   - Name it "PowerPak"
   - Click "Add" > "Local DBMS"
   - Settings:
     - Name: `powerpak`
     - Password: `powerpak_password`
     - Version: 5.13 or later
   - Click "Create"

4. **Start Database**
   - Click "Start" on the database
   - Wait for status to show "Active"
   - Click "Open" to access Neo4j Browser

5. **Verify Connection**
   - Neo4j Browser should open at http://localhost:7474
   - Connect URL: `bolt://localhost:7687`
   - Username: `neo4j`
   - Password: `powerpak_password`

### Load PowerPak Knowledge Graph

Once Neo4j is running:

```bash
cd C:\Users\strac\dev\MCP-World\packages\knowledge-graph
npm run load
```

---

## Option 2: Neo4j Community Server (Command Line)

### Download
https://neo4j.com/deployment-center/#community

### Installation Steps

1. **Download**
   - Click "Community Server"
   - Select Windows version
   - Download ZIP file (not installer)

2. **Extract**
   - Extract to `C:\neo4j` (or your preferred location)

3. **Set Password**
   - Open PowerShell as Administrator
   - Navigate to Neo4j bin directory:
     ```powershell
     cd C:\neo4j\bin
     ```
   - Set initial password:
     ```powershell
     .\neo4j-admin.bat set-initial-password powerpak_password
     ```

4. **Start Neo4j**
   ```powershell
   .\neo4j.bat console
   ```
   - Keep this window open (Neo4j runs in foreground)
   - To run as Windows service instead:
     ```powershell
     .\neo4j.bat install-service
     .\neo4j.bat start
     ```

5. **Verify**
   - Open browser: http://localhost:7474
   - Login: `neo4j` / `powerpak_password`

### Load PowerPak Knowledge Graph

```bash
cd C:\Users\strac\dev\MCP-World\packages\knowledge-graph
npm run load
```

---

## Option 3: Skip Neo4j (Demo Still Works!)

**PowerPak Desktop works perfectly fine without Neo4j** - you just won't have knowledge graph features.

### What Works Without Neo4j:
- ✅ Expert consultations (@justin-strackany, @scott-leese)
- ✅ System tray integration
- ✅ All MCP tools (ask_expert, hire, message, book_meeting)
- ✅ Chat functionality
- ✅ Native notifications
- ✅ Window management

### What Requires Neo4j:
- ❌ Knowledge graph semantic search
- ❌ Neo4j Browser visualization
- ❌ Graph-based entity relationships
- ❌ Memento MCP server

### For Demo Without Neo4j:

1. **Disable Memento MCP** in Better Chatbot config:

   Edit `packages/better-chatbot/.mcp-config.json`:
   ```json
   {
     "justin-strackany": { ... },
     "scott-leese": { ... }
     // Remove or comment out memento-powerpak
   }
   ```

2. **Focus Demo on**:
   - Expert consultations (still very impressive!)
   - System tray integration
   - Desktop experience
   - Multi-expert queries

3. **Optional**: Mention knowledge graph as "coming soon" feature

---

## Recommendation for Your Demo

**I recommend Option 3** (Skip Neo4j for now) because:

1. **Core Demo Works**: Expert consultations are the main feature
2. **Faster Setup**: No need to install Neo4j today
3. **Less Complexity**: One fewer service to manage during demo
4. **December 4 Timeline**: You have 12 days - focus on what works

You can add Neo4j later if you want the knowledge graph visualization for "wow factor", but the expert MCP servers are already impressive on their own.

---

## If You Choose to Install Neo4j Later

### Neo4j Desktop is Best for Windows
- **Pros**: GUI, easy, self-contained
- **Cons**: Larger download (~500MB)
- **Time**: 10-15 minutes to install + load graph

### Community Server is Lighter
- **Pros**: Smaller, command-line
- **Cons**: Requires Java (if not installed), manual setup
- **Time**: 15-20 minutes to install + configure + load graph

---

## Quick Decision Guide

**Choose Neo4j Desktop if**:
- You want the knowledge graph demo
- You don't mind a 500MB download
- You prefer GUI over command line
- You have 30 minutes to set it up

**Choose Community Server if**:
- You're comfortable with command line
- You want a lighter installation
- You already have Java installed

**Skip Neo4j if**:
- You're tight on time
- You want to focus on expert consultations
- You prefer simpler demo setup
- You can add it later if needed

---

## Test Plan Adjustments Without Neo4j

If you skip Neo4j, you can skip these test suites:
- ❌ Suite 5: Knowledge Graph Integration (4 tests)
- ❌ Suite 2.5: Neo4j Browser Launcher (1 test)

**Reduces testing time from 80 minutes to 60 minutes.**

Your minimum demo tests (30 minutes) don't require Neo4j anyway!
