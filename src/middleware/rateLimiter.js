const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter para comentarios
 * Máximo 10 peticiones por minuto por IP
 */
const comentariosLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // máximo 10 peticiones
  message: {
    ok: false,
    error: 'Demasiadas peticiones desde esta IP. Intenta nuevamente en 1 minuto.',
    codigo: 429
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Rate Limiter general para API
 * Máximo 100 peticiones por 15 minutos por IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones
  message: {
    ok: false,
    error: 'Demasiadas peticiones desde esta IP. Intenta nuevamente más tarde.',
    codigo: 429
  },
});

module.exports = {
  comentariosLimiter,
  apiLimiter
};
