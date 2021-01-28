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
  res.render('index', { roomOwner });
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

    if (room[name].is_clock_button_disabled) {
      io.to(socket.id).emit('clock', clock_beggining_time[name]);
    }
  });

  socket.on('join', ({ name, sdp }) => {
    console.log('join', socket.id, name, sdp);
    currentRoom = name;
    socket.join(name);
    io.to(room[name].owner).emit('sdp from', { sdp, addr: socket.id });

    if (room[name].is_clock_button_disabled) {
      socket.emit('clock', room[name].clock_beggining_time);
    }
  });

  socket.on('chat', msg => {
    io.to(currentRoom).emit('chat', msg);
  });

  socket.on('clock', beginning_time => {
    io.to(currentRoom).emit('clock', beginning_time);
    room[currentRoom].clock_beggining_time = beginning_time;
    room[currentRoom].is_clock_button_disabled = true;
  });

  socket.on('clock_end', () => {
    room[currentRoom].is_clock_button_disabled = false;
    room[currentRoom].clock_beggining_time = 0;
  });

  // WebRTC
  socket.on('sdp', sdp => {
    console.log('sdp', socket.id, sdp);
    io.to(room[currentRoom].owner).emit('sdp from', { sdp, addr: socket.id });
  });
  socket.on('candidate', candidate => {
    console.log('candidate', socket.id, candidate);
    io.to(room[currentRoom].owner).emit('candidate from', { candidate, addr: socket.id });
  });

  socket.on('sdp to', ({ sdp, addr }) => {
    console.log('sdp to', socket.id, sdp, addr);
    io.to(addr).emit('sdp', sdp);
  });
  socket.on('candidate to', ({ candidate, addr }) => {
    console.log('candidate to', socket.id, candidate, addr);
    io.to(addr).emit('candidate', candidate);
  });

});

server.listen(process.env.PORT || 8000);
