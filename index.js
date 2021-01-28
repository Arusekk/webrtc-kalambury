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

  let currentRoom;

  socket.on('room', name => {
    console.log('room', socket.id, name);
    currentRoom = name;
    socket.join(name);
    room[name] = { owner: socket.id };
    socket.on('disconnect', () => delete room[name]);

    if (room[name].clockTime) {
      io.to(socket.id).emit('clock', room[name].clockTime);
    }
  });

  socket.on('join', name => {
    console.log('join', socket.id, name);
    currentRoom = name;
    socket.join(name);

    if (room[name].clockTime) {
      socket.emit('clock', room[name].clockTime);
    }
  });

  socket.on('disconnect', () => room[currentRoom] && io.to(room[currentRoom].owner).emit('disconnects', socket.id));

  socket.on('chat', msg => io.to(currentRoom).emit('chat', msg));
  socket.on('clock', clockTime => {
    io.to(currentRoom).emit('clock', clockTime);
    room[currentRoom].clockTime = clockTime;
  });

  socket.on('clock end', () => {
    delete room[currentRoom].clockTime;
  });

  // WebRTC
  socket.on('webrtc to', ({ sdp, candidate, addr }) => {
    console.log('webrtc to', socket.id, sdp, candidate, addr);
    if (addr)
      io.to(addr).emit(sdp ? 'sdp' : 'candidate', sdp || candidate);
    else
      io.to(room[currentRoom].owner).emit(sdp ? 'sdp from' : 'candidate from', { sdp, candidate, addr: socket.id });
  });
});

server.listen(process.env.PORT || 8000);
