/**
 * PowerPak Desktop - Electron Main Process
 *
 * Wraps Better Chatbot (Next.js) in Electron with:
 * - System tray integration
 * - Native notifications
 * - PowerPak MCP server connections
 * - Deep OS integration
 */

import { app, BrowserWindow, Tray, Menu, nativeImage, Notification, shell } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import Store from 'electron-store';
import { registerIpcHandlers, cleanupIpcHandlers } from './ipc-handlers';

// Configuration store
const store = new Store({
  defaults: {
    windowBounds: { width: 1200, height: 800 },
    minimizeToTray: true,
    startMinimized: false,
    launchAtStartup: false,
    mcpServers: {
      // Advanced Systems
      'justin-voice': true,
      'founder-os': true,
      // Platinum Tier
      'scott-leese': true,
      // Premium Tier
      'gary-vaynerchuk': true,
      'jill-rowley': true,
      'andrew-ng': true,
      // Regular Tier
      'maya-chen': true,
      'jordan-williams': true,
      'priya-sharma': true,
      'marcus-thompson': true,
      // Spotlight
      'david-martinez': true,
      // Knowledge Graph
      'memento-powerpak': true,
    },
  },
});

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let nextJsServer: ChildProcess | null = null;
let isQuitting = false;
const NEXT_JS_PORT = 3000;
const NEXT_JS_URL = `http://localhost:${NEXT_JS_PORT}`;

/**
 * Create the main application window
 */
function createWindow() {
  const bounds = store.get('windowBounds') as { width: number; height: number };

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'PowerPak Desktop',
    show: false, // Don't show until ready
  });

  // Load Next.js app
  mainWindow.loadURL(NEXT_JS_URL);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (!store.get('startMinimized')) {
      mainWindow?.show();
    }
  });

  // Save window bounds on resize
  mainWindow.on('resize', () => {
    if (mainWindow) {
      store.set('windowBounds', mainWindow.getBounds());
    }
  });

  // Handle window close
  mainWindow.on('close', (event) => {
    if (store.get('minimizeToTray') && !isQuitting) {
      event.preventDefault();
      mainWindow?.hide();

      // Show notification on first minimize
      if (!store.get('hasMinimizedBefore')) {
        new Notification({
          title: 'PowerPak Desktop',
          body: 'PowerPak is still running in the background. Click the tray icon to open.',
        }).show();
        store.set('hasMinimizedBefore', true);
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Development tools
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

/**
 * Create system tray icon and menu
 */
function createTray() {
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);

  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  tray.setToolTip('PowerPak Desktop');

  updateTrayMenu();

  // Show/hide window on tray click
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    } else {
      createWindow();
    }
  });
}

/**
 * Update tray context menu
 */
