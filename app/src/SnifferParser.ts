import {Transform, TransformOptions} from 'stream';
import devList from './deviceList';
import {Device} from "../interfaces/Device";
import {Telegram} from "../interfaces/Telegram";

const strPosBeginnings = {
  rssi: 1,
  len: 3,
  cnt: 5,
  flags: 7,
  type: 9,
  fromAddr: 11,
  toAddr: 17,
  payload: 23
};

function getFlags(flagsInt: number) {
  const res = [];
  if (flagsInt & 0x01) res.push("WKUP");
  if (flagsInt & 0x02) res.push("WKMEUP");
  if (flagsInt & 0x04) res.push("BCAST");
  if (flagsInt & 0x10) res.push("BURST");
  if (flagsInt & 0x20) res.push("BIDI");
  if (flagsInt & 0x40) res.push("RPTED");
  if (flagsInt & 0x80) res.push("RPTEN");
  if (flagsInt == 0x00) res.push("HMIP_UNKNOWN");

  return res.sort();
}

function getType(typeInt: number) {
  if (typeInt == 0x00) return "DEVINFO";
  else if (typeInt == 0x01) return "CONFIG";
  else if (typeInt == 0x02) return "RESPONSE";
  else if (typeInt == 0x03) return "RESPONSE_AES";
  else if (typeInt == 0x04) return "KEY_EXCHANGE";
  else if (typeInt == 0x10) return "INFO";
  else if (typeInt == 0x11) return "ACTION";
  else if (typeInt == 0x12) return "HAVE_DATA";
  else if (typeInt == 0x3E) return "SWITCH_EVENT";
  else if (typeInt == 0x3F) return "TIMESTAMP";
  else if (typeInt == 0x40) return "REMOTE_EVENT";
  else if (typeInt == 0x41) return "SENSOR_EVENT";
  else if (typeInt == 0x53) return "SENSOR_DATA";
  else if (typeInt == 0x58) return "CLIMATE_EVENT";
  else if (typeInt == 0x5A) return "CLIMATECTRL_EVENT";
  else if (typeInt == 0x5E) return "POWER_EVENT";
  else if (typeInt == 0x5F) return "POWER_EVENT_CYCLIC";
  else if (typeInt == 0x70) return "WEATHER";
  else if (typeInt >= 0x80) return "HMIP_TYPE";
  return "";
}

function getDevice(addr: number): Device | undefined {
  return devList.devices.find((dev: Device) => dev.address === addr);
}

export default class SnifferParser extends Transform {
  constructor(opts: TransformOptions = {}) {
    super({...opts, objectMode: true});
  }

  _transform(line: string, encoding: string, callback: Function) {
    // Messages have to start with ":"
    if (!line.startsWith(':') || !line.endsWith(';')) {
      console.error('I:', line);
      return callback();
    }

    if (line.length === 4) {
      // RSSI Noise measure
      this.push({
        type: 'rssiNoise',
        payload: [Date.now(), -1 * parseInt(line.substr(1, 2), 16)],
      });
      return callback();
    }

    const fromAddr = parseInt(line.substr(11, 6), 16);
    const toAddr = parseInt(line.substr(17, 6), 16);
    const fromDev = getDevice(fromAddr);
    const toDev = getDevice(toAddr);

    const telegram: Telegram = {
      tstamp: Date.now(),
      rssi: -1 * parseInt(line.substr(1, 2), 16),
      len: parseInt(line.substr(3, 2), 16),
      cnt: parseInt(line.substr(5, 2), 16),
      flags: getFlags(parseInt(line.substr(7, 2), 16)),
      type: getType(parseInt(line.substr(9, 2), 16)),
      fromAddr,
      toAddr,
      fromName: fromDev && fromDev.name || '',
      toName: toDev && toDev.name || '',
      fromSerial: fromDev && fromDev.serial || '',
      toSerial: toDev && toDev.serial || '',
      toIsIp: toDev && toDev.serial && toDev.serial.length === 14 || toDev && toDev.serial === 'HmIP-RF',
      fromIsIp: fromDev && fromDev.serial && fromDev.serial.length === 14 || fromDev && fromDev.serial === 'HmIP-RF',
      payload: line.substring(23, line.length - 1),
    };

    this.push({
      type: 'telegram',
      payload: telegram
    });
    callback();
  }
}
