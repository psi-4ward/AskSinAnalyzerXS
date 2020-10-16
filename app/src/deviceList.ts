import fs from 'fs';
import path from 'path';
import got from 'got';
import {Device, DeviceList} from "../interfaces/Device";
import store from "./store";

export interface DeviceListResponse {
  created_at: number;
  devices: Device[]
}

const htmlEntities: {[key: string]: string} = {
  nbsp: ' ',
  cent: '¢',
  pound: '£',
  yen: '¥',
  euro: '€',
  copy: '©',
  reg: '®',
  lt: '<',
  gt: '>',
  quot: '"',
  amp: '&',
  apos: '\''
};

function unescapeHTML(str: string): string {
  return str.replace(/&([^;]+);/g, function (entity, entityCode) {
    let match;

    if (entityCode in htmlEntities) {
      return htmlEntities[entityCode];
    } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
      return String.fromCharCode(parseInt(match[1], 16));
    } else if (match = entityCode.match(/^#(\d+)$/)) {
      return String.fromCharCode(~~match[1]);
    } else {
      return entity;
    }
  });
}

const deviceList: DeviceList = {
  createdAt: null,
  sanitizedUrl: null,
  devices: [],
};

function _setDeviceListDate(url: string, data: DeviceListResponse) {
  const sanitizedUrl = url.replace(/(?:https?:\/\/)?([^:]+:[^@]+)@/, '');
  deviceList.devices = data.devices;
  deviceList.createdAt = data.created_at * 1000;
  deviceList.sanitizedUrl = sanitizedUrl;
  console.log('Fetched Device List from', sanitizedUrl);
}

async function _fetch(url: string) {
  const isCCU = store.getConfig('isCCU');

  let body = await got(url, {
    encoding: isCCU ? "latin1" : 'utf-8'
  }).text();

  if (isCCU) {
    const bodyJson = body.match(/<ret>(.+?)<\/ret>/);
    if (!bodyJson) {
      throw new Error('Invalid XML');
    }
    body = unescapeHTML(bodyJson[1]);
  }
  let deviceListRes = null;
  deviceListRes = JSON.parse(body) as DeviceListResponse;
  _setDeviceListDate(url, deviceListRes);
  return deviceList;
}

export async function fetchDevList() {
  let deviceListUrl = store.getConfig('deviceListUrl');
  const isCCU = store.getConfig('isCCU');
  const appPath = store.appPath;

  if (!deviceListUrl) return;

  if(isCCU && deviceListUrl.startsWith('http')) {
    deviceListUrl = deviceListUrl.replace(/^https?:\/\//,'');
  }

  let url = isCCU
    ? `http://${deviceListUrl}:8181/a.exe?ret=dom.GetObject(ID_SYSTEM_VARIABLES).Get(%22AskSinAnalyzerDevList%22).Value()`
    : deviceListUrl;

  const file = path.resolve(appPath, 'deviceList.json');

  try {
     if(url.startsWith('http')) {
       await _fetch(url);
     } else {
       console.log('Read device-list from file', url);
       _setDeviceListDate(url, JSON.parse(fs.readFileSync(url, 'utf-8')));
     }
     fs.writeFileSync(file, JSON.stringify(deviceList), 'utf-8');
  } catch(err) {
    console.error(err);
    try {
      Object.assign(deviceList, JSON.parse(fs.readFileSync(file, 'utf-8')));
      const err = new Error('Using cached version, created at ' + (new Date(deviceList.createdAt)).toLocaleString() + ' from ' + deviceList.sanitizedUrl);
      // @ts-ignore
      err.code = 12;
      throw err;
    } catch (err2) {
      if(err2.code !== 12) throw err;
      else throw err2;
    }
  }
}

// Refetch deviceList every hour
setTimeout(async () => {
  try {
    await fetchDevList()
  } catch (e) {
  }
}, 60*60*1000);


export default deviceList;
