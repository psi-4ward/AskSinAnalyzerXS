import commander from 'commander';
const {version} = require('../package.json');
import {init} from './src/init';
import store from "./src/store";
import serialIn from "./src/serialIn";

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

// if (!process.argv.slice(2).length) {
//   commander.help();
// }

(async function f() {
  if (opts.listPorts) {
    await serialIn.listPorts();
    return;
  }

  // if (!opts.serialPort) {
  //   console.error('error: required option \'-p, --serial-port <serialPort>\' not specified');
  //   process.exit(1);
  // }

  store.setConfig('serialPort', opts.serialPort);
  store.setConfig('serialBaudRate', opts.baud);
  store.setConfig('isCCU', opts.ccu);
  store.setConfig('deviceListUrl', opts.url);

  await init();
})();
