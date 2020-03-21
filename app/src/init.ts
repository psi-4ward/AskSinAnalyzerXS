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
  console.error(e);
  process.exit(1);
});

export async function init(forcePortOpening: boolean = false): Promise<number> {
  const storedPort = store.getConfig('serialPort');
  if(forcePortOpening) {
    begin();
  } else {
    const uartPorts = await serialIn.listPorts();
    store.setConfig("_availableSerialPorts", uartPorts);
    // auto-begin if storedPort is in the liste of available ports
    if (storedPort && uartPorts.some((p) => p.path === storedPort)) {
      begin();
    }
  }
  return listen();
}
