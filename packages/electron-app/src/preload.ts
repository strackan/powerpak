/**
 * PowerPak Desktop - Preload Script
 *
 * Secure bridge between Electron main process and renderer (Next.js)
 * Exposes only safe APIs to the web content
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('powerpak', {
  // Platform information
  platform: process.platform,
  isElectron: true,

  // Notifications
  notification: {
    show: (title: string, body: string) => {
      return ipcRenderer.invoke('show-notification', { title, body });
    },
  },

  // MCP Server management
  mcp: {
    getEnabledServers: () => {
      return ipcRenderer.invoke('mcp-get-enabled-servers');
    },
    toggleServer: (serverId: string, enabled: boolean) => {
      return ipcRenderer.invoke('mcp-toggle-server', { serverId, enabled });
    },
    getServerStatus: (serverId: string) => {
      return ipcRenderer.invoke('mcp-get-server-status', { serverId });
    },
  },

  // Window controls
  window: {
    minimize: () => {
      ipcRenderer.send('window-minimize');
    },
    maximize: () => {
      ipcRenderer.send('window-maximize');
    },
    close: () => {
      ipcRenderer.send('window-close');
    },
    isMaximized: () => {
      return ipcRenderer.invoke('window-is-maximized');
    },
  },

  // Settings
  settings: {
    get: (key: string) => {
      return ipcRenderer.invoke('settings-get', { key });
    },
    set: (key: string, value: any) => {
      return ipcRenderer.invoke('settings-set', { key, value });
    },
  },

  // Knowledge graph
  graph: {
    openBrowser: () => {
      ipcRenderer.send('graph-open-browser');
    },
    query: (cypher: string) => {
      return ipcRenderer.invoke('graph-query', { cypher });
    },
  },

  // System integration
  system: {
    openExternal: (url: string) => {
      ipcRenderer.send('system-open-external', { url });
    },
    showItemInFolder: (path: string) => {
      ipcRenderer.send('system-show-item-in-folder', { path });
    },
  },

  // Event listeners
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = [
      'notification-clicked',
      'mcp-server-status-changed',
      'graph-data-updated',
    ];

    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      const subscription = (_event: any, ...args: any[]) => callback(...args);
      ipcRenderer.on(channel, subscription);

      // Return cleanup function
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    }
  },

  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
});

// TypeScript declarations for window.powerpak
declare global {
  interface Window {
    powerpak: {
      platform: string;
      isElectron: boolean;
      notification: {
        show: (title: string, body: string) => Promise<void>;
      };
      mcp: {
        getEnabledServers: () => Promise<Record<string, boolean>>;
        toggleServer: (serverId: string, enabled: boolean) => Promise<void>;
        getServerStatus: (serverId: string) => Promise<{ connected: boolean; error?: string }>;
      };
      window: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
        isMaximized: () => Promise<boolean>;
      };
      settings: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any) => Promise<void>;
      };
      graph: {
        openBrowser: () => void;
        query: (cypher: string) => Promise<any>;
      };
      system: {
        openExternal: (url: string) => void;
        showItemInFolder: (path: string) => void;
      };
      on: (channel: string, callback: (...args: any[]) => void) => (() => void) | undefined;
      off: (channel: string, callback: (...args: any[]) => void) => void;
    };
  }
}
