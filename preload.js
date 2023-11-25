const { contextBridge, ipcRenderer } = require('electron');
const os = require('os');
const path = require('path');
const fs = require('fs');

contextBridge.exposeInMainWorld('os', {
    homedir: () => os.homedir()
});

contextBridge.exposeInMainWorld('path', {
    join: (...args) => path.join(...args)
});

contextBridge.exposeInMainWorld('fs', {
    writeFile: (...args) => fs.writeFile(...args)
});

contextBridge.exposeInMainWorld('electron', {
    saveFile: async (content) => {
      const { filePath } = await ipcRenderer.invoke('save-dialog', content);
      return filePath;
    },
});