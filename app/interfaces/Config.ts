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
    keepFiles: number
  },
  _began: number | null,
}
