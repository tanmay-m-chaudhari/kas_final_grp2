const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const store = require("../models/store");
const config = require("../config");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

router.post(
  "/register",
  [body("username").isLength({ min: 3 }), body("password").isLength({ min: 8 })],
  validate,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      if (store.getUserByUsername(username)) {
        return res.status(409).json({ error: "Username taken" });
      }
      const hash = await bcrypt.hash(password, 12);
      const user = store.createUser(username, hash);
      res.status(201).json({ id: user.id, username: user.username });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/login",
  [body("username").notEmpty(), body("password").notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = store.getUserByUsername(username);
      if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: "12h" });
      res.json({ token, user: { id: user.id, username: user.username } });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
