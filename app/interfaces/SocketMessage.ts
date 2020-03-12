export enum SocketMessageType {
  telegram = 'telegram',
  rssiNoise = 'rssiNoise',
  config = 'config',
  error = 'error',
  csvFiles = 'csvFiles',
  confirm = 'confirm'
}

export interface SocketMessage<T> {
  type: SocketMessageType,
  payload: T
}
