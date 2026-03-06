const router = require("express").Router();
const store = require("../models/store");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

router.get("/", (req, res) => {
  const cart = store.getCart(req.user.id);
  const enriched = cart.items.map((item) => {
    const product = store.getProductById(item.productId);
    return { ...item, product };
  });
  res.json({ items: enriched });
});

router.put("/", (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: "items must be an array" });
    const validated = [];
    for (const item of items) {
      const product = store.getProductById(item.productId);
      if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });
      if (item.quantity < 1) return res.status(400).json({ error: "Quantity must be at least 1" });
      if (item.quantity > product.stock) return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      validated.push({ productId: item.productId, quantity: item.quantity, price: product.price });
    }
    const cart = store.setCart(req.user.id, validated);
    res.json(cart);
  } catch (err) { next(err); }
});

router.delete("/", (req, res) => {
  store.setCart(req.user.id, []);
  res.status(204).end();
});

module.exports = router;
