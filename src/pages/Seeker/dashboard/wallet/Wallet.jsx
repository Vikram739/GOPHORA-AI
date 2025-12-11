import React, { useState } from "react";
import { FiUpload, FiDownload } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const assets = [
  { name: 'USD', balance: '$1,200' },
  { name: 'USDC', balance: '$500' },
  { name: 'PHORA', balance: '750' },
];

const transactionsData = [
  { type: 'Earnings', description: 'Survey Reward', amount: '+$5', date: 'Nov 30, 2025' },
  { type: 'Earnings', description: 'Task Reward – App Review', amount: '+$12', date: 'Dec 1, 2025' },
  { type: 'Withdrawals', description: 'Withdrawal', amount: '-$40', date: 'Dec 2, 2025' },
];

export default function Wallet() {
  const [transactions, setTransactions] = useState(transactionsData);
  const [filter, setFilter] = useState('All');

  const filteredTransactions = transactions.filter(tx => filter === 'All' ? true : tx.type === filter);

  return (
    <div className="p-4 md:p-6 space-y-8 text-stark">

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-stark drop-shadow-md">
          Wallet 💳
        </h1>
        <p className="text-stark/70 text-sm md:text-base">
          Manage your balance, add funds, withdraw, and check transactions.
        </p>
      </div>

      {/* Main Balance Card */}
      <div className="bg-[#0F0C19]/70 border border-white/5 rounded-2xl p-6 shadow-[0_0_12px_rgba(71,23,246,0.15)] backdrop-blur-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-stark/60 text-sm">Available Balance</p>
            <h2 className="text-3xl md:text-4xl font-bold text-stark mt-2">$2,450.00</h2>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-jewel/80 text-stark py-3 px-5 rounded-xl hover:shadow-[0_0_12px_rgba(71,23,246,0.25)] transition">
              <FiDownload /> Withdraw
            </button>
            <button className="flex items-center gap-2 bg-fuschia/80 text-stark py-3 px-5 rounded-xl hover:shadow-[0_0_12px_rgba(162,57,202,0.25)] transition">
              <FiUpload /> Add Funds
            </button>
          </div>
        </div>

        {/* Sub-cards for each asset */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatePresence>
            {assets.map((asset, index) => (
              <motion.div
                key={asset.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#0E0B16]/50 p-4 rounded-xl border border-white/10 shadow hover:shadow-[0_0_12px_rgba(71,23,246,0.25)] transition"
              >
                <p className="text-stark/60 text-sm">{asset.name} Balance</p>
                <p className="text-stark text-xl font-semibold mt-1">{asset.balance}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Transaction History with Filters */}
      <div className="bg-[#0F0C19]/70 border border-white/5 rounded-2xl p-6 shadow-[0_0_12px_rgba(71,23,246,0.15)] backdrop-blur-xl">
        <h3 className="text-lg font-semibold mb-4 text-stark">Transaction History</h3>
        <div className="flex gap-2 mb-4 flex-wrap">
          {['All','Earnings','Withdrawals','Rewards','Missions'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`py-2 px-4 rounded-xl font-medium text-sm ${filter === f ? 'bg-jewel/80 text-stark shadow-[0_0_12px_rgba(71,23,246,0.25)]' : 'bg-[#0E0B16]/50 text-stark/70 hover:bg-[#0E0B16]/70 transition'}`}
            >{f}</button>
          ))}
        </div>
        <ul className="space-y-4">
          <AnimatePresence>
            {filteredTransactions.map((tx, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.1 }}
                className="flex justify-between items-center bg-[#0E0B16]/50 p-4 rounded-xl border border-white/10"
              >
                <div>
                  <p className="font-medium text-stark">{tx.description}</p>
                  <p className="text-stark/70 text-sm">{tx.date}</p>
                </div>
                <p className={`${tx.amount.startsWith('+') ? 'text-jewel font-bold' : 'text-fuschia font-bold'}`}>{tx.amount}</p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

    </div>
  );
}
