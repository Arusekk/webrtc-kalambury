const http = require('http');
const express = require('express');
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.use(express.static('./static'));

app.get('/', (req, res) => {
  res.end('works');
});

server.listen(process.env.PORT || 8000);
