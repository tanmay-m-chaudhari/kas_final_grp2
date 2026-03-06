const config = require("../config");

function ingestAuth(req, res, next) {
  const token = req.headers["x-ingest-token"];
  if (!token || token !== config.ingestToken) {
    return res.status(401).json({ error: "Invalid or missing ingest token" });
  }
  next();
}

module.exports = ingestAuth;
