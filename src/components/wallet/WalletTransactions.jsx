import React from "react";
import { FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";

export default function WalletTransactions({ transactions = [] }) {
  if (!transactions.length) {
    return (
      <div className="bg-white/6 border border-white/8 rounded-2xl p-6 text-center text-white/60">
        <div className="text-lg font-medium mb-1">No transactions yet</div>
        <div className="text-sm">When you complete missions and receive payments they will appear here.</div>
      </div>
    );
  }

  return (
    <div className="bg-white/6 border border-white/8 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 hidden sm:flex text-xs text-white/60 uppercase tracking-wide">
        <div className="w-1/3">Description</div>
        <div className="w-1/6">Type</div>
        <div className="w-1/6">Amount</div>
        <div className="w-1/6">Date</div>
        <div className="w-1/6 text-right">Status</div>
      </div>

      <div className="divide-y divide-white/6">
        {transactions.map((t) => (
          <div key={t.id} className="flex flex-col sm:flex-row items-start sm:items-center px-4 py-4 sm:py-3 gap-2 sm:gap-0">
            <div className="w-full sm:w-1/3">
              <div className="font-medium text-white">{t.description}</div>
              <div className="text-xs text-white/60">{t.meta || ""}</div>
            </div>

            <div className="w-full sm:w-1/6 text-sm text-white/70">{t.type}</div>

            <div className="w-full sm:w-1/6 text-white font-semibold flex items-center gap-2">
              {t.amount >= 0 ? <FiArrowUpRight className="text-green-400" /> : <FiArrowDownLeft className="text-red-400" />}
              <span>{t.amount >= 0 ? `+$${t.amount.toFixed(2)}` : `-$${Math.abs(t.amount).toFixed(2)}`}</span>
            </div>

            <div className="w-full sm:w-1/6 text-sm text-white/60">{t.date}</div>

            <div className="w-full sm:w-1/6 text-right">
              <span className={`px-3 py-1 rounded-full text-xs ${t.status === "completed" ? "bg-green-500/20 text-green-300" : "bg-yellow-400/10 text-yellow-200"}`}>
                {t.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
