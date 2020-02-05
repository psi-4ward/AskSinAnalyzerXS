export enum SocketMessageType {
  telegram = 'telegram',
  rssiNoise = 'rssiNoise',
  config = 'config',
  error = 'error',
}

export interface SocketMessage<T> {
  type: SocketMessageType,
  payload: T
}
