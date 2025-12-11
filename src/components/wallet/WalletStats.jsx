import React from "react";

function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-white/4 border border-white/6 rounded-2xl p-4">
      <div className="text-sm text-white/70">{title}</div>
      <div className="text-lg sm:text-2xl font-semibold text-white mt-1">{value}</div>
      {subtitle && <div className="text-xs text-white/50 mt-1">{subtitle}</div>}
    </div>
  );
}

export default function WalletStats({ stats = {} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <StatCard title="Total Earned" value={`$${(stats.totalEarned || 0).toFixed(2)}`} subtitle="All-time" />
      <StatCard title="Available" value={`$${(stats.available || 0).toFixed(2)}`} subtitle="Withdrawable" />
      <StatCard title="Pending" value={`$${(stats.pending || 0).toFixed(2)}`} subtitle="In escrow" />
      <StatCard title="Fees Paid" value={`$${(stats.fees || 0).toFixed(2)}`} subtitle="Platform fees" />
    </div>
  );
}
