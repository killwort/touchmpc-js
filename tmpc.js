const electron = require('electron');
const {app, BrowserWindow, ipcMain} = electron;
const mpd = require('mpd');
let win;

var connectionSettings = {
  port: 6600,
  host: 'router.mediaparts'
};
let mpdClient;
ipcMain.on('interface-ready', event => {
  mpdClient = mpd.connect(connectionSettings);
  mpdClient.on('ready', () => {
    event.sender.send('mpd-ready')
  });
  mpdClient.on('system', name => event.sender.send('mpd-update', name));
  mpdClient.on('error', () => event.sender.send('mpd-error', arguments));
});
ipcMain.on('mpd-command', (event, cmd, args, reqId) => {
  if (mpdClient)
    mpdClient.sendCommand(mpd.cmd(cmd, args), (err, message) => {
      event.sender.send('mpd-command-response', err, message, reqId);
    });
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