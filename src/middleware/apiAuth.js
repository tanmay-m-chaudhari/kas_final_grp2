const jwt = require("jsonwebtoken");
const config = require("../config");

const adminTokens = new Map();

function issueAdminToken(username) {
  return jwt.sign({ sub: username, role: "admin" }, config.jwtSecret, { expiresIn: "24h" });
}

function requireApiAuth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.principal = jwt.verify(header.slice(7), config.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { requireApiAuth, issueAdminToken };
