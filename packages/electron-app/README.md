# PowerPak Desktop

**Electron wrapper for Better Chatbot with deep OS integration and PowerPak MCP servers**

## Overview

PowerPak Desktop is an Electron-based desktop application that wraps the Better Chatbot web interface, providing:

- **System Tray Integration** - Background operation with quick access menu
- **PowerPak MCP Servers** - Expert profiles (Justin Strackany, Scott Leese) accessible via chat
- **Knowledge Graph** - Neo4j-powered semantic search via Memento MCP
- **Native Notifications** - Desktop notifications for important events
- **Deep OS Integration** - Native window management, file system access, and more

## Architecture

```
PowerPak Desktop (Electron)
├── Main Process (src/main.ts)
│   ├── Window Management
│   ├── System Tray
│   ├── Next.js Server Spawning
│   └── Settings Persistence (electron-store)
├── Preload Script (src/preload.ts)
│   └── Secure IPC Bridge (window.powerpak API)
├── IPC Handlers (src/ipc-handlers.ts)
│   ├── Notifications
│   ├── MCP Server Management
│   ├── Window Controls
│   ├── Neo4j Graph Queries
│   └── System Integration
└── Better Chatbot (Next.js)
    ├── AI Chat Interface
    └── MCP Server Integration
        ├── justin-strackany
        ├── scott-leese
        └── memento-powerpak
```

## Prerequisites

1. **Node.js 20+** with npm or pnpm
2. **Better Chatbot** cloned as submodule at `packages/better-chatbot`
3. **PowerPak MCP Servers** built at `packages/powerpak-server/dist/`
4. **Neo4j** running at `localhost:7687` (optional, for knowledge graph)

## Quick Start

### 1. Install Dependencies

```bash
cd packages/electron-app
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

### 3. Configure Better Chatbot

Better Chatbot is already configured via:
- `.mcp-config.json` - PowerPak MCP servers
- `.env` - Environment variables (FILE_BASED_MCP_CONFIG=true)

Make sure you have an API key for at least one LLM provider (Anthropic, OpenAI, Google):

```bash
cd ../better-chatbot
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
```

### 4. Install Better Chatbot Dependencies

```bash
cd ../better-chatbot
pnpm install
```

### 5. Run PowerPak Desktop

From the `electron-app` directory:

```bash
npm run dev
```

This will:
1. Build the Electron TypeScript
2. Start the Next.js dev server (Better Chatbot)
3. Launch the Electron window
4. Create the system tray icon

## Features

### System Tray

Right-click the tray icon to access:

- **Show Window** - Bring PowerPak to front
- **PowerPak Profiles** - Toggle expert MCP servers
  - ✓ Justin Strackany (Revenue Operations & Customer Success)
  - ✓ Scott Leese (Sales Leadership)
- **Knowledge Graph** - Toggle Memento MCP server
- **Settings**
  - Minimize to Tray (default: on)
  - Start Minimized (default: off)
  - Launch at Startup (default: off)
- **Neo4j Browser** - Open graph database UI
- **Quit PowerPak** - Exit application

### Window Management

- **Minimize to Tray** - Window hides to tray instead of taskbar
- **Persistent Window Bounds** - Window size/position saved between sessions
- **External Links** - Open in default browser automatically

### MCP Servers

PowerPak Desktop automatically connects to three MCP servers:

1. **justin-strackany**
   - Expert: Justin Strackany (Founder & CEO @ Renubu)
   - Tools: `ask_expert`, `hire`, `message`, `book_meeting`
   - Specialties: Revenue Operations, Customer Success, Authentic Writing

2. **scott-leese**
   - Expert: Scott Leese (8x VP Sales, Military Veteran)
   - Tools: `ask_expert`, `hire`, `message`, `book_meeting`
   - Specialties: Sales Leadership, Team Building, Pipeline Management

3. **memento-powerpak**
   - Knowledge Graph: Neo4j-powered semantic search
   - Tools: `create_entities`, `create_relations`, `semantic_search`, `open_nodes`
   - Data: PowerPak expert profiles, frameworks, concepts, skills

### Native Notifications

- **Welcome Notification** - Shown on app start
- **Minimize to Tray** - First-time tip about background operation
- **Custom Notifications** - Triggered via window.powerpak.notification.show()

### Knowledge Graph Integration

PowerPak Desktop includes direct Neo4j integration for advanced graph queries:

```typescript
// From renderer (Next.js)
const result = await window.powerpak.graph.query(`
  MATCH (e:Expert)-[:HAS_EXPERTISE]->(s:Skill)
  WHERE e.name = 'Justin Strackany'
  RETURN s.name, s.description
`);
```

Open Neo4j Browser from the system tray to visualize the knowledge graph.

## Development

### Project Structure

```
electron-app/
├── src/
│   ├── main.ts           # Main Electron process
│   ├── preload.ts        # IPC bridge (window.powerpak API)
│   └── ipc-handlers.ts   # IPC request handlers
├── dist/                 # Compiled JavaScript (generated)
├── assets/               # Icon assets (see assets/README.md)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

