export enum SocketMessageType {
  telegram = 'telegram',
  telegrams = 'telegrams',
  rssiNoise = 'rssiNoise',
  rssiNoises = 'rssiNoises',
  config = 'config',
  error = 'error',
  csvFiles = 'csvFiles',
  confirm = 'confirm'
}

export interface SocketMessage<T> {
  type: SocketMessageType,
  payload: T
}
