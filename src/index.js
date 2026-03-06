const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config/app");
const { apiLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/files");
const shareRoutes = require("./routes/share");

const app = express();

app.use(helmet());
app.use(cors({ origin: config.allowedOrigins, credentials: true }));
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/share", shareRoutes);

app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.use(errorHandler);

app.listen(config.port, () => {});

module.exports = app;
