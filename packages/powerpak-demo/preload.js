// Preload script for security bridge between main and renderer
const { contextBridge } = require('electron');

// Expose any APIs needed by the renderer process
contextBridge.exposeInMainWorld('powerpak', {
  platform: process.platform,
  version: '1.0.0'
});
