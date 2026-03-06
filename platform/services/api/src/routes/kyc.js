const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const store = require("../models/store");
const requireAuth = require("../middleware/auth");

router.use(requireAuth);

router.post(
  "/submit",
  [
    body("dateOfBirth").isDate(),
    body("nationalId").notEmpty(),
    body("country").isLength({ min: 2, max: 2 }),
    body("address").notEmpty(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      if (req.user.kycStatus === "verified") return res.status(400).json({ error: "Already verified" });
      const submission = store.submitKyc(req.user.id, req.body);
      res.status(201).json(submission);
    } catch (err) { next(err); }
  }
);

module.exports = router;
