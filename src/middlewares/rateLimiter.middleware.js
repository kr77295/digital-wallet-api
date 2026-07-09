const rateLimit = require('express-rate-limit');


const keyGenerator = (req) => (req.user && req.user.id ? req.user.id : req.ip);

const generalLimiter = rateLimit({
  windowMs: (Number(process.env.GENERAL_RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: Number(process.env.GENERAL_RATE_LIMIT_MAX) || 100,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again later.',
  },
});

const transactionLimiter = rateLimit({
  windowMs: (Number(process.env.TXN_RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: Number(process.env.TXN_RATE_LIMIT_MAX) || 20,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many transaction requests. Please try again later.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth attempts. Please try again later.',
  },
});

module.exports = { generalLimiter, transactionLimiter, authLimiter };
