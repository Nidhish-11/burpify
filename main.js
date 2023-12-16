const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const isDev = process.env.NODE_ENV !== 'production';

// Create app window
function createWindow() {
    const Window = new BrowserWindow({
        title: "Burpify",
        width: 770, //1225 if(isDev)
        height: 840,
        resizable: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // if(isDev)
    // Window.webContents.openDevTools();
    Window.removeMenu();

    Window.loadFile(path.join(__dirname, './renderer/index.html'));
}

// App ready
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Menu template
const menu = [
    {
        role: 'fileMenu'
    }
];

// Quit for mac
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('save-dialog', async (event, content) => {
    const result = await dialog.showSaveDialog({
      defaultPath: path.join(app.getPath('desktop'), 'Config.json'),
    });
  
    if (!result.canceled) {
      const filePath = result.filePath;
      await fs.promises.writeFile(filePath, JSON.stringify(content));
      return { filePath };
    }
  
    return { filePath: null };
});