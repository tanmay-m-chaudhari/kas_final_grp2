require("dotenv").config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  jwtSecret: process.env.JWT_SECRET || "dev_secret",
  stripeKey: process.env.STRIPE_SECRET_KEY || "",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
};
