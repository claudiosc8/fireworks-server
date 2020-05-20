

let games = [];

const trim = (value) => value.trim().toLowerCase();

const checkGame = (room) => {
  


}

const StartNewGame = (room, players) => {

    room = trim(room);

    const game = {
      started: true,
      players: players,
      cards: setupGame(players),
      room: room,
      noteTokens: 8,
      stormTokens: 3,
      discardPile: [],
    }

    games.push(game);
    return game;

}

const newGame = (room) => {

}


const getGame = (room) => puzzles.find((singleGame) => singleGame.room === room.trim().toLowerCase() )

const removeGame = (room) => {

}

const getAllGames = () => puzzles

const setupGame = (number) => {

    const cards = generateDeck();

    const players = []

    for(let i = 0; i < number; i++) {
      const hand = cards.splice(0, 4);
      players.push(hand)
    }

    return {cards, players}
}

const generateDeck = () => {

    const colors = ['red', 'yellow', 'green', 'blue', 'white']
    const values = [Array(3).fill(1), Array(2).fill(2), Array(2).fill(3), Array(2).fill(4),[5]].flat()

    const cards = colors.map(color => {

      return values.map(value => {
        return {value, color}
      })

    }).flat().sort(() => Math.random() - 0.5)

    return cards

}

module.exports = { checkGame, StartNewGame, newGame, getGame, getAllGames, removeGame };