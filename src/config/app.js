require("dotenv").config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtSecret: process.env.JWT_SECRET || "changeme_in_production",
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 100,
  uploadDir: process.env.UPLOAD_DIR || "./uploads",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").map((o) => o.trim()),
  tokenExpiry: process.env.TOKEN_EXPIRY || "24h",
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
};
