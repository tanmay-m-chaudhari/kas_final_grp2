const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const config = require("./config");
const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallet");
const kycRoutes = require("./routes/kyc");

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(morgan("combined"));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/kyc", kycRoutes);

app.get("/health", (req, res) => res.json({ status: "ok", service: "novapay-api" }));

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(config.port);

module.exports = app;
