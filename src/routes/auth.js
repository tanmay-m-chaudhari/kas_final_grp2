const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const store = require("../models/store");
const config = require("../config");

const RegisterSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post("/register", async (req, res, next) => {
  const parse = RegisterSchema.safeParse(req.body);
  if (!parse.success) return res.status(422).json({ errors: parse.error.flatten() });
  try {
    if (store.getUserByEmail(parse.data.email)) return res.status(409).json({ error: "Email already registered" });
    const hash = await bcrypt.hash(parse.data.password, 12);
    const user = store.createUser(parse.data.email, hash);
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) { next(err); }
});

router.post("/login", async (req, res, next) => {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) return res.status(422).json({ errors: parse.error.flatten() });
  try {
    const user = store.getUserByEmail(parse.data.email);
    if (!user || !(await bcrypt.compare(parse.data.password, user.hashedPassword))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: "12h" });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) { next(err); }
});

module.exports = router;
