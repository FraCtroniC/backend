const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { redis, isEnabled } = require('../config/redis');

function createLimiter(opts = {}) {
  return rateLimit({
    windowMs: opts.windowMs || 60 * 1000,
    max: opts.max || 100,
    message: opts.message || { message: 'Demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.' },
    standardHeaders: true,
    legacyHeaders: false,
    store: isEnabled()
      ? new RedisStore({ sendCommand: (...args) => redis.call(...args) })
      : undefined,
    ...opts,
  });
}

const minuteMsg = 'Por favor, espera un minuto antes de intentar de nuevo.';

module.exports = {
  loginLimiter: createLimiter({
    windowMs: 60 * 1000,
    max: 5,
    message: { message: `Has superado el límite de intentos de inicio de sesión. ${minuteMsg} Si olvidaste tu contraseña, usa la opción "¿Olvidaste tu contraseña?" en la pantalla de inicio.` },
  }),
  chatbotLimiter: createLimiter({
    windowMs: 60 * 1000,
    max: 10,
    message: { message: `Estás haciendo muchas consultas al asistente virtual. ${minuteMsg} Recuerda que puedes escribir tus dudas de forma clara y completa para evitar consultas repetidas.` },
  }),
  preRegLimiter: createLimiter({
    windowMs: 60 * 1000,
    max: 3,
    message: { message: `Has superado el límite de intentos de pre-registro. ${minuteMsg} Si tienes problemas, contacta con la administración de la universidad.` },
  }),
};
