import { dirname, resolve, join, relative } from 'path'
import WebSocket, { WebSocketServer } from 'ws'
import { write, writeFileSync, existsSync, mkdirSync, mkdir, watch, readFileSync } from 'fs'
import { fileURLToPath} from 'url'
import * as chokidar from 'chokidar'

const OPTION_DELETE_FILES = false

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const APP_DIR = resolve(__dirname);

const CONTENT_DIR = join(APP_DIR, 'content')
const SERVER_DIR = join(APP_DIR, 'server')

/**
 * @typedef ResponseFile
 * @type {object}
 * @property {string} filename - name of the file with path
 * @property {string} content - text content of file
 */
// COOL: https://stackoverflow.com/questions/49836644/how-to-import-a-typedef-from-one-file-to-another-in-jsdoc-using-node-js

/**
 * @param {ResponseFile[]} files 
 */
 const writeFromServer = (files) => {
  files.forEach(({ filename, content }) => {
    const pathSections = filename.split('/')
    if (pathSections[0].length == 0) pathSections.shift()
    let fullPath = SERVER_DIR
    for (let i = 0; i < pathSections.length; i++) {
      fullPath = join(fullPath, pathSections[i])
      if (i < pathSections.length - 1) {
        if (!existsSync(fullPath)) mkdirSync(fullPath)
      }
    }
    writeFileSync(fullPath, content, { encoding: 'utf8' })
  })
}

const TEST_FILES = [
  { filename: 'hello.txt', content: 'Hello, world!' },
  { filename: 'test/sample.js', content: 'console.log("Hello, world!")' },
]

// writeFromServer(TEST_FILES)

let changes = {} // key is filename, value is eventType.
// initial creation and deletion and rename from or two all come as 'rename', otherwise change and possibly multiple
let changesTimeout = -1

// node's fs watch just tells you a subdirectory changed, not what changed in it
// watch(CONTENT_DIR, (eventType, filename) => {
//   changes[filename] = eventType
//   changesTimeout = setTimeout(() => {
//     const myChanges = changes
//     changes = {}
//     Object.entries(myChanges).forEach(({ filename, eventType }) => {
//       // if it exists, send it, otherwise delete it
//       // UG, this detects you changed something in a subdirectory, but not the change so it just gives you the subdirectory
//     })
//   }, 1000)
// })



const changeHandler = (eventType, filename) => {
  const relativePath = relative(CONTENT_DIR, filename)
  changes[filename] = relativePath
  changesTimeout = setTimeout(() => {
    const myChanges = changes
    changes = {}
    Object.entries(myChanges).forEach(([ filename, relativePath ]) => {
      relativePath = '/' + relativePath.split('\\').join('/')

      // if it exists, send it, otherwise delete it
      if (existsSync(filename)) {
        const content = readFileSync(filename, { encoding: 'utf8' })
        executeMethodAll('pushFile', { filename: relativePath, content, server: 'home' }, (result) => console.log(`pushed ${relativePath} result: ${result}`))
      } else {
        if (OPTION_DELETE_FILES) executeMethodAll('deleteFile', { filename: relativePath, server: 'home' }, (result) => console.log(`deleted ${relativePath} result: ${result}`))
      }
    })
  }, 100)
}

var watcher = chokidar.watch(CONTENT_DIR, { ignored: /^\./, persistent: true, ignoreInitial: true });

watcher
  .on('add', x => changeHandler('add', x))
  .on('change', x => changeHandler('change', x))
  .on('unlink', x => changeHandler('unlink', x))
  .on('error', function(error) {console.error('ERROR - Chokidar', error);})

const wss = new WebSocketServer({
  port: 8123
})

const connections = []
let commandId = 0
let commandHandlers = {} // key will be string of commandId sent, value will be function to call with result

const executeMethod = (method, params, handler, ws) => {
  let myCommandId = commandId++

  commandHandlers[myCommandId] = (result) => {
    delete commandHandlers[myCommandId]
    handler(result)
  }

  const REQUEST = {
    "jsonrpc": "2.0",
    "id": myCommandId,
    method,
    params
  }

  ws.send(JSON.stringify(REQUEST))
}

const executeMethodAll = (method, params, handler) => {
  for (let i = 0; i < connections.length; i++) {
    executeMethod(method, params, handler, connections[i])
  }
}

wss.on('connection', function connection(ws) {
  console.log(`new connection ${connections.length}`)
  connections.push(ws)

  ws.on('message', function message(data) {
    const response = JSON.parse(`${data}`)
    let { id, result } = response
    if (commandHandlers[id]) {
      commandHandlers[id](result)
    } else {
      console.log(`ERROR!  No handler for command id: ${id}`)
      console.log(JSON.stringify(response, null, 2))
    }
  });

  executeMethod('getAllFiles', { server: 'home' }, writeFromServer, ws)
  
  ws.on('close', (ws2, code, reason) => {
    const index = connections.indexOf(ws)
    if (index >= 0) connections.splice(index, 1)
    console.log(`closed connection ${index} code ${code} reason ${reason}`)
  })
});
