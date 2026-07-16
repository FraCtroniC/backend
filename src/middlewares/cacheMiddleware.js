const cacheService = require('../services/cacheService');

function cacheResponse(ttl = 300, ...tags) {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    if (req.query.refresh === 'true') {
      return next();
    }

    const key = `${req.originalUrl}`;

    try {
      const cached = await cacheService.get(key);
      if (cached !== null) {
        return res.json(cached);
      }
    } catch {
      return next();
    }

    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      await cacheService.set(key, body, tags, ttl);
      originalJson(body);
    };

    next();
  };
}

module.exports = { cacheResponse };
