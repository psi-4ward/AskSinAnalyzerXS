import {PortInfo} from "serialport";

export interface Config {
  deviceListUrl: string | null,
  isCCU: boolean,
  serialPort: string | null,
  serialBaudRate: number | string,
  _availableSerialPorts: PortInfo[],
  maxTelegrams: number,
  recentHistoryMins: number,
  animations: boolean,
  persistentStorage: {
    enabled: boolean,
    keepFiles: number,
    flushInterval: number,
    maxBufferSize: number
  },
  rssiNoiseTrigger: {
    enabled: boolean,
    value: number,
    timeWindow: number,
    action: 'httpGet' | 'httpPost',
    actionOpts: {
      url: string
    }
  },
  _began: number | null,
  dropUnkownDevices: boolean,
}
