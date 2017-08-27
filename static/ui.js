import {ringCoord} from './math.js';

export function init(gameData){
  data=gameData;
  resize();
  queueDraw();
}

let data;

let canvas = document.getElementById("canvas");

function screenToWorld(scoordx,scoordy,camx,camy,scale) {
  let x = Math.floor((scoordx-canvas.width/2)/scale+camx);
  let y = Math.ceil(camy-(scoordy-canvas.height/2)/scale);
  x = ringCoord(data.world.width, x);
  y = ringCoord(data.world.height, y);
  return [x,y];
}

function worldToScreen(wcoordx,wcoordy,camx,camy,scale) {
  return [canvas.width/2+(wcoordx-camx)*scale,canvas.height/2-(wcoordy-camy)*scale];
}

function drawArea(twoDContext, ob, x, y, w, h) {
  twoDContext.lineWidth = 0;
  twoDContext.fillStyle = ob.color;
  twoDContext.fillRect(x, y, w, h);
}

function drawAreaFromMap(twoDContext,x,y) {
  let mx = ringCoord(data.world.width,x);
  let my = ringCoord(data.world.height,y);
  let area = data.map[mx] ? data.map[mx][my] : undefined;
  if(area) {
    let scale = data.settings.scale;
    let scoord = worldToScreen(x,y,data.me.x,data.me.y,scale);
    if(scoord[0]>-scale&&scoord[0]<canvas.width+scale&&scoord[1]>-scale&&scoord[1]<canvas.height+scale) {
      drawArea(twoDContext,area,scoord[0],scoord[1],scale,scale);
    }
  }
}

function drawWorld(twoDContext) {
  if(!data.world){
    return;
  }
  let x = data.me.x;
  let y = data.me.y - 1; // start spiral from bellow to center

  // draws a spiral loop
  for(let spiralLevel = 0; spiralLevel <= data.settings.drawdistance; ++spiralLevel){

    // up a level
    ++y
    drawAreaFromMap(twoDContext,x,y);

    // slide from centre to right on the top vertex
    for(let i=0;i<(spiralLevel*2)-1;++i) {
      ++x;
      drawAreaFromMap(twoDContext,x,y);
    }

    // slide from top to bottom on the right vertex
    for(let i=0;i<spiralLevel*2;++i) {
      --y;
      drawAreaFromMap(twoDContext,x,y);
    }

    // slide from right to left on the bottom vertex
    for(let i=0;i<spiralLevel*2;++i) {
      --x;
      drawAreaFromMap(twoDContext,x,y);
    }

    // slide from bottom to top on the left vertex
    for(let i=0;i<spiralLevel*2;++i) {
      ++y;
      drawAreaFromMap(twoDContext,x,y);
    }
  }

}

function drawDebug(twoDContext,scale) {
  twoDContext.fillStyle = "rgb(150,150,150)";
  twoDContext.font = '25px';
  twoDContext.fillText("Scale: " + data.settings.scale, 10, 20);
  twoDContext.fillText("Draw Distance: " + data.settings.drawdistance , 10, 40);
  twoDContext.fillText("World Position: " + data.me.x + "," + data.me.y, 10, 60);
  twoDContext.fillText("Selection: " + data.selection.x + ", " + data.selection.y , 10, 80);
}

function drawFauna(twoDContext,scale) {
  let scoord = worldToScreen(data.me.x,data.me.y,data.me.x,data.me.y,scale);
  twoDContext.beginPath();
  twoDContext.arc(scoord[0]+scale/2, scoord[1]+scale/2, scale/4, 0, 2 * Math.PI, false);
  twoDContext.fillStyle = 'green';
  twoDContext.fill();
  twoDContext.lineWidth = 5;
  twoDContext.strokeStyle = '#003300';
  twoDContext.stroke();
}

function drawHud(twoDContext,scale) {
  if(data.selection.x){
    let scoord = worldToScreen(data.selection.x,data.selection.y,data.me.x,data.me.y,scale);
    twoDContext.strokeStyle = "rgb(255,255,255)";
    twoDContext.lineWidth = 2;
    twoDContext.strokeRect(scoord[0]+2, scoord[1]+2, scale-2, scale-2);
  }
}

function draw() {
  //let start = Date.now();
  let twoDContext = canvas.getContext("2d");
  twoDContext.clearRect(0, 0, canvas.width, canvas.height);
  let scale = data.settings.scale;
  drawWorld(twoDContext);
  drawFauna(twoDContext,scale);
  drawDebug(twoDContext,scale);
  drawHud(twoDContext,scale);
  //console.log("Draw took: " + (Date.now()-start));
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

(function() {

  window.addEventListener("resize", resizeThrottler, false);

  let resizeTimeout;
  function resizeThrottler() {
    // ignore resize events as long as an actualResizeHandler execution is in the queue
    if ( !resizeTimeout ) {
      resizeTimeout = setTimeout(function() {
        resizeTimeout = null;
        resize();
     }, 100);
    }
  }

}());

canvas.addEventListener('click', function(e) {
  let lastclick = screenToWorld(e.offsetX,e.offsetY,data.me.x,data.me.y,data.settings.scale);
  console.log(lastclick)
  if(data.selection.x==lastclick[0] && data.selection.y==lastclick[1]) {
    data.selection={};
  } else {
    data.selection={
      x:lastclick[0],
      y:lastclick[1]
    };
  }
}, false);

function queueDraw() {
  window.requestAnimationFrame(function (timestamp){
    draw();
    queueDraw();
  });
}
