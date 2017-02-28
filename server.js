var express = require('express');
var meth = require('./static/meth');
var app = express();

var areaTypes = new Map();

var world;

function getStuffNear(world,wcoord,radius){
  var x = wcoord[0];
  var y = wcoord[1];
  var result = {};
  for(var i=-radius;i<=radius;++i) {
    for(var j=-radius;j<=radius;++j) {
      var mx = meth.ringCoord(world.width,x+i);
      var my = meth.ringCoord(world.height,y+j);
      var kx = mx + "";
      var ky = my + "";
      var row = result[kx];
      if(!row) {
        result[kx] = row = {};
      }
      row[ky]=world.map[mx][my];
    }
  }
  return result;
}

function generateArea(idi){
  var obj = {
    id: idi,
  };
  var typeIndex = Math.floor(Math.random()*areaTypes.size);
  var types = Array.from(areaTypes.keys());
  obj.type=types[typeIndex];
  obj.color = areaTypes.get(obj.type).color;
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

function init(){
  areaTypes.set("water",{color:"rgb(0,0,150)"});
  areaTypes.set("sand",{color:"rgb(76,70,50)"});
  areaTypes.set("grass",{color:"rgb(13,55,13)"});
  areaTypes.set("rock",{color:"rgb(18,31,31)"});
  world = generate(10,10);
}

init();


app.use(express.static('static'))

app.get('/api/world/', function (req, res) {
  var x = req.query.x;
  var y = req.query.y;
  var radius = req.query.radius;
  if(x && y && radius){
    var got = getStuffNear(world,[Number.parseInt(x),Number.parseInt(y)],Number.parseInt(radius));
    res.json(got);
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
