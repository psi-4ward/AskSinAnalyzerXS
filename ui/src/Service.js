
export default class Service {

  data = {
    telegrams: [],
    devices: [],
    config: {
      isCCU: true,
      deviceListUrl: null,
      serialPort: null,
      serialBaudRate: 57600,
      availableSerialPorts: []
    },
    errors: [],
    currentVersion: null,
    latestVersion: null,
    devlistCreated: null,
    rssiLog: [],
  };
  ws = null;
  maxTelegrams = 100;

  constructor(maxTelegrams = 20000) {
    this.maxTelegrams = maxTelegrams;
  }

  async openWebsocket() {
    return new Promise((resolve, reject) => {
      // TODO: reconnect
      let resolved = false;
      this.ws = new WebSocket(`ws://${ document.location.host }/ws`);

      this.ws.onopen = () => {
        this.data.errors = [];
        resolved = true;
        resolve(this.ws);
      };

      this.ws.onerror = (err) => {
        const msg = 'Verbindung zum Analyzer wurde unterbrochen.';
        console.error(err);
        if(!resolved) {
          resolved = true;
          reject(new Error(msg));
        } else {
          this.data.errors.unshift(msg);
        }
      };

      this.ws.onclose = (err) => {
        this.data.errors.unshift('Verbindung zum Analyzer wurde getrennt.');
      };

      this.ws.onmessage = msg => {
        let data = JSON.parse(msg.data);
        // console.log('WS-Msg:', data);
        if (!Array.isArray(data)) data = [data];
        data.forEach(({ type, payload }) => {
          // console.info(type, payload);
          switch (type) {
            case 'telegram':
              this.addTelegram(payload);
              break;
            case 'rssiNoise':
              this.addRssiNoise(...payload);
              break;
            case 'error':
              this.data.errors = [payload, ...this.data.errors];
              break;
            case 'config':
              this.data.config = payload;
              break;
          }
        });
      };
    });
  }

  send(type, payload=null) {
    this.ws.send(JSON.stringify({type, payload}));
  }

  addRssiNoise(mtstamp, value) {
    const lastIndex = this.data.rssiLog.length - 1;
    // round milliseconds
    mtstamp = Math.round(mtstamp / 1000) * 1000;
    if(lastIndex > 0 && this.data.rssiLog[lastIndex][0] === mtstamp) {
      this.data.rssiLog[lastIndex][1] = Math.round((this.data.rssiLog[lastIndex][1] + value) / 2);
    } else {
      this.data.rssiLog.push([mtstamp, value]);
    }

    // Cap collection
    if (this.data.rssiLog.length > this.maxTelegrams) {
      this.data.rssiLog.splice(0, this.data.rssiLog.length - this.maxTelegrams);
    }
  }

  addTelegram(telegram) {
    // round milliseconds
    telegram.tstamp = Math.round(telegram.tstamp / 1000);
    this.data.telegrams.push(telegram);

    // Cap collection
    if (this.data.telegrams.length > this.maxTelegrams) {
      this.data.telegrams.splice(0, this.data.telegrams.length - this.maxTelegrams);
    }

    // Generate unique devices list
    let devices = new Set();
    this.data.telegrams.forEach(({ fromName, toName }) => {
      if (fromName && !devices.has(fromName)) devices.add(fromName);
      if (toName && !devices.has(toName)) devices.add(toName);
    });
    devices = [...devices].sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    this.data.devices.splice(0, this.data.devices.length, ...devices);
  }

  isUpdateAvailable() {
    return false;
    const { latestVersion, currentVersion } = this.data.espConfig;
    if (!latestVersion || !currentVersion) return false;
    const [aU, aL] = latestVersion.split('.');
    const [bU, bL] = currentVersion.split('.');
    return aU > bU || aU === bU && aL > bL;
  }

}
