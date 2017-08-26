const express = require('express');
const WebSocketServer = require('websocket').server;
const bodyParser = require('body-parser');
const http = require('http');

module.exports.setup = (intentDispatcher)=>{
  return new Promise((ff,rj)=>{
    bootWebServer(3000);
    bootGameServer(8080,intentDispatcher);
    ff();
  });
}

module.exports.sendState = (whom,state)=>{
  whom.forEach(target=>sendToConnectionId(target.connectionId,state));
}

const connections = {};
let connectionIDCounter = 0;

function bootWebServer(port) {
    const app = express();
    app.use(express.static('static'));
    app.listen(port, function () {
      console.log("Web server ready");
    });
}

function bootGameServer(port, intentDispatcher) {
  const server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
  });
  const wsServer = new WebSocketServer({ httpServer: server });
  wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    connection.id = connectionIDCounter ++;
    connections[connection.id] = connection;

    console.log((new Date()) + ' Connection ID ' + connection.id + ' accepted.');
    connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected. ' +
                    "Connection ID: " + connection.id);
      delete connections[connection.id];
    });
    connection.on('message', function(message) {
      try{
        const got = JSON.parse(message.utf8Data);
        got.connectionId=connection.id;
        intentDispatcher(got);
      } catch(err){
        console.error("Error handling message: " + err);
        console.error(err.stack);
      }
    });
  });
  server.listen(8080, function() {
    console.log("Game server ready");
  });
}

function sendToConnectionId(connectionID, data) {
  var connection = connections[connectionID];
  if (connection && connection.connected) {
    connection.send(JSON.stringify(data));
  }
}
