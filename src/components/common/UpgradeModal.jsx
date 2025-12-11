import React from "react";

export default function UpgradeModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg bg-[#0E1530] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-white">Upgrade Wallet</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">Close</button>
        </div>

        <p className="text-white/70 mt-3">
          Wallet upgrading is not active yet. When we enable it, you’ll pay a small one-time fee (example: $4.99)
          to unlock receiving payments, withdrawing funds, and full transaction history.
        </p>

        <div className="mt-4 bg-[#111428] p-4 rounded-xl border border-white/5">
          <ul className="text-white/80 space-y-2">
            <li>• Receive job completion payments</li>
            <li>• Withdraw to bank or crypto wallet</li>
            <li>• Full transaction history & export</li>
            <li>• Escrow & dispute protection</li>
          </ul>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20"
          >
            OK
          </button>

          <button
            onClick={() => alert("Upgrade flow will be implemented later.")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] text-black"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