function updateTrayMenu() {
  const mcpServers = store.get('mcpServers') as Record<string, boolean>;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'PowerPak Desktop',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Show Window',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Advanced Systems',
      submenu: [
        {
          label: "Justin's Voice (30 Templates)",
          type: 'checkbox',
          checked: mcpServers['justin-voice'],
          click: (item) => {
            store.set('mcpServers.justin-voice', item.checked);
            updateTrayMenu();
          },
        },
        {
          label: 'Founder OS (Chief of Staff)',
          type: 'checkbox',
          checked: mcpServers['founder-os'],
          click: (item) => {
            store.set('mcpServers.founder-os', item.checked);
            updateTrayMenu();
          },
        },
      ],
    },
    { type: 'separator' },
    {
      label: 'PowerPak Profiles',
      submenu: [
        {
          label: 'Platinum Tier',
          submenu: [
            {
              label: 'Scott Leese',
              type: 'checkbox',
              checked: mcpServers['scott-leese'],
              click: (item) => {
                store.set('mcpServers.scott-leese', item.checked);
                updateTrayMenu();
              },
            },
          ],
        },
        {
          label: 'Premium Tier',
          submenu: [
            {
              label: 'Gary Vaynerchuk',
              type: 'checkbox',
              checked: mcpServers['gary-vaynerchuk'],
              click: (item) => {
                store.set('mcpServers.gary-vaynerchuk', item.checked);
                updateTrayMenu();
              },
            },
            {
              label: 'Jill Rowley',
              type: 'checkbox',
              checked: mcpServers['jill-rowley'],
              click: (item) => {
                store.set('mcpServers.jill-rowley', item.checked);
                updateTrayMenu();
              },
            },
            {
              label: 'Andrew Ng',
              type: 'checkbox',
              checked: mcpServers['andrew-ng'],
              click: (item) => {
                store.set('mcpServers.andrew-ng', item.checked);
                updateTrayMenu();
              },
            },
          ],
        },
        {
          label: 'Regular Tier',
          submenu: [
            {
              label: 'Maya Chen',
              type: 'checkbox',
              checked: mcpServers['maya-chen'],
              click: (item) => {
                store.set('mcpServers.maya-chen', item.checked);
                updateTrayMenu();
              },
            },
            {
              label: 'Jordan Williams',
              type: 'checkbox',
              checked: mcpServers['jordan-williams'],
              click: (item) => {
                store.set('mcpServers.jordan-williams', item.checked);
                updateTrayMenu();
              },
            },
            {
              label: 'Priya Sharma',
              type: 'checkbox',
              checked: mcpServers['priya-sharma'],
              click: (item) => {
                store.set('mcpServers.priya-sharma', item.checked);
                updateTrayMenu();
              },
            },
            {
              label: 'Marcus Thompson',
              type: 'checkbox',
              checked: mcpServers['marcus-thompson'],
              click: (item) => {
                store.set('mcpServers.marcus-thompson', item.checked);
                updateTrayMenu();
              },
            },
          ],
        },
        {
          label: 'Spotlight',
          submenu: [
            {
              label: 'David Martinez',
              type: 'checkbox',
              checked: mcpServers['david-martinez'],
              click: (item) => {
                store.set('mcpServers.david-martinez', item.checked);
                updateTrayMenu();
              },
            },
          ],
        },
      ],
    },
    {
      label: 'Knowledge Graph',
      type: 'checkbox',
      checked: mcpServers['memento-powerpak'],
      click: (item) => {
        store.set('mcpServers.memento-powerpak', item.checked);
        updateTrayMenu();
      },
    },
    { type: 'separator' },
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Minimize to Tray',
          type: 'checkbox',
          checked: store.get('minimizeToTray') as boolean,
          click: (item) => {
            store.set('minimizeToTray', item.checked);
          },
        },
        {
          label: 'Start Minimized',
          type: 'checkbox',
          checked: store.get('startMinimized') as boolean,
          click: (item) => {
            store.set('startMinimized', item.checked);
          },
        },
        {
          label: 'Launch at Startup',
          type: 'checkbox',
          checked: store.get('launchAtStartup') as boolean,
          click: (item) => {
            store.set('launchAtStartup', item.checked);
            app.setLoginItemSettings({
              openAtLogin: item.checked,
            });
          },
        },
      ],
    },
    { type: 'separator' },
    {
      label: 'Neo4j Browser',
      click: () => {
        shell.openExternal('http://localhost:7474');
      },
    },
    { type: 'separator' },
    {
      label: 'Quit PowerPak',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray?.setContextMenu(contextMenu);
}

/**
 * Start Next.js development server
 */
async function startNextJsServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Starting Next.js server...');

    const nextJsPath = path.join(__dirname, '../../better-chatbot');

    // Always run in development mode for now (no build required)
    // TODO: For production, build Next.js first and use 'pnpm start'
    nextJsServer = spawn('pnpm', ['dev'], {
      cwd: nextJsPath,
      stdio: 'pipe',
      shell: true,
    });

    nextJsServer.stdout?.on('data', (data) => {
      const output = data.toString();
      console.log('[Next.js]', output);

      // Check if server is ready
      if (output.includes('Ready') || output.includes('started server')) {
        resolve();
      }
    });

    nextJsServer.stderr?.on('data', (data) => {
      console.error('[Next.js Error]', data.toString());
    });

    nextJsServer.on('error', (error) => {
      console.error('Failed to start Next.js server:', error);
      reject(error);
    });

    nextJsServer.on('exit', (code) => {
      console.log(`Next.js server exited with code ${code}`);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      resolve(); // Resolve anyway and try to connect
    }, 30000);
  });
}

/**
 * Stop Next.js server
 */
function stopNextJsServer() {
  if (nextJsServer) {
    console.log('Stopping Next.js server...');
    nextJsServer.kill();
    nextJsServer = null;
  }
}

/**
 * App initialization
 */
app.whenReady().then(async () => {
  try {
    // Register IPC handlers
    registerIpcHandlers();

    // Start Next.js server
    await startNextJsServer();

    // Wait a bit for server to be fully ready
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create window and tray
    createWindow();
    createTray();

    // Set app user model ID for Windows notifications
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.mcpworld.powerpak');
    }

    // Show welcome notification
    new Notification({
      title: 'PowerPak Desktop Started',
      body: 'Your AI-powered knowledge assistant is ready!',
    }).show();
  } catch (error) {
    console.error('Failed to start app:', error);
    app.quit();
  }
});

/**
 * Handle all windows closed
 */
app.on('window-all-closed', () => {
  // On macOS, apps typically stay open even with no windows
  if (process.platform !== 'darwin') {
    if (!store.get('minimizeToTray')) {
      app.quit();
    }
  }
});

/**
 * Handle app activation (macOS)
 */
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

/**
 * Cleanup on quit
 */
app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  stopNextJsServer();
  cleanupIpcHandlers();
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
