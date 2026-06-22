let io;

module.exports = {
  init: (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: '*', // Adjust for production if needed
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      console.warn('Socket.io is not initialized yet!');
      return null;
    }
    return io;
  }
};
