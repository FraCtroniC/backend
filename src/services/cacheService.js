const { redis, isEnabled } = require('../config/redis');

const DEFAULT_TTL = 300;

async function get(key) {
  if (!isEnabled()) return null;
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    console.error(`Cache GET error for key "${key}":`, err.message);
    return null;
  }
}

async function set(key, data, tags = [], ttl = DEFAULT_TTL) {
  if (!isEnabled()) return;
  try {
    const serialized = JSON.stringify(data);
    await redis.setex(key, ttl, serialized);
    if (tags.length > 0) {
      const pipeline = redis.pipeline();
      for (const tag of tags) {
        pipeline.sadd(`tag:${tag}`, key);
      }
      await pipeline.exec();
    }
  } catch (err) {
    console.error(`Cache SET error for key "${key}":`, err.message);
  }
}

async function del(key) {
  if (!isEnabled()) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.error(`Cache DEL error for key "${key}":`, err.message);
  }
}

async function invalidateTag(tag) {
  if (!isEnabled()) return;
  try {
    const tagKey = `tag:${tag}`;
    const keys = await redis.smembers(tagKey);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    await redis.del(tagKey);
  } catch (err) {
    console.error(`Cache invalidateTag error for tag "${tag}":`, err.message);
  }
}

async function invalidateTags(tags) {
  if (!tags || tags.length === 0) return;
  await Promise.all(tags.map(tag => invalidateTag(tag)));
}

async function remember(key, ttl, tags, fn) {
  if (!isEnabled()) {
    return fn();
  }
  try {
    const cached = await get(key);
    if (cached !== null) {
      return cached;
    }
  } catch {
    // continue to fn
  }
  const data = await fn();
  await set(key, data, tags, ttl);
  return data;
}

module.exports = {
  get,
  set,
  del,
  invalidateTag,
  invalidateTags,
  remember,
};
