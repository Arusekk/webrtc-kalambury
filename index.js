const http = require('http');
const express = require('express');
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('./static'));

const rooms = {};

app.get('/', (req, res) => {
  res.render('index', { rooms });
});

io.on('connection', socket => {
  console.log('client connected: ', socket.id);
  socket.on('room', data => {
    rooms[socket.id] = data;
  });
  socket.on('sdp', data => {
    socket.broadcast.emit('sdp', data);
  });
  socket.on('candidate', data => {
    socket.broadcast.emit('candidate', data);
  });
});

server.listen(process.env.PORT || 8000);
