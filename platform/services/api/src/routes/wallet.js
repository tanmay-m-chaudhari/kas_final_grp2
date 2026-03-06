const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const store = require("../models/store");
const config = require("../config");
const requireAuth = require("../middleware/auth");

router.use(requireAuth);

router.get("/", (req, res) => {
  const wallet = store.getWallet(req.user.id);
  if (!wallet) return res.status(404).json({ error: "Wallet not found" });
  res.json(wallet);
});

router.post(
  "/deposit",
  [body("amount").isFloat({ min: 1, max: 10000 })],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      const tx = store.depositToWallet(req.user.id, parseFloat(req.body.amount));
      res.status(201).json(tx);
    } catch (err) { next(err); }
  }
);

router.post(
  "/transfer",
  [body("recipientEmail").isEmail(), body("amount").isFloat({ min: 0.01 }), body("description").optional().isString()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      if (req.user.kycStatus !== "verified") return res.status(403).json({ error: "KYC verification required to transfer" });

      const recipient = store.getUserByEmail(req.body.recipientEmail);
      if (!recipient) return res.status(404).json({ error: "Recipient not found" });
      if (recipient.id === req.user.id) return res.status(400).json({ error: "Cannot transfer to yourself" });

      const amount = parseFloat(req.body.amount);
      const fee = parseFloat((amount * config.transactionFeePercent / 100).toFixed(2));
      const wallet = store.getWallet(req.user.id);
      if (wallet.balance < amount + fee) return res.status(400).json({ error: "Insufficient balance" });

      const tx = store.recordTransaction(req.user.id, recipient.id, amount, fee, "transfer", req.body.description || "Transfer");
      res.status(201).json(tx);
    } catch (err) { next(err); }
  }
);

router.get("/transactions", (req, res) => {
  const txs = store.getTransactionsByUser(req.user.id);
  res.json(txs);
});

module.exports = router;
