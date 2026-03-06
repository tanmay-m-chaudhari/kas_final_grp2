const router = require("express").Router();
const stripe = require("stripe");
const store = require("../models/store");
const config = require("../config");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

router.post("/checkout", async (req, res, next) => {
  try {
    const cart = store.getCart(req.user.id);
    if (!cart.items.length) return res.status(400).json({ error: "Cart is empty" });

    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totalCents = Math.round(total * 100);

    let paymentIntentId = `mock_${Date.now()}`;
    if (config.stripeKey) {
      const stripeClient = stripe(config.stripeKey);
      const intent = await stripeClient.paymentIntents.create({
        amount: totalCents,
        currency: "usd",
        metadata: { userId: req.user.id },
      });
      paymentIntentId = intent.id;
    }

    const order = store.createOrder(req.user.id, cart.items, total, paymentIntentId);
    store.setCart(req.user.id, []);
    res.status(201).json(order);
  } catch (err) { next(err); }
});

router.get("/", (req, res) => {
  res.json(store.getOrdersByUser(req.user.id));
});

router.get("/:id", (req, res) => {
  const order = store.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  res.json(order);
});

module.exports = router;
