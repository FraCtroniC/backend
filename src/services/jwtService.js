const jwt = require('jsonwebtoken');
const config = require('../config/env');

const DEFAULT_EXPIRES_IN = config.jwtExpiresIn || '1h';

function signAccessToken(payload, options = {}) {
  const expiresIn = options.expiresIn || DEFAULT_EXPIRES_IN;
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  extractBearerToken,
};
