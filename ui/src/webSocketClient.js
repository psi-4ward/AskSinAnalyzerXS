const timestamp = () => new Date().toISOString().replace('T', ' ').substr(0, 19);

function WebSocketClient(url) {
  let client;
  let timeout;
  let connecting = false;
  let backoff = 250;
  const init = () => {
    console.error(timestamp(), 'WebSocketClient :: connecting');
    connecting = false;
    if (client !== undefined) {
      client.removeAllListeners();
    }
    client = new WebSocket(url);
    const heartbeat = () => {
      if (timeout !== undefined) {
        clearTimeout(timeout);
        timeout = undefined;
      }
      timeout = setTimeout(() => client.terminate(), 35000);
    };
    client.on('ping', () => {
      console.log(timestamp(), 'WebSocketClient :: pinged');
      heartbeat();
    });
    client.on('open', (e) => {
      if (typeof this.onOpen === 'function') {
        this.onOpen();
      } else {
        console.log(timestamp(), 'WebSocketClient :: opened');
        console.log(e);
      }
      heartbeat();
    });
    client.on('message', (e) => {
      if (typeof this.onMessage === 'function') {
        this.onMessage(e);
      } else {
        console.log(timestamp(), 'WebSocketClient :: messaged');
      }
      heartbeat();
    });
    client.on('close', (e) => {
      if (e.code !== 1000) {
        if (connecting === false) { // abnormal closure
          backoff = backoff === 8000 ? 250 : backoff * 2;
          setTimeout(() => init(), backoff);
          connecting = true;
        }
      } else if (typeof this.onClose === 'function') {
        this.onClose();
      } else {
        console.error(timestamp(), 'WebSocketClient :: closed');
        console.error(e);
      }
    });
    client.on('error', (e) => {
      if (e.code === 'ECONREFUSED') {
        if (connecting === false) { // abnormal closure
          backoff = backoff === 8000 ? 250 : backoff * 2;
          setTimeout(() => init(), backoff);
          connecting = true;
        }
      } else if (typeof this.onError === 'function') {
        this.onError(e);
      } else {
        console.error(timestamp(), 'WebSocketClient :: errored');
        console.error(e);
      }
    });
    this.send = client.send.bind(client);
  };
  init();
}

module.exports = WebSocketClient;
