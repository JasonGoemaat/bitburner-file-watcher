import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({
  port: 8123
})

const REQUEST = {
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getFileNames",
  "params": {
      server: 'home'
  }
}

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received:')
    console.log(JSON.stringify(JSON.parse(`${data}`), null, 2))
    wss.close()
  });

  ws.send(JSON.stringify(REQUEST));
});
