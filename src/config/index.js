require("dotenv").config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 8000,
  jwtSecret: process.env.JWT_SECRET || "dev_secret",
  checkIntervalSeconds: parseInt(process.env.CHECK_INTERVAL_SECONDS, 10) || 60,
  alertCooldownMinutes: parseInt(process.env.ALERT_COOLDOWN_MINUTES, 10) || 15,
};
