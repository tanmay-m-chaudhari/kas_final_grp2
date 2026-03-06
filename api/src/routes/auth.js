const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const store = require("../models/store");
const config = require("../config");

router.post(
  "/register",
  [body("email").isEmail(), body("password").isLength({ min: 8 })],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      if (store.getUserByEmail(req.body.email)) return res.status(409).json({ error: "Email already registered" });
      const hash = await bcrypt.hash(req.body.password, 12);
      const user = store.createUser(req.body.email, hash);
      res.status(201).json({ id: user.id, email: user.email, role: user.role });
    } catch (err) { next(err); }
  }
);

router.post("/login", [body("email").isEmail(), body("password").notEmpty()], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  try {
    const user = store.getUserByEmail(req.body.email);
    if (!user || !(await bcrypt.compare(req.body.password, user.hashedPassword))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: "8h" });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) { next(err); }
});

module.exports = router;
