const netCode = require('./net/server.js');
const gameLogic = require('./game/logic.js');

netCode.setup(gameLogic.handleIntent);
gameLogic.setup(netCode.sendState);
gameLogic.createGame();
