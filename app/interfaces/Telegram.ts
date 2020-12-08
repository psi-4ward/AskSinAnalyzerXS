export interface Telegram {
  tstamp: number,
  rssi: number,
  len: number,
  cnt: number,
  flags: string[],
  type: string,
  fromAddr: number,
  toAddr: number,
  fromName: string,
  toName: string,
  fromSerial: string,
  toSerial: string,
  toIsIp: boolean,
  fromIsIp: boolean,
  dc: number,
  payload: string,
  raw: string
}
