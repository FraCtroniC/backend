const Redis = require('ioredis');
const config = require('./env');

const REDIS_ENABLED = config.redis.enabled;

let redis = null;
let loggedFailOnce = false;

if (REDIS_ENABLED) {
  const opts = config.redis.url
    ? { redisOptions: { lazyConnect: true, retryStrategy(t) { return t > 3 ? null : Math.min(t * 200, 1000); }, connectTimeout: 5000 } }
    : {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        db: config.redis.db,
        retryStrategy(times) {
          if (times > 3) return null;
          return Math.min(times * 200, 1000);
        },
        maxRetriesPerRequest: null,
        lazyConnect: true,
        enableReadyCheck: false,
        connectTimeout: 3000,
      };

  redis = config.redis.url
    ? new Redis(config.redis.url, opts.redisOptions)
    : new Redis(opts);

  redis.on('error', () => {});

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });
}

async function connectRedis() {
  if (!REDIS_ENABLED || !redis) {
    console.log('Redis is disabled (REDIS_ENABLED=false). Cache will be bypassed.');
    return false;
  }
  try {
    await redis.connect();
    return true;
  } catch (err) {
    if (!loggedFailOnce) {
      console.warn(`Redis not available (${err.message}). Server will continue without cache.`);
      loggedFailOnce = true;
    }
    return false;
  }
}

module.exports = {
  redis,
  connectRedis,
  isEnabled: () => REDIS_ENABLED && redis?.status === 'ready',
};
