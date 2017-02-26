var canvas = document.getElementById("canvas");

var scale = 30;

var drawdistance = 30;

var worldpos = [0,0];

var lastclick = [0,0];

var stuff = new Map();

var map;

function getStuffNear(x,y,radius){
  var result = new Array();
  for(var i=-radius;i<radius;++i){
    for(var j=-radius;j<radius;++j){
      if(map[x+i]&&map[x+i][y+j]){
        if(!result[x+i]){
          result[x+i] = new Array();
        }
        result[x+i][y+j]=map[x+i][y+j];
      }
    }
  }
  return result;
}

function placeObjectNear(ob,x,y){
  if(!map[x]){
    map[x] = new Array();
  }
  if(!map[x][y]){
    map[x][y] = ob;
    return ob;
  } else {
    var xspread = Math.random() < 0.3 ? - 1 : 1;
    var yspread = Math.random() < 0.3 ? - 1 : 1;
    xspread *= 1 + Math.floor(Math.random() * 6);
    yspread *= 1 + Math.floor(Math.random() * 6);
    x += xspread;
    y += yspread;
    return placeObjectNear(ob,x,y);
  }
}

function generateObject(idi){
  var obj = {
    id: idi,
  };
  obj.color= {
    r:Math.abs(obj.id)%150,
    g:Math.abs(2*(obj.id+85))%150,
    b:Math.abs(3*(obj.id+170))%150
  }
  stuff.set(obj.id,obj);
  return obj;
}

function generate(w,h) {
  map = new Array();
  for(var i=-w/2;i<w/2;++i){
    map[i]=new Array();
    for(var j=-h/2;j<h/2;++j){
      map[i][j] = generateObject(i*w+j);

      //placeObjectNear(got,0,0);
    }
  }
}

function screenToWorld(coord) {
  return [Math.floor((coord[0]-canvas.width/2)/scale+worldpos[0]),Math.ceil(worldpos[1]-(coord[1]-canvas.height/2)/scale)];
}


function worldToScreen(coord) {
  return [canvas.width/2+(coord[0]-worldpos[0])*scale,canvas.height/2-(coord[1]-worldpos[1])*scale];
}

function drawArea(ctx, ob, x, y, w, h, selected) {
  var r = ob.color.r;
  var g = ob.color.g;
  var b = ob.color.b;
  if(selected){
    r=255;
    g=255;
    b=255;
  }
  ctx.fillStyle = "rgb("+r+","+g+","+b+")";
  ctx.fillRect(x, y, w, h);
}

function drawWorld(ctx) {
  var got = getStuffNear(worldpos[0],worldpos[1],drawdistance);
  for (var x in got) {
    for (var y in got[x]) {
      var point = got[x][y];
      var wcoord = [x,y];
      var scoord = worldToScreen(wcoord);
      var selected = (lastclick[0]==x&&lastclick[1]==y)?true:false;
      if(selected){
        console.log(selected + wcoord);
      }
      drawArea(ctx,point,scoord[0],scoord[1],scale,scale,selected);
    }
  }
}

function drawDebug(ctx){
  ctx.fillStyle = "rgb(150,150,150)";
  ctx.font = '25px';
  ctx.fillText("Scale: " + scale, 10, 20);
  ctx.fillText("Draw Distance: " + drawdistance , 10, 40);
  ctx.fillText("World Position: " + worldpos , 10, 60);
  ctx.fillText("Last Click: " + lastclick , 10, 80);
}

function draw() {
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWorld(ctx);
  drawDebug(ctx);
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
  lastclick = screenToWorld([e.offsetX,e.offsetY]);
  console.log([e.offsetX,e.offsetY]);

  draw();
    }, false);

document.onkeydown = function(e) {
  switch (e.keyCode) {
    case 37:
      worldpos[0]--;
      draw();
      break;
    case 38:
      worldpos[1]++;
      draw();
      break;
    case 39:
      worldpos[0]++;
      draw();
      break;
    case 40:
      worldpos[1]--;
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

generate(100,100);

resize();
draw();
