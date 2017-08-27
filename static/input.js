import {ringCoord} from './math.js';

export function init(gameData, gameClient){
  data=gameData;
  client=gameClient;
  setupKeyboard();
}

export function click(event){
  move(event.target);
}

let data;
let client;

function setupKeyboard() {
  document.onkeydown = function(e) {
    switch (e.keyCode) {
      case 73: // i
        zoomIn();
        break;
      case 75: // k
        zoomOut();
        break;
      case 79:
        incDrawDistance();
        break;
      case 76:
        decDrawDistance();
        break;
      }
  };
}

function zoomIn() {
  data.settings.scale++;
}

function zoomOut() {
  data.settings.scale--;
}

function incDrawDistance() {
  data.settings.drawdistance++;
}

function decDrawDistance() {
  data.settings.drawdistance--;
}

function move(toX,toY) {
  client.request({
    "action":"move",
    "gameId":data.gameId,
    "myId":data.me.id,
    "target": [toX,toY]
  });
}
