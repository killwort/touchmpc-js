const electron = require('electron');
const {app, BrowserWindow, ipcMain} = electron;
const mpd = require('mpd');
const config = require('./js/config');
let win;

let mpdClient;
ipcMain.on('interface-ready', event => {
  config.getConfig().then(connectionSettings => {
    mpdClient = mpd.connect(connectionSettings.mpd);
    mpdClient.on('error',()=>{
      console.log('IPC error',arguments);
    });
    mpdClient.on('ready', () => {
      event.sender.send('mpd-ready');
      console.log('IPC ready');
    });
    mpdClient.on('system', name => event.sender.send('mpd-update', name));
    mpdClient.on('error', () => event.sender.send('mpd-error', arguments));
  });
});
ipcMain.on('mpd-command', (event, cmd, args, reqId) => {
  if (mpdClient)
    try {
      mpdClient.sendCommand(mpd.cmd(cmd, args), (err, message) => {
        event.sender.send('mpd-command-response', err, message, reqId);
      });
    } catch (e) {
      event.sender.send('mpd-command-response', 'error', JSON.stringify(e), reqId);
    }
  else
    event.sender.send('mpd-command-response', 'not connected', null, reqId);
});

function createWindow() {
  win = new BrowserWindow({ width: 760, height: 480 });
  win.setMenu(null);
  win.loadURL(`file://${__dirname}/templates/interface.html`);
  win.on('closed', () => {
    win = null;
  });
  win.webContents.openDevTools();
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
