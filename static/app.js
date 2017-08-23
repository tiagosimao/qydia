import * as ui from './ui.js';

const context = {
  "selection": undefined,
  "settings": undefined,
  "world": undefined,
  "map": undefined,
  "john": {
    pos: [0,0]
  }
}

function mergeWorld(got) {
  context.world=got;
}

function mergeMap(got) {
  if(!context.map) {
    context.map=got;
  } else {
    for (let x in got) {
      for (let y in got[x]) {
        if(!context.map[x]){
          context.map[x]=got[x];
        } else {
          context.map[x][y]=got[x][y];
        }
      }
    }
  }
}

function mergeMe(got) {
  if(!context.john){
    context.john=got;
  } else {
    context.john.name=got.name;
    context.john.pos=[got.x,got.y];
  }
}

function loadSettings() {
  let got = localStorage.getItem("settings");
  if(got){
    context.settings = JSON.parse(got);
  }
}

function saveSettings() {
  if(context.settings) {
    localStorage.setItem("settings",JSON.stringify(settings));
  }
}

function stayawhileandlisten() {
  let connection = new WebSocket('ws://localhost:8080/client',['qydia']);
  connection.onopen = function () {
    console.log("Connected to server");
    connection.send(JSON.stringify({
      "action": "login"
    }));
  };
  // Log errors
  connection.onerror = function (error) {
    console.log('WebSocket Error ' + error);
  };

  connection.onmessage = function (e) {
    console.log("Got package from server")
    const resp = JSON.parse(e.data);
    mergeWorld(resp.world);
    mergeMap(resp.map);
    mergeMe(resp.me);
  };
}

function init() {
  loadSettings();
  if(!context.settings) {
    context.settings = {
      scale: 50,
      drawdistance: 2
    }
    saveSettings();
  }
  stayawhileandlisten();
  ui.init(context);
}

init();
