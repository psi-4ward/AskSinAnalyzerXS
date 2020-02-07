import {existsSync} from 'fs';
import {resolve} from 'path';
import commander from 'commander';
import {init} from './src/init';
import store from "./src/store";
import serialIn from "./src/serialIn";

let version = '0.0.0';
if(existsSync(resolve(__dirname, './package.json'))) {
  ({version} = require('./package.json'));
} else if(existsSync(resolve(__dirname, '../package.json'))) {
  ({version} = require('../package.json'));
}

  commander
  .description(`AskSin Analyzer XS v${version}\nhttps://github.com/psi-4ward/AskSinAnalyzerXS`)
  .version(version, '-v, --version', 'output the current version')
  .option('-l, --list-ports', 'List available serial ports')
  .option('-p, --serial-port <serialPort>', 'SerialPort')
  .option('-b, --baud <baudRate>', 'BaudRate of SerialPort', 57600)
  .option('-u, --url <deviceListUrl>', 'Host or IP of the CCU or URL to fetch the device-list')
  .option('-c, --ccu <bool>', 'Fetch the device-list from a CCU',
      arg => !(arg === 'false' || arg === 'no' || arg === '0'), true)
  .parse(process.argv);

const opts = commander.opts();

store.persistData = false;

if(!process.env.PORT) {
  process.env.PORT = "8081";
}

(async function f() {
  if (opts.listPorts) {
    await serialIn.listPorts();
    return;
  }

  store.setConfig('serialPort', opts.serialPort);
  store.setConfig('serialBaudRate', opts.baud);
  store.setConfig('isCCU', opts.ccu);
  store.setConfig('deviceListUrl', opts.url);

  await init();
})();
