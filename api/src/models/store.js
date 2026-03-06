const { v4: uuidv4 } = require("uuid");

const users = new Map();
const products = new Map();
const carts = new Map();
const orders = new Map();

function createUser(email, hashedPassword, role = "customer") {
  const id = uuidv4();
  users.set(id, { id, email, hashedPassword, role, addresses: [], createdAt: new Date().toISOString() });
  return users.get(id);
}

function getUserByEmail(email) {
  return [...users.values()].find((u) => u.email === email) || null;
}

function getUserById(id) {
  return users.get(id) || null;
}

function createProduct(data) {
  const id = uuidv4();
  const product = {
    id,
    name: data.name,
    description: data.description || "",
    price: data.price,
    stock: data.stock || 0,
    category: data.category || "uncategorized",
    images: data.images || [],
    tags: data.tags || [],
    createdAt: new Date().toISOString(),
  };
  products.set(id, product);
  return product;
}

function listProducts({ category, search, page = 1, limit = 20 } = {}) {
  let items = [...products.values()];
  if (category) items = items.filter((p) => p.category === category);
  if (search) {
    const q = search.toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)));
  }
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total: items.length, page };
}

function getProductById(id) {
  return products.get(id) || null;
}

function updateProduct(id, updates) {
  const p = products.get(id);
  if (!p) return null;
  Object.assign(p, updates);
  return p;
}

function getCart(userId) {
  if (!carts.has(userId)) carts.set(userId, { userId, items: [] });
  return carts.get(userId);
}

function setCart(userId, items) {
  carts.set(userId, { userId, items });
  return carts.get(userId);
}

function createOrder(userId, items, total, paymentIntentId) {
  const id = uuidv4();
  const order = {
    id, userId, items, total, paymentIntentId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  orders.set(id, order);
  return order;
}

function getOrdersByUser(userId) {
  return [...orders.values()].filter((o) => o.userId === userId);
}

function getOrderById(id) {
  return orders.get(id) || null;
}

function updateOrderStatus(id, status) {
  const o = orders.get(id);
  if (!o) return null;
  o.status = status;
  return o;
}

module.exports = {
  createUser, getUserByEmail, getUserById,
  createProduct, listProducts, getProductById, updateProduct,
  getCart, setCart,
  createOrder, getOrdersByUser, getOrderById, updateOrderStatus,
};
