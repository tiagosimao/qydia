const worldGenerator = require('./world-generator.js');
const uuidv4 = require('uuid/v4');
const games = {};
let stateDispatcher;

module.exports.setup = dispatcher=>{
  stateDispatcher = dispatcher;
}

module.exports.handleIntent = handle;

module.exports.createGame = ()=>{
  return new Promise((ff,rj)=>{
    worldGenerator.generate().then(w=>{
      const game = spawnGame(w);
      ff(game);
    });
  });
}

function spawnGame(world) {
  const game = {
    "id": uuidv4(),
    "world": world,
    "players": {}
  };
  games[game.id]=game;
}

function ringCoord(max,value) {
  return (max+value%max)%max;
}

function handle(intent) {
  if(!intent.gameId) {
    intent.gameId = pickGameId();
  }
  if(!intent.token) {
    login(intent);
  }
}

function pickGameId() {
  const ks = Object.keys(games);
  return ks[Math.floor(ks.length * Math.random())];
}

function login(intent) {
  const players = games[intent.gameId].players;
  const world = games[intent.gameId].world;
  const p = spawnPlayer(intent);
  players[p.id]=p;
  unicastStateToPlayer(world,p);
}

function spawnPlayer(intent) {
  return {
    "type": "entity",
    "id": uuidv4(),
    "x": 0,
    "y": 0,
    "vision": 3,
    "connectionId": intent.connectionId
  }
}

function getRelevantState(world,whom) {
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
  const result = {};
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

function unicastStateToPlayer(world,player) {
  const state = getRelevantState(world,player);
  stateDispatcher([player],state);
}
