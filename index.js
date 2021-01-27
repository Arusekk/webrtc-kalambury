const http = require('http');
const express = require('express');
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket(server);


app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('./static'));

const roomOwner = {};
const currentRoom = {};
var is_clock_button_disabled = {};
var clock_beggining_time = {};

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

  socket.on('room', name => {
    console.log('room', socket.id, name);
    currentRoom[socket.id] = name;
    socket.join(name);
    roomOwner[name] = socket.id;
    socket.on('disconnect', () => delete roomOwner[name]);

    if (is_clock_button_disabled[name]) {
      io.to(socket.id).emit('clock', clock_beggining_time[name]);
    }
  });

  socket.on('join', ({ name, sdp }) => {
    console.log('join', socket.id, name, sdp);
    currentRoom[socket.id] = name;
    socket.join(name);
    io.to(roomOwner[name]).emit('sdp from', { sdp, addr: socket.id });

    if (is_clock_button_disabled[name]) {
      io.to(socket.id).emit('clock', clock_beggining_time[name]);
    }
  });

  socket.on('disconnect', () => {
    delete currentRoom[socket.id];
  });

  socket.on('chat', msg => {
    io.to(currentRoom[socket.id]).emit('chat', msg);
  });

  socket.on('clock', beginning_time => {
    io.to(currentRoom[socket.id]).emit('clock', beginning_time);
    clock_beggining_time[currentRoom[socket.id]] = beginning_time;
    is_clock_button_disabled[currentRoom[socket.id]] = true;
  });

  socket.on('clock_end', () => {
    is_clock_button_disabled[currentRoom[socket.id]] = false;
    clock_beggining_time[currentRoom[socket.id]] = 0;
  });
  // WebRTC
  socket.on('sdp', sdp => {
    console.log('sdp', socket.id, sdp);
    io.to(roomOwner[currentRoom[socket.id]]).emit('sdp from', { sdp, addr: socket.id });
  });
  socket.on('candidate', candidate => {
    console.log('candidate', socket.id, candidate);
    io.to(roomOwner[currentRoom[socket.id]]).emit('candidate from', { candidate, addr: socket.id });
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
