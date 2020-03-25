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

const exp: DeviceList = {
  createdAt: null,
  devices: [],
};

export async function fetchDevList() {

  let deviceListUrl = store.getConfig('deviceListUrl');
  const isCCU = store.getConfig('isCCU');

  if (!deviceListUrl) return;

  let url = isCCU
    ? `http://${deviceListUrl}:8181/a.exe?ret=dom.GetObject(ID_SYSTEM_VARIABLES).Get(%22AskSinAnalyzerDevList%22).Value()`
    : deviceListUrl;

  return new Promise((resolve, reject) => {
    httpGet(new URL(url), (res: IncomingMessage) => {
      if(res.statusCode !== 200) {
        return reject(`${res.statusCode} ${res.statusMessage}`);
      }
      res.setEncoding(isCCU ? "latin1" : 'utf-8');
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        if(isCCU) {
          const bodyJson = body.match(/<ret>(.+?)<\/ret>/);
          if (!bodyJson) {
            return reject('Invalid XML');
          }
          body = unescapeHTML(bodyJson[1]);
        }
        let deviceList = null;
        try {
          deviceList = JSON.parse(body) as DeviceListResponse;
        } catch (e) {
          return reject(e)
        }
        exp.devices = deviceList.devices;
        exp.createdAt = deviceList.created_at * 1000;
        console.log('Fetched Device List from', deviceListUrl.replace(/(?:https?:\/\/)?([^:]+:[^@]+)@/, ''));
        resolve(exp);
      });
    }).on('error', e => reject(e));
  });

}

export default exp;

