import { format } from "date-fns";
import clsx from "clsx";

export default function TransactionList({ transactions, userId }) {
  if (!transactions?.length) return <p className="text-gray-500 text-sm">No transactions yet.</p>;

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const isIncoming = tx.recipientId === userId && tx.type !== "deposit";
        const isDeposit = tx.type === "deposit";
        return (
          <div key={tx.id} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-800">{tx.description}</p>
              <p className="text-xs text-gray-400 mt-0.5">{format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}</p>
            </div>
            <div className="text-right">
              <p className={clsx("font-semibold text-sm", isIncoming || isDeposit ? "text-green-600" : "text-red-500")}>
                {isIncoming || isDeposit ? "+" : "-"}${tx.amount.toFixed(2)}
              </p>
              {tx.fee > 0 && <p className="text-xs text-gray-400">fee ${tx.fee.toFixed(2)}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
