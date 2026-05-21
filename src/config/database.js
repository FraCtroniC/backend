const { Sequelize } = require('sequelize');
const config = require('./env');

let sequelize;

function createTestSequelizeInstance() {
  return new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
}

function buildLocalUri() {
  const c = config.db.local;
  return `postgres://${encodeURIComponent(c.username)}:${encodeURIComponent(c.password)}@${c.host}:${c.port}/${c.database}`;
}

function createSequelizeInstance() {
  try {
    if (config.env === 'test') {
      return createTestSequelizeInstance();
    }

    if (config.dbEnv === 'remote') {
      // Remote: expect a single connection URI
      const uri = config.db.remoteUri;
      if (!uri) throw new Error('DB_URI_REMOTE is required for remote DB_ENV');
      return new Sequelize(uri, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        logging: false,
      });
    }

    // Local by default
    const localUri = buildLocalUri();
    // Detect if host likely requires SSL (neon/supabase) and enable it
    const needSsl = config.db.local && String(config.db.local.host || '').includes('neon');
    return new Sequelize(localUri, {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: needSsl
        ? {
            ssl: { require: true, rejectUnauthorized: false },
          }
        : {},
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      logging: false,
    });
  } catch (err) {
    console.error('Error creating Sequelize instance:', err.message);
    throw err;
  }
}

sequelize = createSequelizeInstance();

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    return false;
  }
}

module.exports = {
  sequelize,
  Sequelize,
  testConnection,
};
