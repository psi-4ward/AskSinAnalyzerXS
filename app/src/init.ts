import {httpServer, htdocsPath} from './server';
import {AddressInfo} from 'net';
import {begin} from './websocket-rpc';
import serialIn from "./serialIn";
import store from "./store";

async function listen(): Promise<number> {
  return new Promise((resolve) => {
    httpServer.listen(process.env.PORT || 0, () => {
      const {port} = httpServer.address() as AddressInfo;
      console.log(`Server started on port ${port}`);
      console.log('Serving UI from', htdocsPath);
      resolve(port);
    });
  });
}

httpServer.on('error', e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});

export async function init(): Promise<number> {
  const uartPorts = await serialIn.listPorts();
  const storedPort = store.getConfig('serialPort');
  store.setConfig("_availableSerialPorts", uartPorts);
  if(storedPort && uartPorts.some((p) => p.path === storedPort)){
    begin();
  }
  return listen();
}
