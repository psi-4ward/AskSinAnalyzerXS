import EventEmitter from 'events';

class Errors extends EventEmitter {
  errors = new Map<string, string>();

  add(key: string, e: Error | String) {
    console.error(e.toString());
    this.errors.set(key, e.toString());
    this.emit('change');
  }

  delete(key: string) {
    this.errors.delete(key);
    this.emit('change');
  }

  clear() {
    this.errors.clear();
    this.emit('change');
  }

  getErrors() {
    return Array.from(this.errors.entries());
  }
}

export default new Errors();
