import fs from 'fs';
import path from 'path';
import {get as httpGet, IncomingMessage} from "http";
import {URL} from 'url';
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

function _fetch(url: string) {
  const isCCU = store.getConfig('isCCU');

  return new Promise((resolve, reject) => {
    httpGet(new URL(url), (res: IncomingMessage) => {
      if (res.statusCode !== 200) {
        return reject(`${res.statusCode} ${res.statusMessage}`);
      }
      res.setEncoding(isCCU ? "latin1" : 'utf-8');
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        if (isCCU) {
          const bodyJson = body.match(/<ret>(.+?)<\/ret>/);
          if (!bodyJson) {
            return reject('Invalid XML');
          }
          body = unescapeHTML(bodyJson[1]);
        }
        let deviceListRes = null;
        try {
          deviceListRes = JSON.parse(body) as DeviceListResponse;
        } catch (e) {
          return reject(e)
        }
        const sanitizedUrl = url.replace(/(?:https?:\/\/)?([^:]+:[^@]+)@/, '');
        deviceList.devices = deviceListRes.devices;
        deviceList.createdAt = deviceListRes.created_at * 1000;
        deviceList.sanitizedUrl = sanitizedUrl;
        console.log('Fetched Device List from', sanitizedUrl);
        resolve(deviceList);
      });
    }).on('error', e => reject(e));
  });
}

export async function fetchDevList() {
  const deviceListUrl = store.getConfig('deviceListUrl');
  const isCCU = store.getConfig('isCCU');
  const appPath = store.appPath;

  if (!deviceListUrl) return;

  let url = isCCU
    ? `http://${deviceListUrl}:8181/a.exe?ret=dom.GetObject(ID_SYSTEM_VARIABLES).Get(%22AskSinAnalyzerDevList%22).Value()`
    : deviceListUrl;

  const file = path.resolve(appPath, 'deviceList.json');

  try {
    console.log('fetch', url);
     await _fetch(url);
     fs.writeFileSync(file, JSON.stringify(deviceList), 'utf-8');
  } catch(err) {
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

export default deviceList;

