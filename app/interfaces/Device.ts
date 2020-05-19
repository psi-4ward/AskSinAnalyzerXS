export interface Device {
  name: string,
  serial: string,
  address: number
}

export interface DeviceList {
  createdAt: number | null;
  sanitizedUrl: string | null;
  devices: Device[]
}
