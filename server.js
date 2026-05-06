const app = require('./src/app');
const config = require('./src/config/env');
const { testConnection } = require('./src/config/database');

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
