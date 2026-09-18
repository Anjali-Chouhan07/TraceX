import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Copy, 
  Check, 
  Plus, 
  ExternalLink, 
  FileText, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  ChevronDown
} from 'lucide-react';

export default function WalletSearchPage() {
  const { showToast, generateNewReport, setCurrentPage, addNewCase } = useApp();

  const [selectedChain, setSelectedChain] = useState('Ethereum');
  const [searchAddress, setSearchAddress] = useState('0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2');
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  // Preset wallets for demo testing
  const [recentSearches, setRecentSearches] = useState([
    { label: "0x3a7f5c...f3a2", address: "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2", risk: 87 },
    { label: "1BVBMSE...XqXu", address: "1BVBMSEXqXu914df2e1a7c", risk: 96 },
    { label: "0x914df2e...1a7c", address: "0x914df2e1a7c884b2e84128f9ac1209be34", risk: 45 },
    { label: "0x0f57b3...2e4f", address: "0x0f57b32e4f87a04a9e220743712ce6d9bb1b", risk: 12 },
  ]);

  const copyAddress = () => {
    navigator.clipboard.writeText(searchAddress);
    setCopied(true);
    showToast("Address copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchAddress.trim()) {
      showToast("Please enter an address or transaction hash.", "error");
      return;
    }
    showToast(`Scanning on-chain forensics for ${searchAddress.substring(0, 10)}...`, "info");
  };

  const handleAddToCase = () => {
    showToast(`Wallet ${searchAddress.substring(0, 12)}... linked to Active Case CN-1024!`, "success");
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block mb-0.5">
            WALLET SEARCH
          </span>
          <h1 className="text-xl font-extrabold text-white tracking-wide">
            Wallet Search
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Analyze any cryptocurrency wallet address
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-400 italic">"Follow the money, find the truth."</p>
        </div>
      </div>

      {/* Chain Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['Bitcoin', 'Ethereum', 'Binance Smart Chain', 'Solana', 'Polygon', 'More'].map((chain) => (
          <button
            key={chain}
            onClick={() => setSelectedChain(chain)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedChain === chain
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#0b142d] border border-[#1b2b52] text-slate-300 hover:text-white hover:bg-[#101e40]'
            }`}
          >
            {chain === 'More' ? 'More ▾' : chain}
          </button>
        ))}
      </div>

      {/* Main Search Input & Recent Searches */}
      <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Enter wallet address (0x... or bc1...)"
              className="w-full bg-[#070d1e] border border-[#1d2f5a] focus:border-blue-500 rounded-lg py-2.5 pl-3 pr-10 text-white font-mono text-xs outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        {/* Recent Search Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">Recent Searches:</span>
          {recentSearches.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSearchAddress(item.address)}
              className="px-2.5 py-1 rounded bg-[#070d1e] hover:bg-[#122045] border border-[#162548] text-cyan-300 font-mono text-[11px] transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => setRecentSearches([])}
            className="text-[11px] text-slate-500 hover:text-slate-300 underline ml-1"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Top Card: Wallet Overview */}
      <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#162548]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Wallet Overview</span>
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-bold">
                  High Risk
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 mt-0.5">
                <span>{searchAddress}</span>
                <button onClick={copyAddress} className="text-slate-400 hover:text-white">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToCase}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Case</span>
          </button>
        </div>

        {/* 6 Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-3 pt-1 text-xs">
          <div className="p-2.5 rounded-lg bg-[#070d1e] border border-[#162548]">
            <span className="text-[10px] text-slate-400 block">Balance</span>
            <span className="font-bold text-white text-sm">0.48 BTC</span>
            <span className="text-[10px] text-slate-400 block">(~ ₹ 4,32,000)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#070d1e] border border-[#162548]">
            <span className="text-[10px] text-slate-400 block">Total Received</span>
            <span className="font-bold text-emerald-400 text-sm">12.36 BTC</span>
            <span className="text-[10px] text-slate-400 block">(~ ₹ 1.11 Cr)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#070d1e] border border-[#162548]">
            <span className="text-[10px] text-slate-400 block">Total Sent</span>
            <span className="font-bold text-red-400 text-sm">11.88 BTC</span>
            <span className="text-[10px] text-slate-400 block">(~ ₹ 1.07 Cr)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#070d1e] border border-[#162548]">
            <span className="text-[10px] text-slate-400 block">Transactions</span>
            <span className="font-bold text-white text-sm">127</span>
            <span className="text-[10px] text-slate-400 block">Verified on-chain</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#070d1e] border border-[#162548]">
            <span className="text-[10px] text-slate-400 block">First Seen</span>
            <span className="font-semibold text-slate-200">12 Apr 2025</span>
            <span className="text-[10px] text-slate-400 block">10:24 IST</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#070d1e] border border-[#162548]">
            <span className="text-[10px] text-slate-400 block">Last Seen</span>
            <span className="font-semibold text-slate-200">14 Apr 2025</span>
            <span className="text-[10px] text-slate-400 block">16:32 IST</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#162548] pb-1">
        {['Overview', 'Transactions', 'Network Graph', 'Related Entities', 'Analytics', 'Notes'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t.toLowerCase())}
            className={`px-3 py-1.5 text-xs font-semibold transition-all border-b-2 ${
              activeTab === t.toLowerCase()
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Center Layout: Charts (Left 2 cols) & Risk Profile (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Charts Container */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Balance History Line Chart */}
            <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-[#162548]">
                <span className="text-xs font-bold text-white">Balance History</span>
                <span className="text-[10px] text-slate-400 bg-[#070d1e] px-2 py-0.5 rounded border border-[#162548]">
                  Last 7 Days ▾
                </span>
              </div>

              {/* Custom SVG Line Chart */}
              <div className="h-44 pt-3 relative flex items-end justify-center">
                <svg className="w-full h-full" viewBox="0 0 280 120">
                  <defs>
                    <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="20" x2="280" y2="20" stroke="#162548" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="280" y2="60" stroke="#162548" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="280" y2="100" stroke="#162548" strokeDasharray="3 3" />

                  {/* Area fill */}
                  <polygon points="10,30 60,45 120,35 180,80 240,65 270,95 270,115 10,115" fill="url(#balanceGrad)" />
                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    points="10,30 60,45 120,35 180,80 240,65 270,95"
                  />
                  {/* Dots */}
                  <circle cx="10" cy="30" r="3.5" fill="#60a5fa" />
                  <circle cx="60" cy="45" r="3.5" fill="#60a5fa" />
                  <circle cx="120" cy="35" r="3.5" fill="#60a5fa" />
                  <circle cx="180" cy="80" r="3.5" fill="#60a5fa" />
                  <circle cx="240" cy="65" r="3.5" fill="#60a5fa" />
                  <circle cx="270" cy="95" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 pt-1 border-t border-[#142347]">
                <span>Apr 8</span>
                <span>Apr 9</span>
                <span>Apr 10</span>
                <span>Apr 12</span>
                <span>Apr 14</span>
              </div>
            </div>

            {/* Asset Distribution Donut Chart */}
            <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg">
              <div className="pb-2 border-b border-[#162548]">
                <span className="text-xs font-bold text-white">Asset Distribution</span>
              </div>

              <div className="flex items-center justify-center gap-4 py-3">
                {/* SVG Donut */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#101e40" strokeWidth="16" />
                    {/* BTC 52% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="16" strokeDasharray="124 238" strokeDashoffset="0" />
                    {/* ETH 24% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="16" strokeDasharray="57 238" strokeDashoffset="-124" />
                    {/* USDT 14% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray="33 238" strokeDashoffset="-181" />
                    {/* Others 10% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8b5cf6" strokeWidth="16" strokeDasharray="24 238" strokeDashoffset="-214" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-white">0.48 BTC</span>
                    <span className="text-[8px] text-slate-400">₹ 4,32,000</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span className="text-slate-300">BTC</span><span className="text-slate-500 font-mono">52%</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span className="text-slate-300">ETH</span><span className="text-slate-500 font-mono">24%</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span className="text-slate-300">USDT</span><span className="text-slate-500 font-mono">14%</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span><span className="text-slate-300">Others</span><span className="text-slate-500 font-mono">10%</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#162548]">
              <span className="text-xs font-bold text-white">Recent Transactions</span>
              <button 
                onClick={() => setCurrentPage('transaction-monitor')}
                className="text-[11px] text-blue-400 hover:text-blue-300"
              >
                View All →
              </button>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#070d1e] text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-2.5">#</th>
                    <th className="py-2 px-2.5">Tx Hash</th>
                    <th className="py-2 px-2.5">Type</th>
                    <th className="py-2 px-2.5">Amount</th>
                    <th className="py-2 px-2.5">Token</th>
                    <th className="py-2 px-2.5">Counterparty</th>
                    <th className="py-2 px-2.5">Time</th>
                    <th className="py-2 px-2.5">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#152345]">
                  {[
                    { id: 1, hash: '0x811a...7e9c', type: 'Outgoing', amount: '1.2', token: 'BTC', to: '0x12ab...9f3e', time: '12 Apr 10:24', risk: 'High' },
                    { id: 2, hash: '0x4e7c...2d1f', type: 'Incoming', amount: '0.5', token: 'BTC', to: '0x3a7f5c...c9e4', time: '12 Apr 11:03', risk: 'Medium' },
                    { id: 3, hash: '0x69d2...6a4e', type: 'Outgoing', amount: '0.3', token: 'BTC', to: '0x6c3e1...5b8a', time: '12 Apr 12:17', risk: 'High' },
                    { id: 4, hash: '0x61a...3e7b', type: 'Incoming', amount: '0.3', token: 'BTC', to: '0x4f9c3e...8d2c', time: '12 Apr 15:10', risk: 'Low' },
                    { id: 5, hash: '0x2d8c...9f0a', type: 'Outgoing', amount: '0.4', token: 'BTC', to: '0x0000...0001', time: '12 Apr 16:03', risk: 'Medium' },
                  ].map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#0e1b3d]/60">
                      <td className="py-2 px-2.5 text-slate-500">{tx.id}</td>
                      <td className="py-2 px-2.5 font-mono text-cyan-400 hover:underline cursor-pointer">{tx.hash}</td>
                      <td className="py-2 px-2.5">
                        <span className={`flex items-center gap-1 font-semibold ${tx.type === 'Incoming' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tx.type === 'Incoming' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 font-bold text-white">{tx.amount}</td>
                      <td className="py-2 px-2.5 font-semibold text-amber-400">{tx.token}</td>
                      <td className="py-2 px-2.5 font-mono text-slate-400">{tx.to}</td>
                      <td className="py-2 px-2.5 text-slate-400 text-[11px]">{tx.time}</td>
                      <td className="py-2 px-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                          tx.risk === 'High' ? 'text-red-400 bg-red-950/60 border-red-800' :
                          tx.risk === 'Medium' ? 'text-amber-400 bg-amber-950/60 border-amber-800' :
                          'text-emerald-400 bg-emerald-950/60 border-emerald-800'
                        }`}>
                          {tx.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Risk Analysis & Quick Actions */}
        <div className="space-y-4">
          {/* Risk Analysis Card with Speedometer */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg">
            <span className="text-xs font-bold text-white block pb-2 border-b border-[#162548]">
              Risk Analysis
            </span>

            {/* Semicircle Gauge */}
            <div className="flex flex-col items-center justify-center my-3">
              <div className="relative w-36 h-20 overflow-hidden">
                <svg className="w-36 h-36" viewBox="0 0 100 100">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#162548" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" strokeDasharray="125" strokeDashoffset="20" />
                </svg>
              </div>
              <div className="text-center -mt-6">
                <div className="text-xl font-extrabold text-white">87 / 100</div>
                <div className="text-[11px] font-bold text-red-400">High Risk</div>
              </div>
            </div>

            {/* Risk Factor Checklist */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-[#142347]">
              {[
                { factor: "Linked to Mixer", level: "High", color: "text-red-400" },
                { factor: "Multiple Small Transfers", level: "High", color: "text-red-400" },
                { factor: "Interaction with VASP", level: "Medium", color: "text-amber-400" },
                { factor: "Known Scam Cluster", level: "High", color: "text-red-400" },
                { factor: "Sanctioned Entity", level: "Low", color: "text-emerald-400" },
              ].map((rf, idx) => (
                <div key={idx} className="flex items-center justify-between py-0.5">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="text-slate-500">•</span> {rf.factor}
                  </span>
                  <span className={`text-[10px] font-bold ${rf.color}`}>{rf.level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Entity Detection */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-[#162548] mb-2">
              <span className="text-xs font-bold text-white">Entity Detection</span>
              <span className="text-[10px] text-blue-400 hover:underline cursor-pointer">View All</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-[#070d1e] border border-[#162548] flex justify-between items-center">
                <div>
                  <span className="font-semibold text-white">Binance</span>
                  <span className="text-[10px] text-slate-400 block">Exchange</span>
                </div>
                <span className="text-[11px] font-bold text-cyan-400">Confidence: 98%</span>
              </div>
              <div className="p-2 rounded bg-[#070d1e] border border-[#162548] flex justify-between items-center">
                <div>
                  <span className="font-semibold text-white">Tornado Cash</span>
                  <span className="text-[10px] text-slate-400 block">Mixer</span>
                </div>
                <span className="text-[11px] font-bold text-cyan-400">Confidence: 87%</span>
              </div>
              <div className="p-2 rounded bg-[#070d1e] border border-[#162548] flex justify-between items-center">
                <div>
                  <span className="font-semibold text-white">Huobi</span>
                  <span className="text-[10px] text-slate-400 block">Exchange</span>
                </div>
                <span className="text-[11px] font-bold text-cyan-400">Confidence: 62%</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg space-y-2">
            <span className="text-xs font-bold text-white block pb-2 border-b border-[#162548]">
              Quick Actions
            </span>
            <button 
              onClick={() => showToast("Opening on-chain block explorer in secure sandbox...", "info")}
              className="w-full py-2 px-3 bg-[#070d1e] hover:bg-[#122045] border border-[#1a2c56] rounded-lg text-xs text-slate-200 hover:text-white flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2"><ExternalLink className="w-3.5 h-3.5 text-blue-400" /> View on Blockchain Explorer</span>
            </button>
            <button 
              onClick={() => generateNewReport({ title: `Wallet Forensics: ${searchAddress.substring(0, 10)}...`, type: "Wallet" })}
              className="w-full py-2 px-3 bg-[#070d1e] hover:bg-[#122045] border border-[#1a2c56] rounded-lg text-xs text-slate-200 hover:text-white flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-emerald-400" /> Generate Report</span>
            </button>
            <button 
              onClick={handleAddToCase}
              className="w-full py-2 px-3 bg-[#070d1e] hover:bg-[#122045] border border-[#1a2c56] rounded-lg text-xs text-slate-200 hover:text-white flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5 text-amber-400" /> Add to Investigation</span>
            </button>
            <button 
              onClick={() => showToast("Surveillance alert armed for address velocity &gt; 1 BTC", "success")}
              className="w-full py-2 px-3 bg-[#070d1e] hover:bg-[#122045] border border-[#1a2c56] rounded-lg text-xs text-slate-200 hover:text-white flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2"><Bell className="w-3.5 h-3.5 text-cyan-400" /> Set Alert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
