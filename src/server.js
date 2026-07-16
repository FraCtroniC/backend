const path = require('path');
const http = require('http');
const app = require(path.join(__dirname, 'app'));
const socket = require(path.join(__dirname, 'socket'));
const config = require(path.join(__dirname, 'config', 'env'));
const { testConnection } = require(path.join(__dirname, 'config', 'database'));
const { connectRedis } = require(path.join(__dirname, 'config', 'redis'));

const port = config.port || 3000;

async function start() {
  const ok = await testConnection();
  await connectRedis();
  if (!ok) {
    console.error('Database connection failed. Exiting.');
    process.exit(1);
  }

  const server = http.createServer(app);
  
  // Set up Socket.io using the custom module
  const io = socket.init(server);

  io.on('connection', (clientSocket) => {
    // When a user connects, they can send their user ID to join a specific room
    const userId = clientSocket.handshake.query.userId;
    if (userId) {
      clientSocket.join(`user_${userId}`);
      console.log(`Socket connected: ${clientSocket.id} joined room user_${userId}`);
    }

    clientSocket.on('disconnect', () => {
      console.log(`Socket disconnected: ${clientSocket.id}`);
    });
  });

  server.listen(port, () => {
    console.log(`🚀 Server and WebSockets listening on port ${port}`);
  });
}

start();
