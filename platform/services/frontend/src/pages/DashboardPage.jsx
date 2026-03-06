import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useWallet } from "../hooks/useWallet";
import TransactionList from "../components/TransactionList";
import useAuthStore from "../store/authStore";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { walletQuery, txQuery, depositMutation, transferMutation } = useWallet();
  const [depositAmount, setDepositAmount] = useState("");
  const [transferForm, setTransferForm] = useState({ recipientEmail: "", amount: "", description: "" });
  const [activeModal, setActiveModal] = useState(null);
  const [error, setError] = useState("");

  if (walletQuery.isLoading) return <div className="p-8 text-gray-500">Loading…</div>;

  const wallet = walletQuery.data;
  const transactions = txQuery.data || [];

  const chartData = [...transactions].reverse().map((tx, i) => ({ index: i, amount: tx.amount }));

  async function handleDeposit(e) {
    e.preventDefault();
    setError("");
    try {
      await depositMutation.mutateAsync(parseFloat(depositAmount));
      setDepositAmount("");
      setActiveModal(null);
    } catch (err) {
      setError(err.response?.data?.error || "Deposit failed");
    }
  }

  async function handleTransfer(e) {
    e.preventDefault();
    setError("");
    try {
      await transferMutation.mutateAsync(transferForm);
      setTransferForm({ recipientEmail: "", amount: "", description: "" });
      setActiveModal(null);
    } catch (err) {
      setError(err.response?.data?.error || "Transfer failed");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-sm opacity-80">Available Balance</p>
        <p className="text-4xl font-bold mt-1">${wallet.balance.toFixed(2)}</p>
        <p className="text-sm opacity-70 mt-1">{wallet.currency}</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => { setActiveModal("deposit"); setError(""); }} className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-lg font-medium">
            + Deposit
          </button>
          <button onClick={() => { setActiveModal("transfer"); setError(""); }} className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-lg font-medium">
            ↗ Transfer
          </button>
        </div>
      </div>

      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Transaction Activity</h2>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <XAxis dataKey="index" hide />
              <YAxis hide />
              <Tooltip formatter={(v) => [`$${v}`, "Amount"]} />
              <Area type="monotone" dataKey="amount" stroke="#16a34a" fill="#dcfce7" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Transactions</h2>
        <TransactionList transactions={transactions.slice(0, 10)} userId={user?.id} />
      </div>

      {activeModal === "deposit" && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Deposit Funds</h2>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <form onSubmit={handleDeposit} className="space-y-3">
              <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Amount (USD)" min="1" max="10000" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setActiveModal(null)} className="text-sm text-gray-500 px-4 py-2">Cancel</button>
                <button type="submit" className="bg-brand-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-700">Deposit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "transfer" && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Send Money</h2>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <form onSubmit={handleTransfer} className="space-y-3">
              <input value={transferForm.recipientEmail} onChange={(e) => setTransferForm({ ...transferForm, recipientEmail: e.target.value })} placeholder="Recipient email" type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} placeholder="Amount (USD)" type="number" min="0.01" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input value={transferForm.description} onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })} placeholder="Description (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setActiveModal(null)} className="text-sm text-gray-500 px-4 py-2">Cancel</button>
                <button type="submit" className="bg-brand-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-700">Send</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
