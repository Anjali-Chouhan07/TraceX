import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Pause, 
  Play, 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  Eye, 
  Filter, 
  RotateCcw, 
  ExternalLink,
  CheckCircle2,
  Sliders,
  ChevronRight,
  TrendingUp,
  Radio
} from 'lucide-react';

export default function TransactionMonitorPage() {
  const { showToast, setCurrentPage } = useApp();

  const [isMonitoring, setIsMonitoring] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState('All Networks');
  const [selectedRisk, setSelectedRisk] = useState('All Levels');
  const [currentTime, setCurrentTime] = useState('14 Apr 2025, 16:47:32 IST');

  // Alert rules state
  const [alertRules, setAlertRules] = useState({
    largeTx: true,
    illicitAddress: true,
    mixerInteraction: true,
    rapidMovement: true,
    crossChain: false
  });

  // Live transactions stream
  const [transactions, setTransactions] = useState([
    { id: 1, time: '16:47:21', hash: '0x811a...7e9c', from: '0x12ab...9f3e', to: '0x3a7f...c9e4', amount: '12.5', token: 'BTC', network: 'Bitcoin', risk: 'High' },
    { id: 2, time: '16:46:18', hash: '0x4e7c...2d1f', from: '0x3a7f...c9e4', to: '0x5e2a...1a7c', amount: '0.8', token: 'ETH', network: 'Ethereum', risk: 'Medium' },
    { id: 3, time: '16:45:02', hash: '0x69d2...6a4e', from: '0x0d3e...5b8a', to: '0x4f9c...8d2c', amount: '2,340', token: 'USDT', network: 'BNB Chain', risk: 'Low' },
    { id: 4, time: '16:44:11', hash: '0x61a...3e7b', from: '0x9d7b...2e4f', to: '0x5e2a...7c1d', amount: '15.0', token: 'BNB', network: 'BNB Chain', risk: 'High' },
    { id: 5, time: '16:43:55', hash: '0x2d8c...9f0a', from: '0x9d7b...2e4f', to: '0x0000...0001', amount: '1,250', token: 'USDT', network: 'Polygon', risk: 'Medium' },
    { id: 6, time: '16:42:30', hash: '0x7e3b...5a1c', from: '0x3a7f...c9e4', to: '0x5e2a...1a7c', amount: '0.4', token: 'MATIC', network: 'Polygon', risk: 'Low' },
    { id: 7, time: '16:41:17', hash: '0x3c2d...1e8f', from: '0x811a...7e9c', to: '0x5e2a...7c1d', amount: '8.7', token: 'SOL', network: 'Solana', risk: 'Medium' },
    { id: 8, time: '16:39:48', hash: '0x9d7b...2e4f', to: '0x0d3e...5b8a', from: '0x4f9c...8d2c', amount: '5.2', token: 'ETH', network: 'Ethereum', risk: 'High' },
    { id: 9, time: '16:38:21', hash: '0x3a7f...c9e4', to: '0x5e2a...7c1d', from: '0x0000...0001', amount: '420', token: 'USDT', network: 'Ethereum', risk: 'High' },
    { id: 10, time: '16:37:05', hash: '0x7e3b...5a1c', from: '0x0d3e...5b8a', to: '0x5e2a...1a7c', amount: '0.95', token: 'BTC', network: 'Bitcoin', risk: 'Medium' },
  ]);

  // Live streaming effect when monitoring is active
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const tokens = ['BTC', 'ETH', 'USDT', 'SOL', 'MATIC'];
      const networks = ['Bitcoin', 'Ethereum', 'BNB Chain', 'Polygon', 'Solana'];
      const risks = ['High', 'Medium', 'Low'];
      const randomRisk = risks[Math.floor(Math.random() * risks.length)];
      const randomNet = networks[Math.floor(Math.random() * networks.length)];
      const randomToken = tokens[Math.floor(Math.random() * tokens.length)];

      const newTx = {
        id: Date.now(),
        time: timeStr,
        hash: '0x' + Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6),
        from: '0x' + Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6),
        to: '0x' + Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6),
        amount: (Math.random() * 8 + 0.1).toFixed(2),
        token: randomToken,
        network: randomNet,
        risk: randomRisk
      };

      setTransactions(prev => [newTx, ...prev.slice(0, 11)]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const toggleRule = (ruleKey) => {
    setAlertRules(prev => ({ ...prev, [ruleKey]: !prev[ruleKey] }));
    showToast("Surveillance heuristic threshold updated.", "info");
  };

  const filteredTxs = transactions.filter(t => {
    const netMatch = selectedNetwork === 'All Networks' || t.network === selectedNetwork;
    const riskMatch = selectedRisk === 'All Levels' || t.risk === selectedRisk;
    return netMatch && riskMatch;
  });

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-0.5">
            TRANSACTION MONITOR
          </span>
          <h1 className="text-xl font-extrabold text-white tracking-wide">
            Real-time Transaction Monitoring
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor and analyze suspicious blockchain transactions in real-time
          </p>
        </div>

        {/* Live Status & Pause Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-[#0b142d] border border-[#1b2b52] rounded-lg px-3 py-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-400 font-semibold">Live Monitoring</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 font-mono text-[11px]">{currentTime}</span>
          </div>

          <button
            onClick={() => {
              setIsMonitoring(!isMonitoring);
              showToast(isMonitoring ? "Stream paused." : "Live monitoring resumed.", "info");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow cursor-pointer ${
              isMonitoring
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isMonitoring ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isMonitoring ? 'Pause Monitor' : 'Resume Monitor'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow">
          <div className="text-2xl font-extrabold text-white">12,458</div>
          <div className="text-xs text-slate-400 font-medium">Total Transactions</div>
          <span className="text-[11px] font-bold text-emerald-400 mt-1 block">↑ 12% Last 24 hours</span>
        </div>

        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow">
          <div className="text-2xl font-extrabold text-red-400">892</div>
          <div className="text-xs text-slate-400 font-medium">Suspicious Transactions</div>
          <span className="text-[11px] font-bold text-red-400 mt-1 block">↑ 18% Last 24 hours</span>
        </div>

        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow">
          <div className="text-2xl font-extrabold text-rose-500">234</div>
          <div className="text-xs text-slate-400 font-medium">High Risk</div>
          <span className="text-[11px] font-bold text-rose-400 mt-1 block">↑ 24% Last 24 hours</span>
        </div>

        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow">
          <div className="text-2xl font-extrabold text-cyan-400">1,246</div>
          <div className="text-xs text-slate-400 font-medium">Monitored Wallets</div>
          <span className="text-[11px] font-bold text-emerald-400 mt-1 block">Active tracking ↑ 8%</span>
        </div>
      </div>

      {/* Charts & Filter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Transaction Volume 24h Line Chart */}
        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-[#162548]">
            <span className="text-xs font-bold text-white">Transaction Volume (24h)</span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Normal</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Suspicious</span>
            </div>
          </div>

          <div className="h-44 pt-3 relative flex items-end">
            <svg className="w-full h-full" viewBox="0 0 280 120">
              {/* Normal curve (blue) */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                points="10,80 50,70 100,50 150,30 200,40 240,25 270,35"
              />
              {/* Suspicious curve (red) */}
              <polyline
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                points="10,110 50,105 100,95 150,70 200,85 240,60 270,75"
              />
            </svg>
            {/* Tooltip mockup */}
            <div className="absolute top-8 left-20 bg-[#070d1e] border border-[#1d2f5a] p-1.5 rounded text-[9px] shadow-lg">
              <span className="text-slate-400 block">14 Apr 14:00</span>
              <span className="text-blue-400 block">• Normal: 1,250</span>
              <span className="text-red-400 block">• Suspicious: 210</span>
            </div>
          </div>
          <div className="flex justify-between text-[9px] text-slate-500 pt-1 border-t border-[#142347]">
            <span>10:00</span>
            <span>12:00</span>
            <span>14:00</span>
            <span>16:00</span>
          </div>
        </div>

        {/* Transaction Type Distribution */}
        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg">
          <span className="text-xs font-bold text-white block pb-2 border-b border-[#162548]">
            Transaction Type Distribution
          </span>
          <div className="flex items-center justify-center gap-3 py-3">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="16" strokeDasharray="138 238" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#00d2ff" strokeWidth="16" strokeDasharray="52 238" strokeDashoffset="-138" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="16" strokeDasharray="28 238" strokeDashoffset="-190" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#a855f7" strokeWidth="16" strokeDasharray="12 238" strokeDashoffset="-218" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-extrabold text-white">12,458</span>
                <span className="text-[7px] text-slate-400">Total Txs</span>
              </div>
            </div>

            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-slate-300">Transfers</span><span className="text-slate-400">58%</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span><span className="text-slate-300">Smart Contracts</span><span className="text-slate-400">22%</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span><span className="text-slate-300">Token Swaps</span><span className="text-slate-400">12%</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span><span className="text-slate-300">NFT Transfers</span><span className="text-slate-400">5%</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500"></span><span className="text-slate-300">Others</span><span className="text-slate-400">3%</span></div>
            </div>
          </div>
        </div>

        {/* Network Filters */}
        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg space-y-2.5 text-xs">
          <span className="text-xs font-bold text-white block pb-2 border-b border-[#162548]">
            Network Filters
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Blockchain</label>
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="w-full bg-[#070d1e] border border-[#1d2f5a] rounded p-1.5 text-xs text-white"
              >
                <option value="All Networks">All Networks</option>
                <option value="Bitcoin">Bitcoin</option>
                <option value="Ethereum">Ethereum</option>
                <option value="BNB Chain">BNB Chain</option>
                <option value="Polygon">Polygon</option>
                <option value="Solana">Solana</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Risk Level</label>
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="w-full bg-[#070d1e] border border-[#1d2f5a] rounded p-1.5 text-xs text-white"
              >
                <option value="All Levels">All Levels</option>
                <option value="High">High Risk Only</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setSelectedNetwork('All Networks');
                setSelectedRisk('All Levels');
              }}
              className="px-3 py-1 bg-[#070d1e] hover:bg-[#122045] border border-[#162548] text-slate-400 hover:text-white rounded text-xs"
            >
              Reset
            </button>
            <button
              onClick={() => showToast("Filters applied to live stream.", "success")}
              className="px-4 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Bottom Grid: Live Transactions (Left 2 cols) & Network Status/Alerts (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Transactions Table */}
        <div className="lg:col-span-2 bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#162548]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-white">Live Transactions</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                Live Feed
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Auto-refreshes every 3 seconds</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070d1e] text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-2.5">Time</th>
                  <th className="py-2 px-2.5">Tx Hash</th>
                  <th className="py-2 px-2.5">From</th>
                  <th className="py-2 px-2.5">To</th>
                  <th className="py-2 px-2.5">Amount</th>
                  <th className="py-2 px-2.5">Token</th>
                  <th className="py-2 px-2.5">Network</th>
                  <th className="py-2 px-2.5">Risk</th>
                  <th className="py-2 px-2.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#152345]">
                {filteredTxs.map((tx, idx) => (
                  <tr key={tx.id || idx} className="hover:bg-[#0e1b3d]/70 transition-colors">
                    <td className="py-2 px-2.5 text-slate-400 text-[11px] font-mono">{tx.time}</td>
                    <td className="py-2 px-2.5 font-mono text-cyan-400 hover:underline cursor-pointer">{tx.hash}</td>
                    <td className="py-2 px-2.5 font-mono text-slate-400">{tx.from}</td>
                    <td className="py-2 px-2.5 font-mono text-slate-400">{tx.to}</td>
                    <td className="py-2 px-2.5 font-bold text-white">{tx.amount}</td>
                    <td className="py-2 px-2.5 font-semibold text-amber-400">{tx.token}</td>
                    <td className="py-2 px-2.5 text-slate-300">{tx.network}</td>
                    <td className="py-2 px-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                        tx.risk === 'High' ? 'text-red-400 bg-red-950/60 border-red-800' :
                        tx.risk === 'Medium' ? 'text-amber-400 bg-amber-950/60 border-amber-800' :
                        'text-emerald-400 bg-emerald-950/60 border-emerald-800'
                      }`}>
                        {tx.risk}
                      </span>
                    </td>
                    <td className="py-2 px-2.5">
                      <button 
                        onClick={() => {
                          showToast(`Inspecting tx payload ${tx.hash}`, 'info');
                          setCurrentPage('wallet-search');
                        }}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Network Status, Alert Rules & Live Alerts */}
        <div className="space-y-4">
          {/* Network Status */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg text-xs">
            <span className="text-xs font-bold text-white block pb-2 border-b border-[#162548]">
              Network Status
            </span>
            <div className="space-y-2 mt-2">
              {[
                { name: "Bitcoin", status: "Online", tps: "2,432 tx/min" },
                { name: "Ethereum", status: "Online", tps: "3,125 tx/min" },
                { name: "BNB Chain", status: "Online", tps: "1,842 tx/min" },
                { name: "Polygon", status: "Online", tps: "924 tx/min" },
                { name: "Solana", status: "Online", tps: "1,216 tx/min" },
              ].map((net, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-[#142347]">
                  <span className="text-slate-200 font-medium">{net.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {net.status}
                    </span>
                    <span className="text-slate-500 text-[10px]">{net.tps}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Rules Toggleable Checklist */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg text-xs space-y-2">
            <span className="text-xs font-bold text-white block pb-2 border-b border-[#162548]">
              Alert Rules
            </span>
            {[
              { id: 'largeTx', label: 'Large Transactions (> 10 BTC)' },
              { id: 'illicitAddress', label: 'Known Illicit Addresses' },
              { id: 'mixerInteraction', label: 'Mixer Interaction' },
              { id: 'rapidMovement', label: 'Rapid Fund Movement' },
              { id: 'crossChain', label: 'Cross-chain Transfers' },
            ].map((rule) => (
              <label key={rule.id} className="flex items-center justify-between py-1 cursor-pointer">
                <span className="text-slate-300 text-[11px]">{rule.label}</span>
                <input 
                  type="checkbox" 
                  checked={alertRules[rule.id]} 
                  onChange={() => toggleRule(rule.id)}
                  className="accent-blue-500 rounded" 
                />
              </label>
            ))}
          </div>

          {/* Live Alerts */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg text-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#162548]">
              <span className="text-xs font-bold text-white">Live Alerts</span>
              <span className="text-[10px] text-blue-400 hover:underline cursor-pointer">View All</span>
            </div>
            <div className="space-y-2">
              {[
                { time: '16:45', title: 'Large transfer detected', sub: '12.5 BTC to New wallet', risk: 'High' },
                { time: '16:42', title: 'Mixer interaction', sub: '0.8 BTC via Tornado Cash', risk: 'Medium' },
                { time: '16:38', title: 'Known illicit address', sub: 'Funds received from Rugpull wallet', risk: 'High' },
                { time: '16:35', title: 'Rapid transactions', sub: '15 tx in 2 minutes', risk: 'Medium' },
                { time: '16:31', title: 'Cross-chain transfer', sub: 'ETH → BSC 12.5 ETH', risk: 'Low' },
              ].map((al, idx) => (
                <div key={idx} className="p-1.5 rounded bg-[#070d1e] border border-[#162548] flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-mono text-[9px]">{al.time}</span>
                      <span className="text-slate-200 font-semibold text-[11px]">{al.title}</span>
                    </div>
                    <span className="text-slate-400 text-[10px] block">{al.sub}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                    al.risk === 'High' ? 'text-red-400 border-red-800' : 'text-amber-400 border-amber-800'
                  }`}>
                    {al.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
