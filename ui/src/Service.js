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
      _availableSerialPorts: [],
      maxTelegrams: 20000,
      recentHistoryMins: 70,
      animations: false,
      persistentStorage: {
        enabled: false,
        keepFiles: 0
      },
      rssiNoiseTrigger: {
        enabled: false,
        value: -80,
        timeWindow: 5,
        action: 'httpPost',
        actionOpts: {
          url: ''
        }
      },
      _appPath: null,
      _began: Date.now(),
      _mem: {
        heapUsed: 0,
        rss: 0
      }
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
  rpcResponseMap = new Map();
  devicesSet = new Set();

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
          if (uuid && this.rpcResponseMap.has(uuid)) {
            const { resolve, reject } = this.rpcResponseMap.get(uuid);
            resolve(payload);
            this.rpcResponseMap.delete(uuid);
            return;
          }
          switch (type) {
            case 'telegram':
              if (!this.data.liveData) return;
              this.addTelegram(payload);
              break;
            case 'telegrams':
              if (!this.data.liveData) return;
              payload.forEach(telegram => this.addTelegram(telegram));
              break;
            case 'rssiNoise':
              if (!this.data.liveData) return;
              this.addRssiNoise(...payload);
              break;
            case 'rssiNoises':
              if (!this.data.liveData) return;
              payload.forEach(rssiNoise => this.addRssiNoise(...rssiNoise));
              break;
            case 'error':
              this.data.beErrors = payload;
              break;
            case 'config':
              this.data.config = { ...this.data.config, ...payload };
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
      this.rpcResponseMap.set(uuid, { resolve, reject });
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

  addTelegram(telegram, liveData = true) {
    this.data.telegrams.push(telegram);

    if (liveData) {
      // Cap collection
      if (this.data.telegrams.length > this.maxTelegrams - 200) {
        this.data.telegrams.splice(0, this.data.telegrams.length - this.maxTelegrams);
        this.generateDeviceList(); // Regenerate deviceList
      } else {
        this.generateDeviceList(telegram); // Add possible new devices
      }
    }
  }

  // Generate unique devices list
  generateDeviceList(telegram = null) {
    let telegrams = [telegram];
    if(telegram === null) {
      this.devicesSet = new Set(['==Unbekannt==']);
      telegrams = this.data.telegrams;
    }
    let newDeviceAdded = false;
    telegrams.forEach(({ fromName, toName, toAddr, fromAddr }) => {
      if (fromName && !this.devicesSet.has(fromName)) {
        this.devicesSet.add(fromName);
        newDeviceAdded = true;
      } else if (!this.devicesSet.has(fromAddr)) {
        this.devicesSet.add(fromAddr);
        newDeviceAdded = true;
      }
      if (toName && !this.devicesSet.has(toName)) {
        this.devicesSet.add(toName);
        newDeviceAdded = true;
      } else if (!this.devicesSet.has(toAddr)) {
        this.devicesSet.add(toAddr);
        newDeviceAdded = true;
      }
    });
    if(newDeviceAdded) {
      const devices = Array.from(this.devicesSet);
      devices.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      this.data.devices.splice(0, devices.length, ...devices);
    }
  }

  clear() {
    this.data.devices = [];
    this.data.telegrams = [];
    this.rssiLog = [];
  }

  async loadCsvData(data) {
    this.data.liveData = false;
    const lines = data.split(/\n\r?/);
    const header = lines.shift().split(';');
    lines.forEach(line => {
      if (line.length < 10) return;
      const cells = line.split(';');
      const res = {};
      cells.forEach((cell, i) => {
        const fld = header[i];
        if (fld === 'date') return; // not needed, tstamp is used
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
          case 'dc':
            cell = parseFloat(cell);
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
    this.generateDeviceList();
  }

  enableLiveData() {
    this.clear();
    this.send('get recentHistory');
    this.data.liveData = true;
  }

}
