import WebSocket from 'ws';

import {wsServer} from "./server";
import {SocketMessage, SocketMessageType} from "../interfaces/SocketMessage";
import serialIn from "./serialIn";
import store from './store';
import {fetchDevList} from "./deviceList";
import persistentStorage from './persistentStorage';
import errors from "./errors";

export function send(ws: WebSocket, type: SocketMessageType, payload: any = null, uuid: string = null) {
  ws.send(JSON.stringify({type: type.toString(), payload, uuid}));
}

export function broadcast(type: SocketMessageType, payload: any = null) {
  wsServer.clients.forEach(client => {
    if (client.readyState !== WebSocket.OPEN) return;
    client.send(JSON.stringify({type, payload}));
  });
}

function broadcastConfig(uuid: string = null) {
  broadcast(SocketMessageType.config, {
    ...store.getConfigData(),
    _appPath: store.appPath
  });
}

errors.on('change', () => {
  broadcast(SocketMessageType.error, errors.getErrors());
});

function serialCloseHandler() {
  errors.add('serialClosed', 'Serial connection closed.');
}

export async function begin(): Promise<void> {
  errors.clear();
  broadcastConfig();

  await fetchDevList().catch((err) => {
    errors.add('devListFetch', `Error fetching device list: ${err.toString()}`)
  });

  const port = store.getConfig('serialPort');
  const serialBaudRate = store.getConfig('serialBaudRate');
  if (!port) {
    errors.add('noSerialPortConfigured', "No SerialPort configured.");
    return;
  }

  let stream;
  try {
    if (serialIn.con) serialIn.con.off('close', serialCloseHandler);
    stream = await serialIn.open(port, serialBaudRate);
  } catch(e) {
    errors.add('serialOpen', `Could not open serial port: ${e.toString()}`);
    return;
  }

  stream.on('data', (data: SocketMessage<any>) => {
    broadcast(data.type, data.payload);
  });

  if(store.getConfig('persistentStorage').enabled) {
    persistentStorage.enable(stream); // does not reject
  } else {
    persistentStorage.disable();
  }

  serialIn.con.on('close', serialCloseHandler);
  stream.on('error', (err) => {
    errors.add('snInStream', `Serial stream error: ${err.toString()}`);
  });
}

wsServer.on('connection', (ws: WebSocket) => {
  // Propagate config
  broadcastConfig();

  // Propagate errors
  send(ws,SocketMessageType.error, errors.getErrors());

  ws.on('message', async (data: string) => {
    let type, payload, uuid: string;
    try {
      ({type, payload, uuid} = JSON.parse(data));
    } catch (e) {
      console.error('Could not parse WebSocket message:', data);
      return;
    }
    // RPC
    switch (type) {
      case 'get csv-files':
        const files = await persistentStorage.getFiles();
        send(ws, SocketMessageType.csvFiles, files, uuid);
        break;
      case 'get config':
        serialIn.listPorts()
          .then(ports => {
            store.setConfig("availableSerialPorts", ports);
            send(ws, SocketMessageType.config, {
              ...store.getConfigData(),
              _appPath: store.appPath
            }, uuid);
          });
        break;
      case 'set config':
        store.setConfigData(payload);
        begin();
        break;
      case 'delete error':
        errors.delete(payload);
        break;
      case 'delete csv-file':
        await persistentStorage.deleteFile(payload);
        send(ws, SocketMessageType.confirm, true, uuid);
        break;
      case 'get csv-content':
        const content = await persistentStorage.getFileContent(payload);
        send(ws, SocketMessageType.confirm, content, uuid);
        break;
    }
  });
});
