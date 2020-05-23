

let games = [];

const players = [{name:'josh'},{name:'maria'}]
const room = 'kitchen'

const checkGame = (room) => {
  
  const game = getGame(room)

  if(game) {
    return {error: 'Game already exists in this room'}
  } else {
    return true;
  }

}

const StartNewGame = (room, players) => {

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
    }

    games.push(game);

    return game;

}

const newGame = (room) => {

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
      game.cards.discardPile = [selected, ...game.cards.discardPile]
      if(game.tokens < 8) {
        game.noteTokens ++
      }
     
      drawCard(game)

}

const handlePlay = (game, index) => {

      const currentHand = game.cards.hands[game.currentTurn]
      const selected = currentHand.splice(index,1)[0]

      if(game.cards.table[selected.color] === selected.value-1) {
        game.cards.table[selected.color] ++
      } else {
        game.cards.discardPile = [selected, ...game.cards.discardPile];
        game.stormTokens --
        if(game.stormTokens === 0) {
          handleGameOver(game)
        }
      }

      if(game.cards.deck.length > 0) {
        drawCard(game)
      }
}

const handleHint = (game, hint) => {

      if(game.noteTokens>0) {

        const playerCards = game.cards.hands[hint.target];

        playerCards.forEach(card => {

            if(card[hint.type] === hint.value) {
              card.hint = {[hint.type] : true};
            }
          
        })

        game.noteTokens --

      } 

}

const handleGameOver = (game) => {

      game.gameOver = true;
      game.score = getScore(game.cards.table)

}

const drawCard = (game) => {

        const newCard = game.cards.deck.shift();
        const currentHand = game.cards.hands[game.currentTurn]
        currentHand.unshift(newCard)
        game.drawnCard = newCard

        if(game.cards.deck.length === 0) {
          game.remainingTurns = game.players.length
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

const trim = (value) => value.trim().toLowerCase();
const generateGameId = () =>  '_' + Math.random().toString(36).substr(2, 9);

module.exports = { checkGame, StartNewGame, newGame, getGame, getAllGames, removeGame, playTurn };