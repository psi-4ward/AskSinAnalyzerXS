function createUuid() {
  let dt = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export default class Service {

  data = {
    telegrams: [],
    devices: [],
    config: {
      isCCU: true,
      deviceListUrl: null,
      serialPort: null,
      serialBaudRate: 57600,
      availableSerialPorts: [],
      maxTelegrams: 20000,
      animations: false,
      persistentStorage: {
        enabled: false,
        keepFiles: 0
      },
      _appPath: null
    },
    beErrors: [],
    feErrors: [],
    currentVersion: null,
    latestVersion: null,
    devlistCreated: null,
    liveData: true,
  };
  rssiLog = [];
  ws = null;
  rpc = new Map();

  async openWebsocket() {
    return new Promise((resolve, reject) => {
      // TODO: reconnect
      let resolved = false;
      this.ws = new WebSocket(`ws://${ document.location.host }/ws`);

      this.ws.onopen = () => {
        this.data.beErrors = [];
        resolved = true;
        resolve(this.ws);
      };

      this.ws.onerror = (err) => {
        const msg = 'Verbindung zum Analyzer wurde unterbrochen.';
        console.error(err);
        if (!resolved) {
          resolved = true;
          reject(new Error(msg));
        } else {
          this.data.feErrors.unshift(msg);
        }
      };

      this.ws.onclose = (err) => {
        this.data.feErrors.unshift('Verbindung zum Analyzer wurde getrennt.');
      };

      this.ws.onmessage = msg => {
        let data = JSON.parse(msg.data);
        // console.log('WS-Msg:', data);
        if (!Array.isArray(data)) data = [data];
        data.forEach(({ type, payload, uuid }) => {
          if (uuid && this.rpc.has(uuid)) {
            const { resolve, reject } = this.rpc.get(uuid);
            resolve(payload);
            this.rpc.delete(uuid);
            return;
          }
          switch (type) {
            case 'telegram':
              if (!this.data.liveData) return;
              this.addTelegram(payload);
              break;
            case 'rssiNoise':
              if (!this.data.liveData) return;
              this.addRssiNoise(...payload);
              break;
            case 'error':
              this.data.beErrors = payload;
              break;
            case 'config':
              this.data.config = payload;
              break;
          }
        });
      };
    });
  }

  send(type, payload = null) {
    this.ws.send(JSON.stringify({ type, payload }));
  }

  async req(type, payload = null) {
    const uuid = createUuid();
    const promise = new Promise((resolve, reject) => {
      this.rpc.set(uuid, { resolve, reject });
    });
    this.ws.send(JSON.stringify({ type, payload, uuid }));
    return promise
  }

  addRssiNoise(mtstamp, value) {
    const lastIndex = this.rssiLog.length - 1;
    // round milliseconds
    mtstamp = Math.round(mtstamp / 1000) * 1000;
    if (lastIndex > 0 && this.rssiLog[lastIndex][0] === mtstamp) {
      this.rssiLog[lastIndex][1] = Math.round((this.rssiLog[lastIndex][1] + value) / 2);
    } else {
      this.rssiLog.push([mtstamp, value]);
    }

    // Cap collection
    if (this.rssiLog.length > this.maxTelegrams) {
      this.rssiLog.splice(0, this.rssiLog.length - this.maxTelegrams);
    }
  }

  addTelegram(telegram, cap= true) {
    // round milliseconds
    telegram.tstamp = Math.round(telegram.tstamp / 1000);
    this.data.telegrams.push(telegram);

    // Cap collection
    if (cap && this.data.telegrams.length > this.maxTelegrams) {
      this.data.telegrams.splice(0, this.data.telegrams.length - this.maxTelegrams);
    }

    // Generate unique devices list
    let devices = new Set();
    this.data.telegrams.forEach(({ fromName, toName }) => {
      if (fromName && !devices.has(fromName)) devices.add(fromName);
      if (toName && !devices.has(toName)) devices.add(toName);
    });
    devices = [...devices].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    devices.unshift('==Unbekannt==');
    this.data.devices.splice(0, this.data.devices.length, ...devices);
  }

  async loadCsvData(data) {
    this.data.liveData = false;
    this.data.devices = [];
    this.data.telegrams = [];
    this.rssiLog = [];
    const lines = data.split(/\n\r?/);
    const header = lines.shift().split(';');
    lines.forEach(line => {
      if (line.length < 10) return;
      const cells = line.split(';');
      const res = {};
      cells.forEach((cell, i) => {
        const fld = header[i];
        switch (fld) {
          case 'flags':
            cell = cell.split(',');
            break;
          case 'tstamp':
          case 'cnt':
          case 'len':
          case 'rssi':
            cell = parseInt(cell, 10);
            break;
          case 'fromIsIp':
          case 'toIsIp':
            cell = cell === "true";
            break;
        }
        res[fld] = cell;
      });
      this.addTelegram(res, false);
    });
  }

  enableLiveData() {
    this.data.devices = [];
    this.data.telegrams = [];
    this.rssiLog = [];
    this.data.liveData = true;
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
