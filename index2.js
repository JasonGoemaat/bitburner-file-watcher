var WebSocket = require('rpc-websockets').Client
var WebSocketServer = require('rpc-websockets').Server

// instantiate Server and start listening for requests
var server = new WebSocketServer({
  port: 8123,
  host: 'localhost'
})

server.emit()
// create an event
server.event('feedUpdated')

// get events
console.log(server.eventList())

// emit an event to subscribers
server.emit('feedUpdated')

// close the server
setTimeout(() => {
  server.close()
}, 6000)

// instantiate Client and connect to an RPC server
var ws = new WebSocket('ws://localhost:8123')

ws.on('open', function() {
  // call an RPC method with parameters
  ws.call('sum', [5, 3]).then(function(result) {
    require('assert').equal(result, 8)
  })

  // send a notification to an RPC server
  ws.notify('openedNewsModule')

  // subscribe to receive an event
  ws.subscribe('feedUpdated')

  ws.on('feedUpdated', function() {
    updateLogic()
  })

  // unsubscribe from an event
  ws.unsubscribe('feedUpdated')

  // login your client to be able to use protected methods
  ws.login({'username': 'confi1', 'password':'foobar'}).then(function() {
    ws.call('account').then(function(result) {
      require('assert').equal(result, ['confi1', 'confi2'])
    })
  }).catch(function(error) {
    console.log('auth failed')
  })

  // close a websocket connection
  ws.close()
})
