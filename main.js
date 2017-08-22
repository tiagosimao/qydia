const game = require('./game/logic.js')
const netcode = require('./net/server.js')

game.createGame()
.then(intentHandler=>netcode.boot(intentHandler))