### Available Scripts

```bash
# Development
npm run build          # Compile TypeScript
npm run dev            # Build + start Electron in dev mode
npm run start          # Start Electron (requires built files)
npm run clean          # Remove dist/ folder

# Production Packaging
npm run package        # Build for all platforms
npm run package:mac    # Build macOS DMG
npm run package:win    # Build Windows installer
npm run package:linux  # Build Linux AppImage/deb
```

### IPC API (window.powerpak)

The preload script exposes a secure API to the renderer process:

```typescript
interface PowerPakAPI {
  platform: string;
  isElectron: boolean;

  // Notifications
  notification: {
    show: (title: string, body: string) => Promise<void>;
  };

  // MCP Server Management
  mcp: {
    getEnabledServers: () => Promise<Record<string, boolean>>;
    toggleServer: (serverId: string, enabled: boolean) => Promise<void>;
    getServerStatus: (serverId: string) => Promise<{ connected: boolean; error?: string }>;
  };

  // Window Controls
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    isMaximized: () => Promise<boolean>;
  };

  // Settings
  settings: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
  };

  // Knowledge Graph
  graph: {
    openBrowser: () => void;
    query: (cypher: string) => Promise<any>;
  };

  // System Integration
  system: {
    openExternal: (url: string) => void;
    showItemInFolder: (path: string) => void;
  };

  // Event Listeners
  on: (channel: string, callback: (...args: any[]) => void) => (() => void) | undefined;
  off: (channel: string, callback: (...args: any[]) => void) => void;
}
```

### Adding Custom Features

To add new Electron features:

1. **Add IPC Handler** in `src/ipc-handlers.ts`
   ```typescript
   ipcMain.handle('my-feature', async (_event, { arg }) => {
     // Handle request
     return { result: '...' };
   });
   ```

2. **Expose in Preload** in `src/preload.ts`
   ```typescript
   myFeature: {
     doSomething: (arg: string) => ipcRenderer.invoke('my-feature', { arg }),
   }
   ```

3. **Use in Renderer** (Better Chatbot)
   ```typescript
   const result = await window.powerpak.myFeature.doSomething('test');
   ```

## Configuration

### Electron Settings

Stored in `electron-store` (persistent):

- `windowBounds` - Window size and position
- `minimizeToTray` - Hide to tray on close (default: true)
- `startMinimized` - Launch minimized (default: false)
- `launchAtStartup` - Auto-start on OS login (default: false)
- `hasMinimizedBefore` - First-time tray tip shown
- `mcpServers` - Enabled/disabled state for each MCP server
  - `justin-strackany` (default: true)
  - `scott-leese` (default: true)
  - `memento-powerpak` (default: true)

### Better Chatbot Settings

See `packages/better-chatbot/.env` for configuration.

