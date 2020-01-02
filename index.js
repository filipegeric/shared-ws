function worker() {
  // ---------- WORKER --------------------
  const ports = [];

  function broadcast(msg) {
    for (const p of ports) {
      p.postMessage(msg);
    }
  }

  function handleMessage({ type, data }, port) {
    switch (type) {
      case "connect":
        connect(data.url);
        break;
      case "send":
        send(data);
        break;
      case "close":
        close(data.code, port);
        break;
      default:
        port.postMessage({
          type: "error",
          data: "Unknown message type"
        });
        break;
    }
  }
  // ----------------------------------

  // ---------- WS --------------------
  let socket;
  function connect(url) {
    if (socket && socket.readyState !== WebSocket.CLOSED) {
      return;
    }
    socket = new WebSocket(url);
    socket.onopen = e => {
      broadcast({ type: "open", data: e.type });
    };
    socket.onclose = e => {
      broadcast({
        type: "close",
        wasClean: e.wasClean,
        code: e.code,
        reason: e.reason
      });
    };
    socket.onerror = e => {
      broadcast({ type: "error", isTrusted: e.isTrusted });
    };
    socket.onmessage = e => {
      console.log(ports);
      broadcast({ type: "message", data: JSON.parse(e.data) });
    };
  }

  function send(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  function close(code, port) {
    if (socket && socket.readyState !== WebSocket.CLOSED) {
      socket.close(code);
    }
    const index = ports.indexOf(port);
    if (index >= 0) {
      ports.splice(index, 1);
    }
  }
  // ----------------------------------

  console.log(self);

  self.onconnect = function onConnect(e) {
    const port = e.ports[0];
    ports.push(port);

    port.addEventListener("message", function(message) {
      handleMessage(message.data, port);
    });

    port.start();

    if (socket && socket.readyState === WebSocket.OPEN) {
      port.postMessage({
        type: "open",
        data: "open"
      });
    }
  };
}

class SharedWebSocket {
  constructor(url) {
    const workerUrl =
      "data:application/javascript;base64," + btoa(`(${worker.toString()})()`);
    this._worker = new SharedWorker(workerUrl);

    this._worker.port.start();

    this._worker.port.onmessage = e => {
      switch (e.data.type) {
        case "message":
          if (this.onmessage) {
            this.onmessage(e.data);
          }
          break;
        case "error":
          if (this.onerror) {
            this.onerror(e.data);
          }
          break;
        case "close":
          if (this.onclose) {
            this.onclose(e.data);
          }
          break;
        case "open":
          if (this.onopen) {
            this.onopen(e.data);
          }
          break;
        default:
          break;
      }
    };
    this._worker.port.postMessage({ type: "connect", data: { url } });
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
    this.onopen = null;
  }

  send(data) {
    this._worker.port.postMessage({ type: "send", data });
  }

  close(code) {
    this._worker.port.postMessage({ type: "close", data: { code } });
  }
}

module.exports = SharedWebSocket;
