import {ringCoord} from './math.js';

export function init(gameData, gameClient){
  data=gameData;
  client=gameClient;
  setupKeyboard();
}

let data;
let client;

function setupKeyboard() {
  document.onkeydown = function(e) {
    switch (e.keyCode) {
      case 37:
        moveX(data.me,-1);
        break;
      case 38:
        moveUp();
        break;
      case 39:
        moveX(data.me,1);
        break;
      case 40:
        moveY(data.me,-1);
        break;
      case 73:
        zoomIn();
        break;
      case 75:
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

function updatePosition() {
  let radius = data.settings.drawdistance;
  let cx = data.me.pos[0];
  let cy = data.me.pos[1];
  for(let x=cx-radius;x<=cx+radius;++x){
    for(let y=cy-radius;y<=cy+radius;++y){
      let mx = ringCoord(data.world.width,x);
      let my = ringCoord(data.world.height,y);
      if(!data.map[mx]||!data.map[mx][my]) {
        console.log("Unloaded coord: [" + mx + "," + my + "]");
        return;
      }
    }
  }
}

function moveX(wut,howmuch) {
  wut.pos[0] = ringCoord(data.world.width,wut.pos[0]+howmuch);
  updatePosition();
}

function moveY(wut,howmuch) {
  wut.pos[1] = ringCoord(data.world.height,wut.pos[1]+howmuch);
  updatePosition();
}

function zoomIn() {
  data.settings.scale++;
  saveSettings();
}

function zoomOut() {
  data.settings.scale--;
  saveSettings();
}

function incDrawDistance() {
  data.settings.drawdistance++;
  saveSettings();
}

function decDrawDistance() {
  data.settings.drawdistance--;
  saveSettings();
}

function moveUp() {
  client.request({
    "action":"move",
    "gameId":data.gameId,
    "myId":data.me.id 
  });
}
