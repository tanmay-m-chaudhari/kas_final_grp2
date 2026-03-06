const { v4: uuidv4 } = require("uuid");

const users = new Map();
const wallets = new Map();
const transactions = new Map();
const kyc = new Map();

function createUser(email, hashedPassword, fullName) {
  const id = uuidv4();
  const user = { id, email, hashedPassword, fullName, kycStatus: "pending", createdAt: new Date().toISOString() };
  users.set(id, user);
  const wallet = { userId: id, balance: 0, currency: "USD", transactions: [] };
  wallets.set(id, wallet);
  return user;
}

function getUserByEmail(email) {
  return [...users.values()].find((u) => u.email === email) || null;
}

function getUserById(id) {
  return users.get(id) || null;
}

function getWallet(userId) {
  return wallets.get(userId) || null;
}

function recordTransaction(senderId, recipientId, amount, fee, type, description) {
  const id = uuidv4();
  const tx = {
    id, senderId, recipientId, amount, fee, type, description,
    status: "completed",
    createdAt: new Date().toISOString(),
  };
  transactions.set(id, tx);

  const senderWallet = wallets.get(senderId);
  if (senderWallet && type !== "deposit") senderWallet.balance -= amount + fee;

  const recipientWallet = wallets.get(recipientId);
  if (recipientWallet) recipientWallet.balance += amount;

  return tx;
}

function depositToWallet(userId, amount) {
  const wallet = wallets.get(userId);
  if (!wallet) return null;
  wallet.balance += amount;
  return recordTransaction(userId, userId, amount, 0, "deposit", "Wallet top-up");
}

function getTransactionsByUser(userId) {
  return [...transactions.values()].filter(
    (t) => t.senderId === userId || t.recipientId === userId
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function submitKyc(userId, data) {
  kyc.set(userId, { userId, ...data, submittedAt: new Date().toISOString(), status: "under_review" });
  const user = users.get(userId);
  if (user) user.kycStatus = "under_review";
  return kyc.get(userId);
}

module.exports = {
  createUser, getUserByEmail, getUserById,
  getWallet, recordTransaction, depositToWallet, getTransactionsByUser,
  submitKyc,
};
