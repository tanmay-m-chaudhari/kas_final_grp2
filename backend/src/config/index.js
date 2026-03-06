require("dotenv").config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 4000,
  jwtSecret: process.env.JWT_SECRET || "dev_secret",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};
