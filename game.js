

let games = [];

const players = [{name:'josh'},{name:'maria'}]
const room = 'kitchen'

const checkGame = (room, name) => {
  
  const game = getGame(room)

  if(game) {
    if(game.players.some(e => e.name === name)){
      return {game};
    } else {
      return {gameError: 'Game already exists in this room'}
    }
  } else {
    return {newGame:true};
  }

}

const StartNewGame = (room, players) => {

    const checkgame = getGame(room)
    
    if(checkgame) {
      removeGame(room)
    }

    room = trim(room);

    const game = {
      started: true,
      players: players.map((e,i) => {return {name:e.name, order:i} }),
      currentTurn: Math.floor(Math.random() * players.length),
      cards: setupGame(players.length),
      room: room,
      noteTokens: 8,
      stormTokens: 3,
      game_id:generateGameId(),
      log: [],
    }
    game.log.push(newMessage('Game Started'))
    games.push(game);

    return game;

}

const newGame = (room, players) => {
  removeGame(room)
  return StartNewGame(room, players)
}

const getGame = (room) => games.find((singleGame) => singleGame.room === room.trim().toLowerCase() )

const removeGame = (room) => {
  const index = games.findIndex((game) => game.room === room.trim().toLowerCase());
  if(index !== -1) return games.splice(index, 1)[0];
}

const getAllGames = () => games

const playTurn = (room, type, action) => {

    const game = getGame(room)

    if(game) {

      switch(type) {
        case 'discard':
          handleDiscard(game, action)
          break;
        case 'play':
          handlePlay(game, action)
          break;
        case 'hint':
          handleHint(game, action)
          break;
        default:

      }

      nextTurn(game);

      if(game.cards.deck.length === 0) {

        if(game.remainingTurns > 0) {
          game.remainingTurns--
          const message = `The game will end in ${game.remainingTurns} turns`
          game.log.push(newMessage(message))
        } else {
          handleGameOver(game)
        }

      }

      return game;
    }
}

const handleDiscard = (game, index) => {

      const currentHand = game.cards.hands[game.currentTurn]
      const selected = currentHand.splice(index,1)[0] 
      selected.hintColor = undefined;
      selected.hintValue = undefined;
      game.cards.discardPile = [...game.cards.discardPile, selected]
      if(game.noteTokens < 8) {
        game.noteTokens ++
      }
      
      const message = `<strong>${game.players[game.currentTurn].name}</strong> discarded <strong>${selected.value} ${selected.color}</strong>`
      game.log.push(newMessage(message))

      if(game.cards.deck.length > 0) {
        drawCard(game)
      }

}

const handlePlay = (game, index) => {

      const currentHand = game.cards.hands[game.currentTurn]
      const selected = currentHand.splice(index,1)[0]
      selected.hintColor = undefined;
      selected.hintValue = undefined;

      let message = ''
      if(game.cards.table[selected.color] === selected.value-1) {
        game.cards.table[selected.color] ++
        message = `<strong>${game.players[game.currentTurn].name}</strong> played <strong>${selected.value} ${selected.color}</strong> correctly`
      } else {
        game.cards.discardPile = [...game.cards.discardPile, selected];
        game.stormTokens --
        message = `<strong>${game.players[game.currentTurn].name}</strong> played <strong>${selected.value} ${selected.color}</strong> but it wasn't correct!`
      }

      game.log.push(newMessage(message))

      if(game.stormTokens === 0) {
        handleGameOver(game)
      }

      if(game.cards.deck.length > 0) {
        drawCard(game)
      }
}

const handleHint = (game, hint) => {

      if(game.noteTokens>0) {

        const playerCards = game.cards.hands[hint.target];

        playerCards.forEach(card => {

            if(card.color === hint.value) {
              card.hintColor = true;
            } else if(card.value === hint.value) {
              card.hintValue = true;
            }
          
        })

        game.log.push(newMessage(`<strong>${game.players[game.currentTurn].name}</strong> gave <strong>${game.players[hint.target].name}</strong> a hint: <strong>${hint.value}</strong>`))
        game.noteTokens --

      } 

}


const handleGameOver = (game) => {
      game.gameOver = true;
      game.score = getScore(game.cards.table);
      game.result = getResult(game.score)

      const message = game.stormTokens === 0 ? `The third storm token has been played. The game is over` : `The game is over. Your score is ${game.score}. ${game.result}`
      game.log.push(newMessage(message))
}

const drawCard = (game) => {

        const newCard = game.cards.deck.shift();
        const currentHand = game.cards.hands[game.currentTurn]
        currentHand.unshift(newCard)
        game.drawnCard = newCard

        if(game.cards.deck.length === 0) {
          game.remainingTurns = game.players.length
          const message = `The last card has been drawn from the deck. The game will end in ${game.remainingTurns} turns`
          game.log.push(newMessage(message))
        }


}

const nextTurn = (game) => {

      game.currentTurn += 1;

      if(game.currentTurn >= game.players.length) {
        game.currentTurn = 0
      }

      return game

}

const setupGame = (number) => {

    const deck = generateDeck();
    const cardsEachPayer = number < 4 ? 5 : 4;

    const hands = []

    for(let i = 0; i < number; i++) {
      const player = deck.splice(0, cardsEachPayer);
      hands.push(player)
    }

    return {deck, hands, discardPile: [], table: {red:0, yellow:0, green:0, blue:0, white:0} }
}

const generateDeck = () => {

    const colors = ['red', 'yellow', 'green', 'blue', 'white']
    const values = [1,1,1,2,2,3,3,4,4,5]

    const cards = colors.map(color =>  values.map(value => ({value, color, id:generateGameId()}) ) )

    const merger = [].concat.apply([], cards).sort(() => Math.random() - 0.5);

    return merger

}

const getScore = (obj) => {

    var sum = 0;
    for( var el in obj ) {
      if( obj.hasOwnProperty( el ) ) {
        sum += parseFloat( obj[el] );
      }
    }
    return sum;

}

const getResult = (score) => {

  if (score < 5) { return 'Oh dear! The crowd booed.' } 
  else if (score < 10) { return 'Poor! Hardly applaused.' } 
  else if (score < 15) { return 'OK! The viewers have seen better.' } 
  else if (score < 20) { return 'Good! The audience is pleased.' } 
  else if (score < 24) { return 'Very good! The audience is enthusiastic!' } 
  else if (score === 25) { return 'Legendary! The audience will never forget this show!' } 

}

const newMessage = (message) => {return {value: message, date: Date.now()}}
const trim = (value) => value.trim().toLowerCase();
const generateGameId = () =>  '_' + Math.random().toString(36).substr(2, 9);

module.exports = { checkGame, StartNewGame, newGame, getGame, getAllGames, removeGame, playTurn };