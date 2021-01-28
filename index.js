const http = require('http');
const express = require('express');
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket(server);


app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('./static'));

const room = {};

app.get('/', (req, res) => {
  res.render('index', { room });
});
app.get('/draw', (req, res) => {
  res.render('draw');
});
app.get('/view', (req, res) => {
  res.render('view');
});


io.on('connection', socket => {
  console.log('client connected: ', socket.id);

  let currentRoom = {};

  socket.on('room', name => {
    console.log('room', socket.id, name);
    socket.join(name);
    room[name] = currentRoom = { owner: socket.id, name };
    socket.on('disconnect', () => delete room[name]);
  });

  socket.on('join', name => {
    console.log('join', socket.id, name);
    if (!room[name]) return;
    currentRoom = room[name];
    socket.join(name);

    if (currentRoom.deadline) {
      socket.emit('clock', { deadline: currentRoom.deadline, now: Date.now() });
    }
  });

  socket.on('disconnect', () => io.to(currentRoom.owner).emit('disconnects', socket.id));

  socket.on('chat', msg => {
    msg = msg.trim();
    io.to(currentRoom.name).emit('chat', msg);
  });
  socket.on('clock', ({ deadline, now }) => {
    deadline += Date.now() - now;
    currentRoom.deadline = deadline;
    socket.to(currentRoom.name).emit('clock', { deadline, now: Date.now() });
  });

  socket.on('clock end', () => delete currentRoom.deadline);

  // WebRTC
  socket.on('webrtc to', ({ sdp, candidate, addr }) => {
    console.log('webrtc to', socket.id, sdp, candidate, addr);
    if (addr)
      io.to(addr).emit(sdp ? 'sdp' : 'candidate', sdp || candidate);
    else
      io.to(currentRoom.owner).emit(sdp ? 'sdp from' : 'candidate from', { sdp, candidate, addr: socket.id });
  });
});

server.listen(process.env.PORT || 8000);

// vim: set et ts=2 sw=2: kate: replace-tabs on; indent-width 2; tab-width 2;
