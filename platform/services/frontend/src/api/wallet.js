import client from "./client";

export const fetchWallet = () => client.get("/wallet").then((r) => r.data);
export const fetchTransactions = () => client.get("/wallet/transactions").then((r) => r.data);
export const deposit = (amount) => client.post("/wallet/deposit", { amount }).then((r) => r.data);
export const transfer = (data) => client.post("/wallet/transfer", data).then((r) => r.data);
export const submitKyc = (data) => client.post("/kyc/submit", data).then((r) => r.data);
