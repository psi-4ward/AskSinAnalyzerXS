import {Transform, TransformOptions} from 'stream';
import {Telegram} from "../interfaces/Telegram";
import {SocketMessage} from "../interfaces/SocketMessage";
import store from './store';
import {exec} from './triggerActions';
import errors from "./errors";

export default class Trigger extends Transform {
  rssiTrigger: {
    tstamp: number;
    active: boolean;
    triggered: boolean;
  };

  constructor(opts: TransformOptions = {}) {
    super({...opts, objectMode: true});
    this.rssiTrigger = {
      tstamp: 0,
      active: false,
      triggered: false
    };
  }

  _transform(obj: SocketMessage<any>, encoding: string, cb: Function) {
    // we do not alter the obj
    this.push(obj);
    cb();

    if (obj.type === 'telegram') {

    } else if (obj.type === 'rssiNoise') {
      const trigger = store.getConfig('rssiNoiseTrigger');
      if (!trigger.enabled) return;
      const [tstamp, rssi] = obj.payload;
      if (rssi > trigger.value) {
        if(this.rssiTrigger.active === false) {
          this.rssiTrigger.tstamp = tstamp;
        }
        this.rssiTrigger.active = true;
        if(!this.rssiTrigger.triggered && tstamp - this.rssiTrigger.tstamp > trigger.timeWindow * 1000) {
          console.log(`RSSI-Noise alert triggered`, trigger.actionOpts.url);
          exec(trigger.action, trigger.actionOpts)
            .catch(err => {
              errors.add('rssi-noise-trigger', `RSSI-Noise Trigger: ${err.toString()}`);
              console.error('Error RSSI-Noise Trigger', err);
            });
          this.rssiTrigger.triggered = true;
          this.rssiTrigger.tstamp = tstamp;
        }
      } else {
        this.rssiTrigger.active = false;
        this.rssiTrigger.triggered = false;
      }
    }

  }
};
