const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const store = require("../models/store");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/", (req, res) => {
  const { category, search, page, limit } = req.query;
  const result = store.listProducts({
    category, search,
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
  });
  res.json(result);
});

router.get("/:id", (req, res) => {
  const p = store.getProductById(req.params.id);
  if (!p) return res.status(404).json({ error: "Product not found" });
  res.json(p);
});

router.post(
  "/",
  requireAuth, requireAdmin,
  [body("name").notEmpty(), body("price").isFloat({ min: 0 }), body("stock").isInt({ min: 0 })],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      const product = store.createProduct(req.body);
      res.status(201).json(product);
    } catch (err) { next(err); }
  }
);

router.patch("/:id", requireAuth, requireAdmin, (req, res, next) => {
  try {
    const product = store.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const updated = store.updateProduct(req.params.id, req.body);
    res.json(updated);
  } catch (err) { next(err); }
});

module.exports = router;
