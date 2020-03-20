import {Transform, TransformOptions} from 'stream';
import {Telegram} from "../interfaces/Telegram";
import {SocketMessage} from "../interfaces/SocketMessage";

const dcs = new Map<number, { val: number, counts: [number, number][] }>();

export default class DutyCyclePerTelegram extends Transform {
  constructor(opts: TransformOptions = {}) {
    super({...opts, objectMode: true});
  }

  _transform(obj: SocketMessage<any>, encoding: string, cb: Function) {
    if (obj.type === 'telegram') {
      const telegram = obj.payload as Telegram;
      if (!dcs.has(telegram.fromAddr)) {
        dcs.set(telegram.fromAddr, {
          val: 0,
          counts: []
        });
      }
      let data = dcs.get(telegram.fromAddr);
      // Calc DC and update value
      // (len + 11) * 0.81 => transmission time in ms
      // 1% airtime allowed => 36sec * 1000ms/sec is 100% DC
      let sendTime = 0;
      if(telegram.flags.includes('BURST')) {
        // 360 ms burst instead of 4 bytes preamble
        sendTime = 360 + (telegram.len + 7) * 0.81;
      } else {
        sendTime = (telegram.len + 11) * 0.81;
      }
      const dc = sendTime / 360;
      data.val += dc;
      // Store tstamp and DC for this sender
      data.counts.push([telegram.tstamp, dc]);
      // Remove DC older than 1h
      const firstTstampOfHour = telegram.tstamp - 3600000;
      while (data.counts[0][0] < firstTstampOfHour) {
        data.val -= data.counts[0][1];
        data.counts.shift();
      }
      obj.payload.dc = Math.round(data.val * 10) / 10;
      // console.log('DC', telegram.fromName, data.val);
    }
    this.push(obj);
    cb();
  }
};
