

let games = [];

const trim = (value) => value.trim().toLowerCase();

const checkGame = (room) => {
  


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

const getGame = (room) => puzzles.find((singleGame) => singleGame.room === room.trim().toLowerCase() )

const removeGame = (room) => {
  const index = games.findIndex((game) => game.room === room.trim().toLowerCase());
  if(index !== -1) return game.splice(index, 1)[0];
}

const getAllGames = () => puzzles

const setupGame = (number) => {

    const deck = generateDeck();

    const hands = []

    for(let i = 0; i < number; i++) {
      const player = deck.splice(0, 4);
      hands.push(player)
    }

    return {deck, hands, descardPile: [], table: []}
}

const generateDeck = () => {

    const colors = ['red', 'yellow', 'green', 'blue', 'white']
    const values = [1,1,1,2,2,3,3,4,4,5]

    const cards = colors.map(color => {

      return values.map(value => {
        return {value, color}
      })

    })

    const merger = [].concat.apply([], cards).sort(() => Math.random() - 0.5);

    return cards

}

const generateGameId = () =>  '_' + Math.random().toString(36).substr(2, 9);

module.exports = { checkGame, StartNewGame, newGame, getGame, getAllGames, removeGame };