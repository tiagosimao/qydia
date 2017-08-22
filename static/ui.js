export function init(context){
  ctx=context;
  resize();
  queueDraw();
}

let ctx;

let canvas = document.getElementById("canvas");

function ringCoord(max,value) {
  return (max+value%max)%max;
}

function screenToWorld(scoord,camcoord,scale) {
  let x = Math.floor((scoord[0]-canvas.width/2)/scale+camcoord[0]);
  let y = Math.ceil(camcoord[1]-(scoord[1]-canvas.height/2)/scale);
  x = ringCoord(ctx.world.width, x);
  y = ringCoord(ctx.world.height, y);
  return [x,y];
}

function worldToScreen(wcoord,camcoord,scale) {
  return [canvas.width/2+(wcoord[0]-camcoord[0])*scale,canvas.height/2-(wcoord[1]-camcoord[1])*scale];
}

function drawArea(twoDContext, ob, x, y, w, h) {
  twoDContext.lineWidth = 0;
  twoDContext.fillStyle = ob.color;
  twoDContext.fillRect(x, y, w, h);
}

function drawAreaFromMap(twoDContext,x,y) {
  let mx = ringCoord(ctx.world.width,x);
  let my = ringCoord(ctx.world.height,y);
  let area = ctx.map[mx] ? ctx.map[mx][my] : undefined;
  if(area) {
    let scale = ctx.settings.scale;
    let scoord = worldToScreen([x,y],ctx.john.pos,scale);
    if(scoord[0]>-scale&&scoord[0]<canvas.width+scale&&scoord[1]>-scale&&scoord[1]<canvas.height+scale) {
      drawArea(twoDContext,area,scoord[0],scoord[1],scale,scale);
    }
  }
}

function drawWorld(twoDContext) {
  if(!ctx.world){
    return;
  }
  let x = ctx.john.pos[0];
  let y = ctx.john.pos[1] - 1; // start spiral from bellow to center

  // draws a spiral loop
  for(let spiralLevel = 0; spiralLevel <= ctx.settings.drawdistance; ++spiralLevel){

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
  twoDContext.fillText("Scale: " + ctx.settings.scale, 10, 20);
  twoDContext.fillText("Draw Distance: " + ctx.settings.drawdistance , 10, 40);
  twoDContext.fillText("World Position: " + ctx.john.pos , 10, 60);
  twoDContext.fillText("Selection: " + ctx.selection , 10, 80);
}

function drawFauna(twoDContext,scale) {
  let scoord = worldToScreen(ctx.john.pos,ctx.john.pos,scale);
  twoDContext.beginPath();
  twoDContext.arc(scoord[0]+scale/2, scoord[1]+scale/2, scale/4, 0, 2 * Math.PI, false);
  twoDContext.fillStyle = 'green';
  twoDContext.fill();
  twoDContext.lineWidth = 5;
  twoDContext.strokeStyle = '#003300';
  twoDContext.stroke();
}

function drawHud(twoDContext,scale) {
  if(ctx.selection){
    let scoord = worldToScreen(ctx.selection,ctx.john.pos,scale);
    twoDContext.strokeStyle = "rgb(255,255,255)";
    twoDContext.lineWidth = 2;
    twoDContext.strokeRect(scoord[0]+2, scoord[1]+2, scale-2, scale-2);
  }
}

function draw() {
  //let start = Date.now();
  let twoDContext = canvas.getContext("2d");
  twoDContext.clearRect(0, 0, canvas.width, canvas.height);
  let scale = ctx.settings.scale;
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

function updatePosition() {
  let radius = ctx.settings.drawdistance;
  let cx = ctx.john.pos[0];
  let cy = ctx.john.pos[1];
  for(let x=cx-radius;x<=cx+radius;++x){
    for(let y=cy-radius;y<=cy+radius;++y){
      let mx = ringCoord(ctx.world.width,x);
      let my = ringCoord(ctx.world.height,y);
      if(!ctx.map[mx]||!ctx.map[mx][my]) {
        console.log("Unloaded coord: [" + mx + "," + my + "]");
        return;
      }
    }
  }
}

function moveX(wut,howmuch) {
  wut.pos[0] = ringCoord(ctx.world.width,wut.pos[0]+howmuch);
  updatePosition();
}

function moveY(wut,howmuch) {
  wut.pos[1] = ringCoord(ctx.world.height,wut.pos[1]+howmuch);
  updatePosition();
}

function zoomIn() {
  ctx.settings.scale++;
  saveSettings();
}

function zoomOut() {
  ctx.settings.scale--;
  saveSettings();
}

function incDrawDistance() {
  ctx.settings.drawdistance++;
  saveSettings();
}

function decDrawDistance() {
  ctx.settings.drawdistance--;
  saveSettings();
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
  let lastclick = screenToWorld([e.offsetX,e.offsetY],ctx.john.pos,ctx.settings.scale);
  if(ctx.selection && ctx.selection[0]==lastclick[0] && ctx.selection[1]==lastclick[1]) {
    ctx.selection=null;
  } else {
    ctx.selection=lastclick;
  }
}, false);

document.onkeydown = function(e) {
  switch (e.keyCode) {
    case 37:
      moveX(ctx.john,-1);
      break;
    case 38:
      moveY(ctx.john,1);
      break;
    case 39:
      moveX(ctx.john,1);
      break;
    case 40:
      moveY(ctx.john,-1);
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

function queueDraw() {
  window.requestAnimationFrame(function (timestamp){
    draw();
    queueDraw();
  });
}
