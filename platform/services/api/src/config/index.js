require("dotenv").config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 6000,
  jwtSecret: process.env.JWT_SECRET || "dev_secret",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5174",
  transactionFeePercent: parseFloat(process.env.TRANSACTION_FEE_PERCENT) || 1.5,
};
