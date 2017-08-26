export function init(settings, messageHandler) {
  return new Promise((ff,rj)=>{
    handler = messageHandler;
    stayawhileandlisten(settings.serverAddress, ff, rj);
  });
}

export function request(intent){
  connection.send(JSON.stringify(intent));
}

let connection;
let handler;

function stayawhileandlisten(serverAddress, ff, rj) {
  connection = new WebSocket(serverAddress,['qydia']);
  connection.onopen = function () {
    console.log("Connected to " + serverAddress);
    ff();
  };

  connection.onerror = function (error) {
    console.log('WebSocket Error ' + error);
    rj();
  };

  connection.onmessage = function (e) {
    console.log("Got package from server")
    const resp = JSON.parse(e.data);
    console.log(resp);
    handler(resp);
  };
}
