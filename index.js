const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://localhost:8080']
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Hey Socket.io</h1>');
});

var roomsSocket = io.of('/rooms'),
    gameSocket = io.of('/game');

roomsSocket.on('connection', async (socket) => {
  console.log('a user connected to the rooms namespace');

  var rooms = await io.of('/game').adapter.rooms;

  var roomsArray = [...rooms.keys()].map((room) => {
    return {
      id: room,
      players: rooms.get(room).size,
    }
  });

  console.log(roomsArray);

  // send the amount of rooms to the client
  socket.emit('allRooms', roomsArray);
});

gameSocket.on('connection', (socket) => {
  console.log('a user connected to the game namespace');

  socket.on('joinRoom', async (roomId) => {
    console.log(`user joined room ${roomId}`);

    // disconnect the socket from its own room
    socket.leave(socket.id);

    socket.join(roomId);
  });
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // socket.emit('newUser', socket.id);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});