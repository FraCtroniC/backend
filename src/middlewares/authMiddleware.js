const { extractBearerToken, verifyAccessToken } = require('../services/jwtService');

function requireAuth(req, res, next) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ message: 'Token Bearer requerido' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = payload;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { requireAuth };
