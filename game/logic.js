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
  const game = games[intent.gameId];
  if(!game) {
    intent.gameId = pickGameId();
    login(intent);
  } else if("move"==intent.action) {
    move(game, intent);
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
  unicastStateToPlayer(intent.gameId, world, p);
}

function move(game, intent){
  const player = game.players[intent.myId];
  const target = intent.target;
  if(player && target){
    player.x = ringCoord(game.world.width,target[0]);
    player.y = ringCoord(game.world.height,target[1]);
    unicastStateToPlayer(game.id, game.world, player);
  }
}

function spawnPlayer(intent) {
  return {
    "type": "entity",
    "id": uuidv4(),
    "x": 0,
    "y": 0,
    "vision": 1,
    "connectionId": intent.connectionId
  }
}

function getRelevantState(gameId,world,whom) {
  return {
    "gameId": gameId,
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

function unicastStateToPlayer(gameId, world, player) {
  const state = getRelevantState(gameId,world,player);
  stateDispatcher([player],state);
}
