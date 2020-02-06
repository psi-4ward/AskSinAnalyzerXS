import http from 'http';
import path from 'path';
import express from 'express';
import WebSocket from 'ws';

export let htdocsPath: string;
if(process.env.HTDOCS_PATH) {
  htdocsPath = process.env.HTDOCS_PATH;
} else if (process.versions.electron) {
  htdocsPath = path.resolve(__dirname, '../../../htdocs');
} else {
  htdocsPath = path.resolve(__dirname, '../htdocs');
}

const app = express();
app.use(express.static(htdocsPath));

export const httpServer = http.createServer(app);
export const wsServer = new WebSocket.Server({server: httpServer});

function noop() {
}

function heartbeat() {
  this.isAlive = true;
}

wsServer.on('connection', (ws: WebSocket & { isAlive: boolean }) => {
  ws.isAlive = true;
  ws.on('pong', heartbeat);
});

setInterval(function ping() {
  wsServer.clients.forEach(function each(ws: WebSocket & { isAlive: boolean }) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 15 * 1000);
