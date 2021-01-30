const http = require('http');
const express = require('express');
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket(server);


app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('./static'));

const room = new Map();

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
      currentRoom = { owner: socket.id, name, player: new Map() };
      if (oldRoom = room.get(name)) {
        delete oldRoom.name;

        currentRoom.player = oldRoom.player;
        socket.to(name).emit('new round', false);
      }
      room.set(name, currentRoom);
    } else if (room.has(name)) {
      currentRoom = room.get(name);
    } else {
      room.set(name, currentRoom);
    }

    if (currentRoom.deadline) {
      socket.emit('clock', { deadline: currentRoom.deadline, now: Date.now() });
    }
  });

  function newRound() {
    if (!currentRoom.newRoundTimeout) {
      currentRoom.newRoundTimeout = setTimeout(() => {
        const newOwnerCandidates = new Set(io.sockets.adapter.rooms.get(currentRoom.name));
        newOwnerCandidates.delete(currentRoom.owner);
        if (!newOwnerCandidates.size) {
          room.delete(currentRoom.name);
          return;
        }

        newOwner = randomChoice(...newOwnerCandidates);
        io.to(newOwner).emit('new round', true);
      }, 1000);
    }
  }

  socket.on('disconnect', () => {
    if (currentRoom.owner === socket.id)
      newRound();
    else
      io.to(currentRoom.owner).emit('disconnects', socket.id)
  });

  socket.on('set_nick', name => {
    if ('nickname' in socket) {
      if (socket.nickname === name) return;

      currentRoom.player.set(name, currentRoom.player.get(socket.nickname));
      currentRoom.player.delete(socket.nickname);
    } else if (typeof currentRoom.player != "undefined" && !currentRoom.player.has(name)) {
      currentRoom.player.set(name, { score: 0 });
    }

    socket.nickname = name;
    if (typeof currentRoom.player != "undefined") {
      io.to(currentRoom.name).emit('players', Array.from(currentRoom.player));
    }
  });

  socket.on('chat', msg => {
    msg = msg.trim();
    if (msg === currentRoom.headword) {
      currentRoom.player.get(socket.nickname).guessed = true;
      msg = '(...)';
    }
    io.to(currentRoom.name).emit('chat', socket.nickname, msg);
  });

  socket.on('clock', ({ deadline, now }) => {
    deadline += Date.now() - now;
    currentRoom.deadline = deadline;
    socket.to(currentRoom.name).emit('clock', { deadline, now: Date.now() });
  });

  socket.on('clock end', () => {
    delete currentRoom.deadline;
  });

  socket.on('nextRound', () => {
    delete currentRoom.deadline;
    newRound();
  });

  socket.on('add_point', name => {
    gamer_score = currentRoom.player.get(name);
    score = gamer_score.score;
    score++;
    currentRoom.player.set(name, {score: score});
    console.log(score);
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
