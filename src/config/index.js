require("dotenv").config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 7000,
  jwtSecret: process.env.JWT_SECRET || "dev_secret",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").map((o) => o.trim()),
  ingestToken: process.env.INGEST_TOKEN || "dev-ingest-token",
  maxLogsPerBatch: parseInt(process.env.MAX_LOGS_PER_BATCH, 10) || 500,
  retentionHours: parseInt(process.env.RETENTION_HOURS, 10) || 72,
};
