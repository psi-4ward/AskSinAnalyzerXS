import {parse} from 'url';
import {IncomingMessage, request} from "http";

export function exec(action: string, opts: any) {
  const {protocol, auth, host, port, path} = parse(opts.url);
  return new Promise((resolve, reject) => {
    request({
        protocol, auth, host, port, path,
        method: (action === 'httpPost') ? 'POST' : 'GET'
      },
      (res: IncomingMessage) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`${res.statusCode} ${res.statusMessage}`));
        }
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      })
      .end();
  });
}
