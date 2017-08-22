const express = require('express')
const WebSocketServer = require('websocket').server
const bodyParser = require('body-parser')
const http = require('http')

module.exports.boot = (intentHandler)=>{
  return new Promise((ff,rj)=>{
    bootWebServer(3000)
    bootGameServer(8080,intentHandler)
    ff()
  })
}

module.exports.sendToPlayer = (player,data)=>{
  sendToConnectionId(player.connectionId, data)
}

const connections = {};
let connectionIDCounter = 0;

function bootWebServer(port) {
    const app = express()
    app.use(express.static('static'));
    app.listen(port, function () {
      console.log("Web server ready");
    })
}

function bootGameServer(port, intentHandler) {
  const server = http.createServer(function(request, response) {
      console.log((new Date()) + ' Received request for ' + request.url)
      response.writeHead(404)
      response.end()
  })
  const wsServer = new WebSocketServer({ httpServer: server })
  wsServer.on('request', function(request) {
      var connection = request.accept(null, request.origin)

      connection.id = connectionIDCounter ++
      connections[connection.id] = connection

      console.log((new Date()) + ' Connection ID ' + connection.id + ' accepted.')
      connection.on('close', function(reasonCode, description) {
          console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected. ' +
                      "Connection ID: " + connection.id)

          delete connections[connection.id]
      });
      connection.on('message', function(message) {
        const got = JSON.parse(message.utf8Data)
        intentHandler(got,connection)
      })
  })
  server.listen(8080, function() {
    console.log("Game server ready")
  })
}

function sendToConnectionId(connectionID, data) {
  var connection = connections[connectionID]
  if (connection && connection.connected) {
      connection.send(JSON.stringify(data))
  }
}