Key settings:
- `FILE_BASED_MCP_CONFIG=true` - Use .mcp-config.json
- `ANTHROPIC_API_KEY` - Claude API key
- `BETTER_AUTH_SECRET` - Session encryption key

### MCP Server Configuration

See `packages/better-chatbot/.mcp-config.json` for MCP server definitions.

## Production Build

### Prerequisites

1. **Build PowerPak MCP Servers**
   ```bash
   cd packages/powerpak-server
   npm run build
   ```

2. **Build Better Chatbot** (for production)
   ```bash
   cd packages/better-chatbot
   pnpm build
   ```

3. **Create Icon Assets** (see `assets/README.md`)
   - icon.png (512x512)
   - icon.icns (macOS)
   - icon.ico (Windows)
   - tray-icon.png (32x32)

### Build for Distribution

```bash
cd packages/electron-app

# Build TypeScript
npm run build

# Package for your platform
npm run package:mac     # macOS
npm run package:win     # Windows
npm run package:linux   # Linux
```

Output will be in `packages/electron-app/release/`.

### Electron Builder Configuration

See `package.json` → `build` section for customization:

- `appId` - Application identifier (com.mcpworld.powerpak)
- `productName` - Display name (PowerPak Desktop)
- `files` - Bundled files (dist, assets, better-chatbot/.next)
- Platform-specific settings (mac, win, linux)

## Troubleshooting

### Next.js Server Won't Start

**Symptom**: Electron window shows "ERR_CONNECTION_REFUSED"

**Solutions**:
1. Check Better Chatbot dependencies are installed: `cd packages/better-chatbot && pnpm install`
2. Verify `.env` file exists in `better-chatbot/`
3. Try running Next.js manually: `cd packages/better-chatbot && pnpm dev`
4. Check port 3000 is not already in use

### MCP Servers Not Loading

**Symptom**: Tools not available in chat

**Solutions**:
1. Verify `FILE_BASED_MCP_CONFIG=true` in `better-chatbot/.env`
2. Check `.mcp-config.json` exists in `better-chatbot/`
3. Ensure PowerPak servers are built: `cd packages/powerpak-server && npm run build`
4. Check server paths in `.mcp-config.json` are correct (relative to better-chatbot/)

### Neo4j Connection Errors

**Symptom**: Graph queries fail

**Solutions**:
1. Start Neo4j: `docker-compose up -d` (from project root)
2. Verify Neo4j is running: Open http://localhost:7474
3. Check credentials in `src/ipc-handlers.ts` (default: neo4j/powerpak_password)
4. Load graph data: `cd packages/knowledge-graph && npm run load`

### Tray Icon Not Showing

**Symptom**: No system tray icon visible

**Solutions**:
1. Check `assets/tray-icon.png` exists
2. On Linux, ensure system tray is enabled in your desktop environment
3. On macOS, check Menu Bar settings (Show/Hide menu bar items)
4. Create placeholder icon: 32x32 PNG, simple design

### Build Errors

**Symptom**: TypeScript compilation fails

**Solutions**:
1. Clean and rebuild: `npm run clean && npm run build`
2. Check Node.js version: Should be 20+
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Verify all imports are correct in TypeScript files

## Security

- **Context Isolation** - Enabled (prevents renderer from accessing Node.js)
- **Node Integration** - Disabled (renderer can't use require())
- **Sandbox** - Enabled (renderer runs in restricted environment)
- **Preload Script** - Only exposes whitelisted APIs via contextBridge
- **IPC Validation** - All IPC channels are explicitly defined and validated

## Contributing

When adding features to PowerPak Desktop:

1. Follow TypeScript strict mode
2. Use descriptive IPC channel names
3. Validate all user inputs in IPC handlers
4. Update this README with new features
5. Test on all three platforms (macOS, Windows, Linux)

## License

MIT - See LICENSE file

## Resources

- **Better Chatbot**: https://github.com/cgoinglove/better-chatbot
- **Electron**: https://www.electronjs.org/
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Neo4j**: https://neo4j.com/
- **PowerPak**: https://powerpak.ai/
