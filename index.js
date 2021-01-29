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


function randomChoice(...arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

io.on('connection', socket => {
  console.log('client connected: ', socket.id);

  let currentRoom = {};

  socket.on('room', ({ name, mode }) => {
    console.log('room', socket.id, name, mode);
    socket.join(name);

    if (mode === 'draw') {
      if (room[name]) {
        socket.to(name).emit('new round', false);
        delete room[name].name;
      }

      room[name] = currentRoom = { owner: socket.id, name };
    } else if (room[name]) {
      currentRoom = room[name];
    } else {
      room[name] = currentRoom;
    }

    if (currentRoom.deadline) {
      socket.emit('clock', { deadline: currentRoom.deadline, now: Date.now() });
    }
  });

  function newRound() {
    if (!currentRoom.newRoundTimeout) {
      currentRoom.newRoundTimeout = setTimeout(() => {
        const newOwnerCandidates = new Set(io.sockets.adapter.rooms.get(currentRoom.name))
        newOwnerCandidates.delete(currentRoom.owner);
        if (!newOwnerCandidates.size) {
          delete room[currentRoom.name];
          return;
        }

        newOwner = randomChoice(...newOwnerCandidates);
        io.to(newOwner).emit('new round', true);
      }, 1000);
    }
  }

  socket.on('disconnect', () => {
    if (currentRoom.owner == socket.id)
      newRound();
    else
      io.to(currentRoom.owner).emit('disconnects', socket.id)
  });

  socket.on('chat', msg => {
    msg = msg.trim();
    io.to(currentRoom.name).emit('chat', msg);
  });
  socket.on('clock', ({ deadline, now }) => {
    deadline += Date.now() - now;
    currentRoom.deadline = deadline;
    socket.to(currentRoom.name).emit('clock', { deadline, now: Date.now() });
  });

  socket.on('clock end', () => {
    delete currentRoom.deadline;
    newRound();
  });

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
