const path = require('path');
const app = require(path.join(__dirname, 'app'));
const config = require(path.join(__dirname, 'config', 'env'));
const { testConnection } = require(path.join(__dirname, 'config', 'database'));

const port = config.port || 3000;

async function start() {
  const ok = await testConnection();
  if (!ok) {
    console.error('Database connection failed. Exiting.');
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
  });
}

start();
