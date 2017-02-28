var canvas = document.getElementById("canvas");

var settings;

var world;

var map;

var john = {
  pos: [0,0]
};

var selection;

function updateWorld() {
  fetch("/api/world")
  .then(r=>r.json())
  .then(got=>{
    world=got;
    updateWorldMap();
  })
  .catch(e=>console.log(e));
}

function updateWorldMap() {
  fetch("/api/world?x="+john.pos[0]+"&y="+john.pos[1]+"&radius="+settings.drawdistance)
  .then(r=>r.json())
  .then(got=>{
    if(!map){
      map=got;
    } else {
      for (var x in got) {
        for (var y in got[x]) {
          if(!map[x]){
            map[x]=got[x];
          } else {
            map[x][y]=got[x][y];
          }
        }
      }
    }
  })
  .catch(e=>console.log(e));
}

function getStuffNear(wcoord,radius,okConsumer,errorConsumer){
  fetch("/api/world?x="+wcoord[0]+"&y="+wcoord[1]+"&radius="+radius)
  .then(function(response) { return response.json(); })
  .then(okConsumer)
  .catch(errorConsumer);
}

function screenToWorld(scoord,camcoord,scale) {
  var x = Math.floor((scoord[0]-canvas.width/2)/scale+camcoord[0]);
  var y = Math.ceil(camcoord[1]-(scoord[1]-canvas.height/2)/scale);
  x = ringCoord(world.width, x);
  y = ringCoord(world.height, y);
  return [x,y];
}

function worldToScreen(wcoord,camcoord,scale) {
  return [canvas.width/2+(wcoord[0]-camcoord[0])*scale,canvas.height/2-(wcoord[1]-camcoord[1])*scale];
}

function drawArea(ctx, ob, x, y, w, h) {
  ctx.lineWidth = 0;
  ctx.fillStyle = ob.color;
  ctx.fillRect(x, y, w, h);
}

function drawAreaFromMap(ctx,x,y) {
  var mx = ringCoord(world.width,x);
  var my = ringCoord(world.height,y);
  var area = map[mx] ? map[mx][my] : undefined;
  if(area) {
    var scale = settings.scale;
    var scoord = worldToScreen([x,y],john.pos,scale);
    if(scoord[0]>-scale&&scoord[0]<canvas.width+scale&&scoord[1]>-scale&&scoord[1]<canvas.height+scale) {
      drawArea(ctx,area,scoord[0],scoord[1],scale,scale);
    }
  }
}

function drawWorld(ctx) {
  var x = john.pos[0];
  var y = john.pos[1] - 1;

  // draws a spiral loop
  for(var spiralLevel = 0; spiralLevel <= settings.drawdistance; ++spiralLevel){

    // up a level
    ++y
    drawAreaFromMap(ctx,x,y);

    // slide from centre to right on the top vertex
    for(var i=0;i<(spiralLevel*2)-1;++i) {
      ++x;
      drawAreaFromMap(ctx,x,y);
    }

    // slide from top to bottom on the right vertex
    for(var i=0;i<spiralLevel*2;++i) {
      --y;
      drawAreaFromMap(ctx,x,y);
    }

    // slide from right to left on the bottom vertex
    for(var i=0;i<spiralLevel*2;++i) {
      --x;
      drawAreaFromMap(ctx,x,y);
    }

    // slide from bottom to top on the left vertex
    for(var i=0;i<spiralLevel*2;++i) {
      ++y;
      drawAreaFromMap(ctx,x,y);
    }
  }

}

function drawDebug(ctx,scale) {
  ctx.fillStyle = "rgb(150,150,150)";
  ctx.font = '25px';
  ctx.fillText("Scale: " + settings.scale, 10, 20);
  ctx.fillText("Draw Distance: " + settings.drawdistance , 10, 40);
  ctx.fillText("World Position: " + john.pos , 10, 60);
  ctx.fillText("Selection: " + selection , 10, 80);
}

function drawFauna(ctx,scale) {
  var scoord = worldToScreen(john.pos,john.pos,scale);
  ctx.beginPath();
  ctx.arc(scoord[0]+scale/2, scoord[1]+scale/2, scale/4, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'green';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#003300';
  ctx.stroke();
}

function drawHud(ctx,scale) {
  if(selection){
    var scoord = worldToScreen(selection,john.pos,scale);
    ctx.strokeStyle = "rgb(255,255,255)";
    ctx.lineWidth = 2;
    ctx.strokeRect(scoord[0]+2, scoord[1]+2, scale-2, scale-2);
  }
}

function draw() {
  //var start = Date.now();
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var scale = settings.scale;
  drawWorld(ctx);
  drawFauna(ctx,scale);
  drawDebug(ctx,scale);
  drawHud(ctx,scale);
  //console.log("Draw took: " + (Date.now()-start));
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function updatePosition() {
  var radius = settings.drawdistance;
  var cx = john.pos[0];
  var cy = john.pos[1];
  for(var x=cx-radius;x<=cx+radius;++x){
    for(var y=cy-radius;y<=cy+radius;++y){
      var mx = ringCoord(world.width,x);
      var my = ringCoord(world.height,y);
      if(!map[mx]||!map[mx][my]) {
        console.log("Unloaded coord: [" + mx + "," + my + "]");
        updateWorldMap();
        return;
      }
    }
  }
}

function moveX(wut,howmuch) {
  wut.pos[0] = ringCoord(world.width,wut.pos[0]+howmuch);
  updatePosition();
}

function moveY(wut,howmuch) {
  wut.pos[1] = ringCoord(world.height,wut.pos[1]+howmuch);
  updatePosition();
}

function zoomIn() {
  settings.scale++;
  saveSettings();
}

function zoomOut() {
  settings.scale--;
  saveSettings();
}

function incDrawDistance() {
  settings.drawdistance++;
  saveSettings();
}

function decDrawDistance() {
  settings.drawdistance--;
  saveSettings();
}

(function() {

  window.addEventListener("resize", resizeThrottler, false);

  var resizeTimeout;
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
  var lastclick = screenToWorld([e.offsetX,e.offsetY],john.pos,settings.scale);
  if(selection && selection[0]==lastclick[0] && selection[1]==lastclick[1]) {
    selection=null;
  } else {
    selection=lastclick;
  }
}, false);

document.onkeydown = function(e) {
  switch (e.keyCode) {
    case 37:
      moveX(john,-1);
      break;
    case 38:
      moveY(john,1);
      break;
    case 39:
      moveX(john,1);
      break;
    case 40:
      moveY(john,-1);
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
  setTimeout(function (){draw();queueDraw();},settings.refreshRateMillis);
}

function loadSettings() {
  var got = localStorage.getItem("settings");
  if(got){
    settings = JSON.parse(got);
  }
}

function saveSettings() {
  if(settings){
    localStorage.setItem("settings",JSON.stringify(settings));
  }
}

function init() {
  loadSettings();
  if(!settings) {
    settings = {
      refreshRateMillis: 100,
      scale: 50,
      drawdistance: 2
    }
    saveSettings();
  }
}

init();
resize();
updateWorld();
queueDraw();
