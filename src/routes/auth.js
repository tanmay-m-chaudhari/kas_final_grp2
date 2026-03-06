const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerUser, findUserByUsername } = require("../middleware/auth");
const config = require("../config/app");
const { success, fail } = require("../utils/responseHelper");

router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return fail(res, "Username and password are required");
    if (password.length < 8) return fail(res, "Password must be at least 8 characters");
    if (findUserByUsername(username)) return fail(res, "Username already taken", 409);

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = registerUser(username, hashedPassword);
    return success(res, { id, username }, 201);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return fail(res, "Username and password are required");

    const user = findUserByUsername(username);
    if (!user) return fail(res, "Invalid credentials", 401);

    const valid = await bcrypt.compare(password, user.hashedPassword);
    if (!valid) return fail(res, "Invalid credentials", 401);

    const token = jwt.sign({ sub: user.id, username: user.username }, config.jwtSecret, {
      expiresIn: config.tokenExpiry,
    });

    return success(res, { token, expiresIn: config.tokenExpiry });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
