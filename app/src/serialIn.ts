import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

import Stream from 'stream';

import SnifferParser from './SnifferParser';
import DutyCyclePerTelegram from "./DutyCyclePerTelegram";
import Trigger from "./Trigger";

class SerialIn {
  rawStream: Stream | null = null;
  dataStream: Stream | null = null;
  con: SerialPort | null = null;

  async listPorts() {
    const ports = await SerialPort.list();

    ports.forEach(port =>
      console.log(`Detected SerialPort: ${port.path} (${port.manufacturer || "unknown manufacturer"})`)
    );

    return ports;
  }

  async open(port: string, baudRate: number = 57600): Promise<Stream> {
    await this.close();

    return new Promise((resolve, reject) => {
      const con = new SerialPort({
        path: port,
        baudRate,
        autoOpen: false
      });

      this.con = con;

      con.open((err) => {
        if (err) return reject(err);

        console.log(`Connected to ${port}`);

        this.rawStream = con.pipe(
          new ReadlineParser({ delimiter: '\n' })
        );

        this.dataStream = this.rawStream
          .pipe(new SnifferParser())
          .pipe(new DutyCyclePerTelegram())
          .pipe(new Trigger());

        resolve(this.dataStream);
      });
    });
  }

  async close() {
    if (!this.con || !this.con.isOpen) {
      this.con = null;
      return;
    }

    const con = this.con;
    this.con = null;

    return new Promise<void>((resolve, reject) => {
      con.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

// Singleton
export default new SerialIn();