const jwt = require("jsonwebtoken");
const config = require("../config/app");

const users = new Map();

function registerUser(username, hashedPassword) {
  const id = require("uuid").v4();
  users.set(id, { id, username, hashedPassword, files: [] });
  return id;
}

function findUserByUsername(username) {
  for (const user of users.values()) {
    if (user.username === username) return user;
  }
  return null;
}

function findUserById(id) {
  return users.get(id) || null;
}

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = findUserById(payload.sub);
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { authenticate, registerUser, findUserByUsername, findUserById };
