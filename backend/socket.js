const { Server } = require('socket.io');
const notifyController = require('./controller/notifyController');

function setupWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    notifyController.saveSocket(socket);
    
    // Handle disconnections
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      notifyController.removeSocket(socket.id);
    });
  });
}

module.exports = { setupWebSocket };