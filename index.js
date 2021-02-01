const http = require('http');
const express = require('express');
const socket = require('socket.io');
const crypto = require('crypto');
const fs = require("fs");

const hmacSecret = process.env.SECRET || (() => { throw new Error('SECRET not set') })();
const app = express();
const server = http.createServer(app);
const io = socket(server);

var dictionary = {};

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

function genHmac(data) {
  return crypto.createHmac('sha256', hmacSecret).update(data).digest('hex');
}

function makeDictionary() {
  var textFromFile = fs.readFileSync('word-list.txt', 'utf-8').toString();
  dictionary = textFromFile.trim().split("\n");
}

makeDictionary()

io.on('connection', socket => {
  console.log('client connected: ', socket.id);

  let currentRoom = {},
      currentPlayer = { score: 0, present: true };



  socket.on('room', ({ name, mode }) => {
    console.log('room', socket.id, name, mode);
    socket.join(name);

    if (mode === 'draw') {
      currentRoom = { owner: socket.id, name, timestamp: Date.now(), player: new Map(), score_changed: false };
      const oldRoom = room.get(name);
      if (oldRoom !== undefined) {
        delete oldRoom.name;

        currentRoom.timestamp = oldRoom.timestamp;
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

  function playersUpdated() {
    if (currentRoom.name && currentRoom.player)
      io.to(currentRoom.name).emit('players', Array.from(currentRoom.player));
  }

  socket.on('disconnect', () => {
    currentPlayer.present = false;
    if (currentRoom.owner === socket.id)
      newRound();
    else {
      io.to(currentRoom.owner).emit('disconnects', socket.id)
      playersUpdated();
    }
  });

  socket.on('set nick', ({ value, mac }, callback) => {
    // validate name
    if (!('player' in currentRoom)) {
      callback({ result: 'reject', reason: 'not ready' });
      return;
    }

    const computedMac =
      genHmac(`${currentRoom.timestamp}:${currentRoom.name}:${value}`);

    if (currentRoom.player.has(value) && computedMac !== mac) {
      callback({ result: 'reject', reason: 'duplicate' });
      return;
    }

    // proceed with the happy path
    callback({ result: 'ok', mac: computedMac });

    if ('nickname' in socket) {
      if (socket.nickname === value) return;
      currentRoom.player.delete(socket.nickname);
    } else {
      currentPlayer = currentRoom.player.get(value) || currentPlayer;
    }
    currentRoom.player.set(value, currentPlayer);

    socket.nickname = value;
    currentPlayer.present = true;
    playersUpdated();
  });

  socket.on('chat', msg => {
    if (!('name' in currentRoom) || !('nickname' in socket)) return;

    io.to(currentRoom.name).emit('chat', {
      name: socket.nickname,
      type: 'msg',
      msg
    });
  });

  socket.on('clock', ({ deadline, now }) => {
    if (!('name' in currentRoom) || 'deadline' in currentRoom) return;

    deadline += Date.now() - now;
    currentRoom.deadline = deadline;

    io.to(currentRoom.owner).emit('random word', randomChoice(...dictionary));
    socket.to(currentRoom.name).emit('clock', { deadline, now: Date.now() });
  });

  socket.on('nextRound', () => {
    delete currentRoom.deadline;
    newRound();
  });

  socket.on('add point', name => {
    console.log(name, currentRoom.owner)
    if (socket.id == currentRoom.owner && currentRoom.player.has(name)) {
      if (!currentRoom.score_changed) {
        currentRoom.score_changed = true;
        currentPlayer.score += 2;
        currentRoom.player.get(name).score += 1;
        io.to(currentRoom.name).emit('chat', { name, type: 'win' });
        newRound();
      }
    }
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
