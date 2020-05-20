const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv/config')

const { addUser, removeUser, getUser, getUsersInRoom, getAllUsers } = require('./users')
const { checkGame, StartNewGame, newGame, getGame, getAllGames, removeGame } = require('./game')

const PORT = process.env.PORT || 5000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const server = http.createServer(app);
const io = socketio(server);


io.on('connection', (socket) => {
  console.log('We have a new connection!');

  socket.on('join', async ({name, room}, callback) => {

  	const { error, user } = addUser({id:socket.id, name, room});
  
  	if(error) return callback({error})

  	socket.join(user.room);

  	io.to(user.room).emit('onlineUsers', {room: user.room, users: getUsersInRoom(user.room)})

  	callback({name:user.name});
  })

  socket.on('startGame', (prop) => {
    const user = getUser(socket.id);
    const UsersInRoom = getUsersInRoom(user.room);
    const game = StartNewGame(user.room, UsersInRoom)
    io.to(user.room).emit('GameUpdate', game )
  })

  socket.on('disconnect', () => {

      const user = removeUser(socket.id);

      if(user) {
      	const UsersInRoom = getUsersInRoom(user.room);
      	if(UsersInRoom.length === 0) { removeGame(user.room) }
      	io.to(user.room).emit('onlineUsers', {room: user.room, users: UsersInRoom})
      }
    });
  });

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));