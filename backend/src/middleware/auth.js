const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");
const { getUserById } = require("../models/store");

function requireAuth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(header.slice(7), jwtSecret);
    const user = getUserById(payload.sub);
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Token invalid or expired" });
  }
}

module.exports = requireAuth;
