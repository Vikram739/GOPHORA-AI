import React from "react";
import { FiMaximize2 } from "react-icons/fi";

export default function WalletHeader({ balance = 0, onOpenUpgrade, isPaidMode = false }) {
  return (
    <div className="bg-white/6 backdrop-blur-sm border border-white/8 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-[#C5A3FF]/20 to-[#9E7BFF]/10 flex items-center justify-center">
          <div className="text-sm sm:text-base text-white/90 font-medium">$</div>
        </div>

        <div>
          <div className="text-sm text-white/60">Total Balance</div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            ${Number(balance).toFixed(2)}
          </div>
          <div className="text-xs text-white/60 mt-1">Available to withdraw: ${Number(balance).toFixed(2)}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <button
          disabled={!isPaidMode}
          className={`px-4 py-2 rounded-2xl font-medium transition ${
            isPaidMode
              ? "bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] text-black"
              : "bg-white/6 text-white/60 cursor-not-allowed"
          }`}
        >
          Deposit
        </button>

        <button
          disabled={!isPaidMode}
          className={`px-4 py-2 rounded-2xl font-medium transition ${
            isPaidMode
              ? "bg-white text-black"
              : "bg-white/6 text-white/60 cursor-not-allowed"
          }`}
        >
          Withdraw
        </button>

        <button
          onClick={onOpenUpgrade}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/10 bg-white/4 text-white/90 hover:bg-white/6 transition"
          title="Upgrade wallet"
        >
          <FiMaximize2 />
          <span className="hidden sm:inline">Upgrade Wallet</span>
          <span className="sm:hidden">Upgrade</span>
        </button>
      </div>
    </div>
  );
}
