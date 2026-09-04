import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { statusCode: 429, message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.' },
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { statusCode: 429, message: 'Demasiadas peticiones. Intenta de nuevo más tarde.' },
  },
});

export const crearUsuarioLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { statusCode: 429, message: 'Límite de creación de usuarios alcanzado. Intenta de nuevo en 1 hora.' },
  },
});
