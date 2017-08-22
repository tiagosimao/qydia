module.exports.generate = ()=>{
  return new Promise((ff,rj)=>{
    ff(gen())
  });
};

function gen() {
  const areaTypes = new Map()
  areaTypes.set("water",{color:"rgb(0,0,150)"})
  areaTypes.set("sand",{color:"rgb(76,70,50)"})
  areaTypes.set("grass",{color:"rgb(13,55,13)"})
  areaTypes.set("rock",{color:"rgb(18,31,31)"})
  return generate(10,10,areaTypes)
}

function generate(w,h,areaTypes) {
  const world = {}
  world.width=w
  world.height=h
  world.map=new Array()
  for(let i=0;i<w;++i){
    world.map[i]=new Array()
    for(let j=0;j<h;++j){
      world.map[i][j] = generateArea(i*w+j,areaTypes)
    }
  }
  return world
}

function generateArea(idi,areaTypes){
  const obj = {
    id: idi
  }
  let typeIndex = Math.floor(Math.random()*areaTypes.size)
  let types = Array.from(areaTypes.keys())
  obj.type=types[typeIndex]
  obj.color = areaTypes.get(obj.type).color
  obj.wood = 0
  obj.trees = Math.random() * 10
  obj.ore = 15 + Math.floor(Math.random() * 10)
  return obj
}
