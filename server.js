var express = require('express');
var meth = require('./static/meth');
var app = express();

var world;

function getStuffNear(world,wcoord,radius){
  var x = wcoord[0];
  var y = wcoord[1];
  var result = new Map();
  radius += (radius % 2 == 0) ? 1 : 0;
  for(var i=-radius;i<=radius;++i) {
    for(var j=-radius;j<=radius;++j) {
      var mx = meth.ringCoord(world.width,x+i);
      var my = meth.ringCoord(world.height,y+j);
      var xk = "" + (x + i);
      var yk = "" + (y + j);
      if(!result[xk]) {
        result[xk] = new Map();
      }
      result[xk][yk]=world.map[mx][my];
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

world = generate(10,10);

app.use(express.static('static'))

app.get('/api/world/', function (req, res) {
  var x = req.query.x;
  var y = req.query.y;
  var radius = req.query.radius;
  if(x && y && radius){
    res.send(getStuffNear(world,[Number.parseInt(x),Number.parseInt(y)],Number.parseInt(radius)));
  } else {
    res.send({
      width:world.width,
      height:world.height
    });
  }
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
