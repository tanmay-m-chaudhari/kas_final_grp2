const rateLimit = require("express-rate-limit");
const config = require("../config/app");

const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: "Upload limit reached for this hour." },
});

module.exports = { apiLimiter, uploadLimiter };
