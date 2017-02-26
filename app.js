var canvas = document.getElementById("canvas");

var scale = 50;

var drawdistance = 30;

var john = {
  pos: [0,0]
};

var selection;

var map;

function getStuffNear(world,wcoord,radius){
  var x = wcoord[0];
  var y = wcoord[1];
  var result = new Array();
  for(var i=-radius;i<radius;++i){
    for(var j=-radius;j<radius;++j){
      var mx = ringCoord(world.width,x+i);
      var my = ringCoord(world.height,y+j);
      if(!result[x+i]){
        result[x+i] = new Array();
      }
      result[x+i][y+j]=world.map[mx][my];
    }
  }
  return result;
}

function generateArea(idi){
  var obj = {
    id: idi,
  };
  obj.color= {
    r:50+Math.abs(obj.id)%150,
    g:0,
    b:0,
  }
  return obj;
}

function generate(w,h) {
  var world = {
    width:w,
    height:h
  };
  var map = new Array();
  for(var i=0;i<w;++i){
    map[i]=new Array();
    for(var j=0;j<h;++j){
      map[i][j] = generateArea(i*w+j);
    }
  }
  world.map=map;
  return world;
}

function ringCoord(max,value) {
  return (max+value%max)%max;
}

function moveX(wut,howmuch) {
  wut.pos[0] = ringCoord(world.width,wut.pos[0]+howmuch);
}

function moveY(wut,howmuch) {
  wut.pos[1] = ringCoord(world.height,wut.pos[1]+howmuch);
}

function screenToWorld(scoord,camcoord) {
  var x = Math.floor((scoord[0]-canvas.width/2)/scale+camcoord[0]);
  var y = Math.ceil(camcoord[1]-(scoord[1]-canvas.height/2)/scale);
  x = ringCoord(world.width, x);
  y = ringCoord(world.height, y);
  return [x,y];
}

function worldToScreen(wcoord,camcoord) {
  return [canvas.width/2+(wcoord[0]-camcoord[0])*scale,canvas.height/2-(wcoord[1]-camcoord[1])*scale];
}

function drawArea(ctx, ob, x, y, w, h) {
  var r = ob.color.r;
  var g = ob.color.g;
  var b = ob.color.b;
  ctx.lineWidth = 0;
  ctx.fillStyle = "rgb("+r+","+g+","+b+")";
  ctx.fillRect(x, y, w, h);
}

function drawWorld(ctx) {
  var got = getStuffNear(world,john.pos,drawdistance);
  for (var x in got) {
    for (var y in got[x]) {
      var point = got[x][y];
      var scoord = worldToScreen([x,y],john.pos);
      drawArea(ctx,point,scoord[0],scoord[1],scale,scale);
    }
  }
}

function drawDebug(ctx) {
  ctx.fillStyle = "rgb(150,150,150)";
  ctx.font = '25px';
  ctx.fillText("Scale: " + scale, 10, 20);
  ctx.fillText("Draw Distance: " + drawdistance , 10, 40);
  ctx.fillText("World Position: " + john.pos , 10, 60);
  ctx.fillText("Selection: " + selection , 10, 80);
}

function drawFauna(ctx) {
  var scoord = worldToScreen(john.pos,john.pos);
  ctx.beginPath();
  ctx.arc(scoord[0]+scale/2, scoord[1]+scale/2, scale/4, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'green';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#003300';
  ctx.stroke();
}

function drawHud(ctx) {
  if(selection){
    var scoord = worldToScreen(selection,john.pos);
    ctx.strokeStyle = "rgb(255,255,255)";
    ctx.lineWidth = 2;
    ctx.strokeRect(scoord[0]+2, scoord[1]+2, scale-2, scale-2);
  }
}

function draw() {
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWorld(ctx);
  drawFauna(ctx);
  drawDebug(ctx);
  drawHud(ctx);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
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
        draw();
     }, 100);
    }
  }

}());

canvas.addEventListener('click', function(e) {
  var lastclick = screenToWorld([e.offsetX,e.offsetY],john.pos);
  if(selection&&selection[0]==lastclick[0]&&selection[1]==lastclick[1]){
    selection=null;
  } else {
    selection=lastclick;
  }
  draw();
    }, false);

document.onkeydown = function(e) {
  switch (e.keyCode) {
    case 37:
      moveX(john,-1);
      draw();
      break;
    case 38:
      moveY(john,1);
      draw();
      break;
    case 39:
      moveX(john,1);
      draw();
      break;
    case 40:
      moveY(john,-1);
      draw();
      break;
    case 73:
      scale++;
      draw();
      break;
    case 75:
      scale--;
      draw();
      break;
    case 79:
      drawdistance++
      draw();
      break;
    case 76:
      drawdistance--;
      draw();
      break;
    }
};

world = generate(10,10);

resize();
draw();
