const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
let isDev = false;
try {
  isDev = require('electron-is-dev');
} catch (e) {
  isDev = false;
}
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, 'index.html')}`
  );

  // Geliştirici araçlarını aç (geliştirme modunda)
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Pencere kontrolü için event listener'lar
  ipcMain.on('window-minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('window-close', () => {
    mainWindow.close();
  });

  // React'tan gelen başlık güncelleme mesajlarını dinle
  ipcMain.on('update-title', (event, { component, username }) => {
    let title = 'Chat App';
    
    switch(component) {
      case 'friends':
        title = `${username} - Arkadaşlar`;
        break;
      case 'chat':
        title = `${username} - Sohbet`;
        break;
      case 'settings':
        title = `${username} - Ayarlar`;
        break;
      default:
        title = 'Chat App';
    }
    
    mainWindow.setTitle(title);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Güncelleme olayları
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
}); 