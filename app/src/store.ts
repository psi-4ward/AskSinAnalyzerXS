import path from 'path';
import fs from 'fs';
import {Config} from '../interfaces/Config';

class Store {
  config: Config = {
    isCCU: true,
    deviceListUrl: null,
    serialPort: null,
    serialBaudRate: 57600,
    availableSerialPorts: [],
    maxTelegrams: 20000,
    persistentStorage: {
      enabled: false,
      keepFiles: 180
    }
  };

  appPath: string = path.resolve(__dirname, '..');
  persistData: boolean = true;

  constructor() {
    if (fs.existsSync(this.appPath + '/userdata.json')) {
      this.config = {
        ...this.config,
        ...JSON.parse(fs.readFileSync(this.appPath + '/userdata.json', 'utf-8'))
      };
    }
  }

  setConfigData(data: Partial<Config>) {
    this.config = {...this.config, ...data};
    this.persist();
  }

  getConfigData() {
    return this.config;
  }

  setConfig<K extends keyof Config, V extends Config[K]>(key: K, value: V) {
    this.config[key] = value;
    this.persist();
  }

  getConfig<K extends keyof Config>(key: K) {
    return this.config[key];
  }

  private persist() {
    if(!this.persistData) return;
    const cfg = {...this.config};
    delete cfg.availableSerialPorts;
    fs.writeFileSync(this.appPath + '/userdata.json', JSON.stringify(cfg, null, 2), {encoding: 'utf-8'});
  }
}

export default new Store();
