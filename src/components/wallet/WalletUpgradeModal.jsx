import React from "react";
import { FiX } from "react-icons/fi";

export default function WalletUpgradeModal({ open = false, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl bg-[#0E1530] border border-white/8 rounded-2xl p-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Upgrade Wallet</h3>
            <p className="text-sm text-white/70 mt-1">
              Unlock the full wallet: receive payments, withdraw to bank/crypto, and access transaction history.
            </p>
          </div>

          <button onClick={onClose} className="text-white/60 hover:text-white">
            <FiX size={20} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white/4 rounded-xl">
            <div className="text-sm text-white/70">One-time activation</div>
            <div className="text-2xl font-bold text-white mt-2">$4.99</div>
            <div className="text-xs text-white/60 mt-2">Unlock receiving payments and withdrawals.</div>
          </div>

          <div className="p-4 bg-white/4 rounded-xl">
            <div className="text-sm text-white/70">What you get</div>
            <ul className="mt-2 text-sm text-white/80 space-y-2">
              <li>• Receive mission payments</li>
              <li>• Withdraw funds (bank/crypto)</li>
              <li>• Full transaction export</li>
              <li>• Escrow & dispute support</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button onClick={() => alert("Upgrade flow coming soon")} className="w-full sm:w-auto px-5 py-2 rounded-2xl bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] text-black font-semibold">
            Upgrade Wallet
          </button>

          <button onClick={onClose} className="w-full sm:w-auto px-5 py-2 rounded-2xl bg-white/6 text-white">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
