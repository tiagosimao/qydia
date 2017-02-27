var express = require('express');
var meth = require('./static/meth');
var app = express();

function getStuffNear(world,wcoord,radius){
  var x = wcoord[0];
  var y = wcoord[1];
  var result = new Array();
  for(var i=-radius;i<radius;++i){
    for(var j=-radius;j<radius;++j){
      console.log(world.width+":"+(x+i));
      var mx = meth.ringCoord(world.width,x+i);
      var my = meth.ringCoord(world.height,y+j);
      if(!result[x+i]){
        result[x+i] = new Array();
      }
      console.log(mx+":"+my);
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

var world = generate(10,10);

app.use(express.static('static'))

app.get('/api/world/', function (req, res) {
  var x = req.query.x;
  var y = req.query.y;
  var radius = req.query.radius;
  if(x && y && radius){
    res.send(getStuffNear(world,[Number.parseInt(x),Number.parseInt(y)],radius));
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
