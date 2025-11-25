/**
 * PowerPak Desktop - IPC Handlers
 *
 * Handlers for communication between main process and renderer
 */

import { ipcMain, Notification, shell, BrowserWindow } from 'electron';
import Store from 'electron-store';
import neo4j from 'neo4j-driver';

const store = new Store();

// Neo4j connection (lazy initialization)
let neo4jDriver: any = null;

function getNeo4jDriver() {
  if (!neo4jDriver) {
    const uri = process.env.NEO4J_URI || 'bolt://127.0.0.1:7687';
    const user = process.env.NEO4J_USERNAME || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'powerpak_password';

    neo4jDriver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  return neo4jDriver;
}

/**
 * Register all IPC handlers
 */
export function registerIpcHandlers() {
  // Notifications
  ipcMain.handle('show-notification', async (_event, { title, body }) => {
    new Notification({ title, body }).show();
  });

  // MCP Server management
  ipcMain.handle('mcp-get-enabled-servers', async () => {
    return store.get('mcpServers', {});
  });

  ipcMain.handle('mcp-toggle-server', async (_event, { serverId, enabled }) => {
    store.set(`mcpServers.${serverId}`, enabled);
    return { success: true };
  });

  ipcMain.handle('mcp-get-server-status', async (_event, { serverId }) => {
    // TODO: Actually check if MCP server is connected
    const enabled = store.get(`mcpServers.${serverId}`, false);
    return {
      connected: enabled,
      error: enabled ? undefined : 'Server disabled',
    };
  });

  // Window controls
  ipcMain.on('window-minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.minimize();
  });

  ipcMain.on('window-maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window?.isMaximized()) {
      window.unmaximize();
    } else {
      window?.maximize();
    }
  });

  ipcMain.on('window-close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.close();
  });

  ipcMain.handle('window-is-maximized', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return window?.isMaximized() || false;
  });

  // Settings
  ipcMain.handle('settings-get', async (_event, { key }) => {
    return store.get(key);
  });

  ipcMain.handle('settings-set', async (_event, { key, value }) => {
    store.set(key, value);
    return { success: true };
  });

  // Knowledge graph
  ipcMain.on('graph-open-browser', () => {
    shell.openExternal('http://localhost:7474');
  });

  ipcMain.handle('graph-query', async (_event, { cypher }) => {
    try {
      const driver = getNeo4jDriver();
      const session = driver.session();

      try {
        const result = await session.run(cypher);
        const records = result.records.map((record: any) => record.toObject());
        return { success: true, data: records };
      } finally {
        await session.close();
      }
    } catch (error) {
      console.error('Neo4j query error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  // System integration
  ipcMain.on('system-open-external', (_event, { url }) => {
    shell.openExternal(url);
  });

  ipcMain.on('system-show-item-in-folder', (_event, { path }) => {
    shell.showItemInFolder(path);
  });
}

/**
 * Cleanup on app quit
 */
export function cleanupIpcHandlers() {
  if (neo4jDriver) {
    neo4jDriver.close();
    neo4jDriver = null;
  }
}
