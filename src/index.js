const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const config = require("./config");
const ingestRoutes = require("./routes/ingest");
const queryRoutes = require("./routes/query");
const adminRoutes = require("./routes/admin");
const { startRetentionJob } = require("./services/retentionJob");

const app = express();

app.use(helmet());
app.use(cors({ origin: config.allowedOrigins }));
app.use(morgan("combined"));
app.use(express.json({ limit: "2mb" }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 1000 }));

app.use("/ingest", ingestRoutes);
app.use("/query", queryRoutes);
app.use("/admin", adminRoutes);

app.get("/health", (req, res) => res.json({ status: "ok", service: "logstream" }));

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

startRetentionJob();
app.listen(config.port);

module.exports = app;
