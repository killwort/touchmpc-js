const electron = require('electron');
const {app, BrowserWindow, ipcMain} = electron;
const mpd = require('mpd');
const config = require('./js/config');
let win;

let getMpdConnection = () => new Promise((resolve, reject) => {
    var mpdConnection;
    config.getConfig()
        .then(connectionSettings => {
            mpdConnection = mpd.connect(connectionSettings.mpd);
            mpdConnection.on('error',
                () => {
                    reject(mpdConnection, arguments);
                });
            mpdConnection.on('ready',
                () => {
                    resolve(mpdConnection);
                });
        });
});
let mpdClientPromise = getMpdConnection();
ipcMain.on('interface-ready',
    event => {
        var connect = () => {
            mpdClientPromise.then(mpd => {
                mpd.on('system',
                    name => event.sender.send('mpd-update', name));
                    mpd.on('error', () => event.sender.send('mpd-error', arguments));
            },
                () => {
                    mpdClientPromise = getMpdConnection();
                    connect();
                }
            );
        }
        connect();
    });
ipcMain.on('mpd-command', (event, cmd, args, reqId) => {
    mpdClientPromise.then(cnn => {
                try {
                    cnn.sendCommand(mpd.cmd(cmd, args),
                        (err, message) => {
                            event.sender.send('mpd-command-response', err, message, reqId);
                        });
                } catch (e) {
                    event.sender.send('mpd-command-response', 'error', JSON.stringify(e), reqId);
                }
            },
            () => {
                event.sender.send('mpd-command-response', 'not connected', null, reqId);
            });
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
