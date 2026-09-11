const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopChaos', {
  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },
  openExternalUrl: (url) => {
    ipcRenderer.send('open-external-url', url);
  },
  quitApp: () => {
    ipcRenderer.send('quit-app');
  }
});
