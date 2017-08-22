const worldGenerator = require('./world-generator.js');
const netcode = require('../net/server.js')

module.exports.createGame = ()=>{
  return new Promise((ff,rj)=>{
    worldGenerator.generate().then(w=>{
      world=w
      ff(handler)
    })
  })
}

const players = {};
let world = {};

function ringCoord(max,value) {
  return (max+value%max)%max;
}

function handler(intent,connection) {
  if(!intent.token) {
    login(connection);
  }
}

function login(connection) {
  const p = spawnPlayer(connection);
  players[connection.id]=p;
  unicastStateToPlayer(p);
  multicastAction({
    "action": "create",
    "type": "entity",
    "agent": p
  });
}

function spawnPlayer(connection) {
  return {
    "type": "entity",
    "id": connection.id,
    "x": 0,
    "y": 0,
    "vision": 3,
    "connectionId": connection.id
  }
}

function getRelevantState(whom) {
  return {
    "world": {
      "width":world.width,
      "height":world.height
    },
    "map": getStuffNear(world,whom.x,whom.y,whom.vision||1),
    "me": whom
  }
}

function getStuffNear(world,x,y,radius) {
  let result = {};
  for(let i=-radius;i<=radius;++i) {
    for(let j=-radius;j<=radius;++j) {
      let mx = ringCoord(world.width,x+i);
      let my = ringCoord(world.height,y+j);
      let kx = mx + "";
      let ky = my + "";
      let row = result[kx];
      if(!row) {
        result[kx] = row = {};
      }
      row[ky]=world.map[mx][my];
    }
  }
  return result;
}

function unicastStateToPlayer(player) {
  const state = getRelevantState(player)
  netcode.sendToPlayer(player, state)
}

function multicastAction(action) {
}
