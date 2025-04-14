const { Server } = require('socket.io');
const { saveSocket } = require('./controller/notifyController');

function setupWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    saveSocket(socket);
  });
}

module.exports = { setupWebSocket };
