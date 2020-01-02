# Shared WebSocket

## Description

Uses shared web workers in order to use one websocket connection in multiple tabs (windows).

## Usage

```javascript
const SharedWebSocket = require("shared-ws");

const socket = new SharedWebSocket("http://localhost:8080");

socket.onopen = e => {
  console.log(e);
};

socket.onerror = e => {
  console.log(e);
};

socket.onmessage = e => {
  console.log(e);
};

socket.onclose = e => {
  console.log(e);
};

socket.send({ foo: "bar" });

socket.close(4004);
```

## Notice

This library doesn't check for SharedWorker feature support.
