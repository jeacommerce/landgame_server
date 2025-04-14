
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

let players = {};

io.on('connection', (socket) => {
  console.log('사용자 연결됨:', socket.id);

  players[socket.id] = { id: socket.id, lat: 37.5665, lng: 126.9780 };
  socket.broadcast.emit('player-joined', players[socket.id]);
  socket.emit('all-players', players);

  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id].lat = data.lat;
      players[socket.id].lng = data.lng;
      socket.broadcast.emit('player-moved', { id: socket.id, ...data });
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    socket.broadcast.emit('player-left', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
