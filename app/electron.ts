import {app, screen, BrowserWindow} from 'electron';
import store from "./src/store";
import {init} from './src/init';
import * as path from "path";

store.appPath = app.getPath('userData');
console.log('UserData-Path:', app.getPath('userData'));

function createWindow(url: string) {
  const {width, height} = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
    width: Math.round(width * 0.7) ,
    height: height,
    webPreferences: {
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'logo.jpg')
  });
  win.loadURL(url);
}

app.on('ready', async () => {
  const port = await init();
  createWindow(`http://localhost:`+ port + '/index.html');
});
