import SerialPort from 'serialport';
import Stream from 'stream';
import SnifferParser from './SnifferParser';
import DutyCyclePerTelegram from "./DutyCyclePerTelegram";
import Trigger from "./Trigger";

class SerialIn {
  rawStream: Stream | null;
  dataStream: Stream | null;
  con: SerialPort | null;

  async listPorts() {
    const ports = await SerialPort.list();
    ports.forEach(port => console.log(`Detected SerialPort: ${port.path} (${port.manufacturer || "unknown manufacturer"})`));
    return ports;
  }

  async open(port: string, baudRate: number = 57600): Promise<Stream> {
    try {
      await this.close();
    } catch (e) {
    }

    return new Promise((resolve, reject) => {
      this.con = new SerialPort(port, {baudRate}, (err: Error | null) => {
        if (err) return reject(err);
        console.log(`Connected to ${port}`);
        this.rawStream = this.con.pipe(new SerialPort.parsers.Readline({delimiter: '\n'}));
        this.dataStream = this.rawStream
          .pipe(new SnifferParser())
          .pipe(new DutyCyclePerTelegram())
          .pipe(new Trigger());
        resolve(this.dataStream);
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.con.close((err) => {
        if (err) return reject(err);
        resolve();
      })
    });
  }
}

// Singleton
export default new SerialIn();
