import WebSocket from 'ws';

import {wsServer} from "./server";
import {SocketMessage, SocketMessageType} from "../interfaces/SocketMessage";
import serialIn from "./serialIn";
import store from './store';
import {fetchDevList} from "./deviceList";

// const dataHistory: SocketMessage<Telegram>[] = [];
// const rssiHistory: SocketMessage<RssiNoise>[] = [];
const errors: string[] = [];

export function send(ws: WebSocket, type: SocketMessageType, payload: any = null) {
  ws.send(JSON.stringify({type: type.toString(), payload}));
}

export function broadcast(type: SocketMessageType, payload: any = null) {
  wsServer.clients.forEach(client => {
    if (client.readyState !== WebSocket.OPEN) return;
    client.send(JSON.stringify({type, payload}));
  });
}

export function addError(err: Error) {
  console.error(err);
  errors.unshift(err.message);
  broadcast(SocketMessageType.error, err.message);
}

function serialCloseHandler() {
  addError(new Error('Serial connection closed.'));
}

export async function begin(): Promise<void> {
  try {
    errors.splice(0, errors.length);

    await fetchDevList().catch(addError);

    const port = store.getConfig('serialPort');
    const serialBaudRate = store.getConfig('serialBaudRate');
    if (!port) throw new Error("No SerialPort configured.");
    if(serialIn.con) serialIn.con.off('close', serialCloseHandler);
    const stream = await serialIn.open(port, serialBaudRate);
    stream.on('data', (data: SocketMessage<any>) => {
      broadcast(data.type, data.payload);
      // if(data.type === 'telegram') {
      //   dataHistory.push(data);
      //   if (dataHistory.length > 5000) {
      //     dataHistory.splice(0, dataHistory.length - 5000);
      //   }
      // } else if(data.type === 'rssiNoise') {
      //   rssiHistory.push(data);
      //   if (rssiHistory.length > 5000) {
      //     rssiHistory.splice(0, rssiHistory.length - 5000);
      //   }
      // }
    });
    serialIn.con.on('close', serialCloseHandler);
    stream.on('error', addError);
  } catch(e) {
    addError(e);
  }
}

wsServer.on('connection', (ws: WebSocket) => {
  // Propagate config
  broadcast(SocketMessageType.config, store.getConfigData());

  // Propagate errors
  errors.forEach(err => send(ws,SocketMessageType.error, err));

  ws.on('message', (data: string) => {
    let type, payload;
    try {
      ({type, payload} = JSON.parse(data));
    } catch (e) {
      console.error('Could not parse WebSocket message:', data);
      return;
    }
    // RPC
    switch (type) {
      // case 'history':
      //   dataHistory.forEach(ws.send.bind(ws));
      //   rssiHistory.forEach(ws.send.bind(ws));
      //   break;
      case 'config':
        serialIn.listPorts()
          .then(ports => {
            store.setConfig("availableSerialPorts", ports);
            send(ws, SocketMessageType.config, store.getConfigData());
          });
        break;
      case 'set config':
        store.setConfigData(payload);
        begin();
        break;
    }
  });
});
