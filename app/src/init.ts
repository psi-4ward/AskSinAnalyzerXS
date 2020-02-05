import {httpServer} from './server';
import {AddressInfo} from 'net';
import {begin} from './websocket-rpc';
import serialIn from "./serialIn";
import store from "./store";
import {fetchDevList} from "./deviceList";

async function listen(): Promise<number> {
  return new Promise((resolve) => {
    httpServer.listen(process.env.PORT || 0, () => {
      const {port} = httpServer.address() as AddressInfo;
      console.log(`Server started on port ${port}`);
      resolve(port);
    });
  });
}

httpServer.on('error', e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});

export async function init(): Promise<number> {
  store.setConfig("availableSerialPorts", await serialIn.listPorts());
  if(store.getConfig('serialPort')) begin();
  return listen();
}
