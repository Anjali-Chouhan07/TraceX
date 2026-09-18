import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Wallet, 
  GitFork, 
  ArrowRightLeft, 
  Building2, 
  Copy, 
  Check, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download,
  Plus,
  Play,
  Pause,
  Database,
  Coins,
  ArrowDown,
  ArrowUp,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function DashboardPage() {
  const { activeCase, showToast, generateNewReport, setCurrentPage } = useApp();
  
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTab, setActiveTab] = useState('transactions');
  const [selectedNode, setSelectedNode] = useState(null);
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);

  // Initial Base Graph Nodes
  const initialNodes = [
    { id: "victim", label: "Victim", address: "0x12ab...9f3e", type: "victim", x: 60, y: 190, color: "#00d2ff" },
    { id: "suspect", label: "Suspect Wallet", address: "0x3a7f5c...c9e4", type: "suspect", x: 190, y: 190, color: "#ef4444", pulse: true },
    { id: "walletA", label: "Wallet A", address: "0x5e2a...1a7c", type: "wallet", x: 340, y: 100, color: "#3b82f6" },
    { id: "walletB", label: "Wallet B", address: "0x6c3e1...5b8a", type: "wallet", x: 340, y: 190, color: "#3b82f6" },
    { id: "walletC", label: "Wallet C", address: "0x9d7b3c...2e4f", type: "wallet", x: 340, y: 280, color: "#3b82f6" },
    { id: "walletD", label: "Wallet D", address: "0x5e2a1...7c1d", type: "wallet", x: 480, y: 100, color: "#3b82f6" },
    { id: "binance", label: "Binance", address: "0x4f9c3e...8d2c", type: "exchange", x: 500, y: 190, color: "#f59e0b" },
    { id: "tornado", label: "Tornado Cash", address: "0x0000...0001", type: "mixer", x: 500, y: 280, color: "#a855f7" },
  ];

  const initialEdges = [
    { id: "e1", from: "victim", to: "suspect", amount: "1.2 ETH", token: "ETH", val: 1.2 },
    { id: "e2", from: "suspect", to: "walletA", amount: "0.8 ETH", token: "ETH", val: 0.8 },
    { id: "e3", from: "suspect", to: "walletB", amount: "2,500 USDT", token: "USDT", val: 2500 },
    { id: "e4", from: "suspect", to: "walletC", amount: "4,000 USDT", token: "USDT", val: 4000 },
    { id: "e5", from: "walletA", to: "walletD", amount: "0.5 ETH", token: "ETH", val: 0.5 },
    { id: "e6", from: "walletB", to: "binance", amount: "2,500 USDT", token: "USDT", val: 2500 },
    { id: "e7", from: "walletC", to: "tornado", amount: "4,000 USDT", token: "USDT", val: 4000 },
  ];

  // Dynamic Graph State
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  // Two Buckets State (Upper ETH Bucket & Lower USDT Bucket)
  const [ethBucket, setEthBucket] = useState({
    totalAmount: 14.85,
    txCount: 8,
    recentTxs: [
      { id: 1, amount: "+1.2 ETH", from: "Victim", time: "10:24" },
      { id: 2, amount: "+0.8 ETH", from: "Suspect Wallet", time: "11:03" },
      { id: 3, amount: "+0.5 ETH", from: "Wallet A", time: "14:22" },
      { id: 4, amount: "+2.1 ETH", from: "Hot Wallet Relay", time: "15:40" },
    ]
  });

  const [usdtBucket, setUsdtBucket] = useState({
    totalAmount: 68400,
    txCount: 14,
    recentTxs: [
      { id: 1, amount: "+$2,500 USDT", from: "Suspect Wallet", time: "12:17" },
      { id: 2, amount: "+$4,000 USDT", from: "Suspect Wallet", time: "15:10" },
      { id: 3, amount: "+$12,500 USDT", from: "Binance Liquidity", time: "16:03" },
      { id: 4, amount: "+$8,200 USDT", from: "Peeling Chain C", time: "16:45" },
    ]
  });

  // Dynamic Case Transactions list that updates when new nodes spawn
  const [transactionsList, setTransactionsList] = useState(activeCase.transactions || []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Wallet address copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateReport = () => {
    generateNewReport({
      title: `Case ${activeCase.caseId} Investigation Summary`,
      type: "Case Summary",
      relatedCase: activeCase.caseId
    });
  };

  // Additional Node Pool to dynamically expand the graph as transactions increase
  const additionalNodePool = [
    {
      node: { id: "walletE", label: "Wallet E", address: "0x3c2d...1e8f", type: "wallet", x: 630, y: 70, color: "#3b82f6" },
      parent: "walletD",
      amount: "1.4 ETH",
      token: "ETH",
      val: 1.4,
      desc: "Layer-2 Arbitrum Bridge Route"
    },
    {
      node: { id: "uniswap", label: "Uniswap V3 Pool", address: "0x1f98...e4d3", type: "exchange", x: 740, y: 130, color: "#f59e0b" },
      parent: "walletE",
      amount: "2.8 ETH",
      token: "ETH",
      val: 2.8,
      desc: "Decentralized Swap Liquidity Pool"
    },
    {
      node: { id: "walletF", label: "Wallet F (Peeling)", address: "0x811a...7e9c", type: "wallet", x: 630, y: 320, color: "#3b82f6" },
      parent: "tornado",
      amount: "5,500 USDT",
      token: "USDT",
      val: 5500,
      desc: "Unmasked Peeling Chain Output"
    },
    {
      node: { id: "bridge", label: "Polygon Bridge", address: "0xa0b8...9e10", type: "bridge", x: 740, y: 260, color: "#10b981" },
      parent: "walletF",
      amount: "9,200 USDT",
      token: "USDT",
      val: 9200,
      desc: "Cross-chain Lock & Mint Smart Contract"
    },
    {
      node: { id: "walletG", label: "Cashout Node", address: "0x742d...44e8", type: "wallet", x: 840, y: 190, color: "#ef4444" },
      parent: "bridge",
      amount: "14,000 USDT",
      token: "USDT",
      val: 14000,
      desc: "Final Off-ramp Withdrawal Address"
    },
    {
      node: { id: "coldWallet", label: "KuCoin Deposit", address: "0x6cc5...9b21", type: "exchange", x: 840, y: 80, color: "#f59e0b" },
      parent: "uniswap",
      amount: "3.5 ETH",
      token: "ETH",
      val: 3.5,
      desc: "Centralized Exchange Deposit Hot Wallet"
    }
  ];

  // Function to increase transactions and spawn new graph nodes
  const handleAddTransactionNode = () => {
    const nextIndex = nodes.length - initialNodes.length;
    if (nextIndex >= additionalNodePool.length) {
      showToast("Maximum demo network depth reached! Reset graph to restart.", "info");
      return;
    }

    const nextPreset = additionalNodePool[nextIndex];
    const newNode = nextPreset.node;

    // 1. Append Node
    setNodes(prev => [...prev, newNode]);

    // 2. Append Connecting Edge
    const newEdge = {
      id: `edge-${Date.now()}`,
      from: nextPreset.parent,
      to: newNode.id,
      amount: nextPreset.amount,
      token: nextPreset.token,
      val: nextPreset.val
    };
    setEdges(prev => [...prev, newEdge]);

    // 3. Route amount into either the Upper ETH Bucket or Lower USDT Bucket
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (nextPreset.token === 'ETH') {
      setEthBucket(prev => ({
        totalAmount: parseFloat((prev.totalAmount + nextPreset.val).toFixed(2)),
        txCount: prev.txCount + 1,
        recentTxs: [
          { id: Date.now(), amount: `+${nextPreset.amount}`, from: newNode.label, time: nowTime },
          ...prev.recentTxs.slice(0, 3)
        ]
      }));
      showToast(`Node '${newNode.label}' added! ${nextPreset.amount} stored in Upper ETH Bucket`, "success");
    } else {
      setUsdtBucket(prev => ({
        totalAmount: prev.totalAmount + nextPreset.val,
        txCount: prev.txCount + 1,
        recentTxs: [
          { id: Date.now(), amount: `+${nextPreset.amount}`, from: newNode.label, time: nowTime },
          ...prev.recentTxs.slice(0, 3)
        ]
      }));
      showToast(`Node '${newNode.label}' added! ${nextPreset.amount} stored in Lower USDT Bucket`, "success");
    }

    // 4. Append to bottom transactions table
    const newTxRow = {
      id: transactionsList.length + 1,
      txHash: '0x' + Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6),
      from: newNode.address,
      to: nextPreset.token === 'ETH' ? 'ETH Bucket (Upper)' : 'USDT Bucket (Lower)',
      amount: nextPreset.val.toLocaleString(),
      token: nextPreset.token,
      time: `14 Apr ${nowTime}`,
      status: "Confirmed",
      risk: nextPreset.token === 'ETH' ? "High" : "Medium"
    };
    setTransactionsList(prev => [newTxRow, ...prev]);
  };

  // Reset Graph & Buckets
  const handleResetGraph = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setEthBucket({
      totalAmount: 14.85,
      txCount: 8,
      recentTxs: [
        { id: 1, amount: "+1.2 ETH", from: "Victim", time: "10:24" },
        { id: 2, amount: "+0.8 ETH", from: "Suspect Wallet", time: "11:03" },
      ]
    });
    setUsdtBucket({
      totalAmount: 68400,
      txCount: 14,
      recentTxs: [
        { id: 1, amount: "+$2,500 USDT", from: "Suspect Wallet", time: "12:17" },
        { id: 2, amount: "+$4,000 USDT", from: "Suspect Wallet", time: "15:10" },
      ]
    });
    setTransactionsList(activeCase.transactions || []);
    setIsAutoSimulating(false);
    showToast("Graph and transaction storage buckets reset to initial state.", "info");
  };

  // Auto-simulation timer effect
  useEffect(() => {
    let interval = null;
    if (isAutoSimulating) {
      interval = setInterval(() => {
        handleAddTransactionNode();
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isAutoSimulating, nodes.length]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 1. Case Header Bar */}
      <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2.5">
              <span>Case #{activeCase.caseId}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                {activeCase.status}
              </span>
            </h1>

            <div className="hidden sm:flex items-center gap-2 bg-[#070d1e] border border-[#1a2b50] rounded-lg px-3 py-1">
              <span className="text-xs text-slate-400">Suspect Wallet:</span>
              <span className="text-xs font-mono text-cyan-300">
                {activeCase.suspectWallet.substring(0, 16)}...{activeCase.suspectWallet.substring(34)}
              </span>
              <button 
                onClick={() => copyToClipboard(activeCase.suspectWallet)}
                className="text-slate-400 hover:text-white ml-1"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Right Meta info */}
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <div>
              <span className="block text-slate-400">Created:</span>
              <span className="text-slate-200 font-medium">{activeCase.created}</span>
            </div>
            <div className="h-6 w-px bg-[#1a2b50]"></div>
            <div>
              <span className="block text-slate-400">Last Updated:</span>
              <span className="text-slate-200 font-medium">{activeCase.lastUpdated}</span>
            </div>
            <div className="h-6 w-px bg-[#1a2b50]"></div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Active Investigation</span>
            </div>
          </div>
        </div>

        {/* Metric Badges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-[#162548]">
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-red-950/30 border border-red-800/60">
            <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-red-300 font-medium">Risk Score</div>
              <div className="text-base font-extrabold text-red-400">{activeCase.riskScore} / 100</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#070d1e] border border-[#1b2b52]">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Total Funds Traced</div>
              <div className="text-xs font-bold text-white leading-tight">
                {activeCase.totalFundsTracedINR}
              </div>
              <div className="text-[10px] text-slate-400">{activeCase.totalFundsTracedBTC}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#070d1e] border border-[#1b2b52]">
            <div className="w-9 h-9 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Active Graph Nodes</div>
              <div className="text-base font-extrabold text-cyan-300">{nodes.length} Nodes</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#070d1e] border border-[#1b2b52]">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Stored Transactions</div>
              <div className="text-base font-extrabold text-white">
                {ethBucket.txCount + usdtBucket.txCount} Traced
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 col-span-2 sm:col-span-1">
            <div className="w-9 h-9 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-amber-300 font-medium">VASP / Exchange</div>
              <div className="text-xs font-bold text-amber-400 leading-tight">
                {activeCase.vaspCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN REDESIGNED SECTION: CENTRAL GRAPH WITH DYNAMIC NODES -> ETH BUCKET + USDT BUCKET BELOW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Central Flow Graph + ETH Bucket + USDT Bucket (both below graph) */}
        <div className="lg:col-span-2 space-y-4">

          {/* ======================================================== */}
          {/* CENTRAL WALLET FLOW GRAPH: NODES DYNAMICALLY INCREASE */}
          {/* ======================================================== */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#162548]">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Interactive Wallet Flow Graph ({nodes.length} Dynamic Nodes)
                </h2>
              </div>

              {/* Dynamic Action Buttons: Add Hop / Auto / Reset */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddTransactionNode}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                  title="Simulate a new blockchain transaction and spawn a new graph node"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Hop / Transaction</span>
                </button>

                <button
                  onClick={() => setIsAutoSimulating(!isAutoSimulating)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer ${
                    isAutoSimulating 
                      ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                      : 'bg-[#0e1c3d] hover:bg-[#152a5c] border border-[#1e3b79] text-cyan-300'
                  }`}
                  title="Automatically add new nodes as transactions stream"
                >
                  {isAutoSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isAutoSimulating ? 'Streaming...' : 'Auto-Stream'}</span>
                </button>

                <button
                  onClick={handleResetGraph}
                  className="p-1.5 bg-[#070d1e] hover:bg-[#122045] border border-[#162548] text-slate-400 hover:text-white rounded-lg text-xs"
                  title="Reset Graph to 8 Base Nodes"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00d2ff]"></span>Victim</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>Suspect</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>Wallets</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>Exchanges</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#a855f7]"></span>Mixer</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span>Bridge</span>
              </div>
              <span className="text-cyan-400 font-mono">Tip: Click any node to inspect payload</span>
            </div>

            {/* Interactive Graph Canvas Area */}
            <div className="relative h-[410px] bg-[#070d1e] rounded-xl border border-[#162548] overflow-hidden cyber-grid-pattern flex items-center justify-center select-none">
              {/* Zoom & Reset Overlay Controls */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
                  className="w-7 h-7 bg-[#0b142d] border border-[#1d305c] hover:bg-[#122248] text-slate-300 hover:text-white rounded flex items-center justify-center text-xs shadow"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.65))}
                  className="w-7 h-7 bg-[#0b142d] border border-[#1d305c] hover:bg-[#122248] text-slate-300 hover:text-white rounded flex items-center justify-center text-xs shadow"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setZoomLevel(1)}
                  className="w-7 h-7 bg-[#0b142d] border border-[#1d305c] hover:bg-[#122248] text-slate-300 hover:text-white rounded flex items-center justify-center text-xs shadow"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic SVG Visual Graph Representation */}
              <svg 
                className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-200"
                viewBox="0 0 920 390"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                  </marker>
                  <marker id="arrow-red" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                  </marker>
                  <marker id="arrow-yellow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                  </marker>
                  <marker id="arrow-purple" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
                  </marker>
                  <marker id="arrow-green" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                  </marker>
                </defs>

                {/* Vertical Inflow Guide Lines Connecting to Upper & Lower Buckets */}
                <line x1="190" y1="0" x2="190" y2="160" stroke="#00d2ff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
                <line x1="340" y1="0" x2="340" y2="80" stroke="#00d2ff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
                <line x1="340" y1="300" x2="340" y2="390" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
                <line x1="500" y1="300" x2="500" y2="390" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />

                {/* Render Dynamic Edges */}
                {edges.map((e) => {
                  const sourceNode = nodes.find(n => n.id === e.from);
                  const targetNode = nodes.find(n => n.id === e.to);
                  if (!sourceNode || !targetNode) return null;

                  const midX = (sourceNode.x + targetNode.x) / 2;
                  const midY = (sourceNode.y + targetNode.y) / 2;
                  const isUSDT = e.token === 'USDT';

                  return (
                    <g key={e.id}>
                      <line 
                        x1={sourceNode.x} 
                        y1={sourceNode.y} 
                        x2={targetNode.x} 
                        y2={targetNode.y} 
                        stroke={isUSDT ? "#10b981" : "#3b82f6"} 
                        strokeWidth="2" 
                        strokeDasharray={isUSDT ? "4 2" : "none"}
                        markerEnd={isUSDT ? "url(#arrow-green)" : "url(#arrow)"} 
                      />
                      <rect 
                        x={midX - 35} 
                        y={midY - 10} 
                        width="70" 
                        height="18" 
                        rx="4" 
                        fill="#0b142d" 
                        stroke={isUSDT ? "#10b981" : "#1d305c"} 
                      />
                      <text 
                        x={midX} 
                        y={midY + 2} 
                        fill={isUSDT ? "#34d399" : "#60a5fa"} 
                        fontSize="9" 
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {e.amount}
                      </text>
                    </g>
                  );
                })}

                {/* Render Dynamic Nodes */}
                {nodes.map((node) => {
                  const isSuspect = node.type === 'suspect';
                  return (
                    <g 
                      key={node.id} 
                      className="cursor-pointer group"
                      onClick={() => setSelectedNode(`${node.label} (${node.address}) - Type: ${node.type}`)}
                    >
                      {/* Node Circle */}
                      <circle 
                        cx={node.x} 
                        cy={node.y} 
                        r={isSuspect ? 28 : 22} 
                        fill="#0c1a3b" 
                        stroke={node.color} 
                        strokeWidth={isSuspect ? 3 : 2}
                        className={isSuspect ? "animate-pulse" : "transition-all group-hover:r-24"} 
                      />

                      {/* Inner accent ring for suspect */}
                      {isSuspect && (
                        <circle cx={node.x} cy={node.y} r="20" fill="#ef4444" opacity="0.2" />
                      )}

                      {/* Label Inside Circle */}
                      <text 
                        x={node.x} 
                        y={node.y + 4} 
                        fill="#ffffff" 
                        fontSize={isSuspect ? "8" : "9"} 
                        fontWeight="bold" 
                        textAnchor="middle"
                      >
                        {node.label.length > 9 ? node.label.substring(0, 8) + '..' : node.label}
                      </text>

                      {/* Sub-label Below Circle */}
                      <text 
                        x={node.x} 
                        y={node.y + (isSuspect ? 40 : 34)} 
                        fill={node.color} 
                        fontSize="8" 
                        fontWeight="medium" 
                        textAnchor="middle"
                      >
                        {node.address}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Selected Node Details Floating Tooltip */}
              {selectedNode && (
                <div className="absolute bottom-3 right-3 bg-[#0b142d]/95 border border-cyan-500/50 rounded-lg p-2.5 text-xs shadow-2xl animate-in fade-in max-w-xs">
                  <span className="text-[10px] text-cyan-400 block font-bold">Node Forensics:</span>
                  <span className="text-white font-mono text-[11px] block">{selectedNode}</span>
                  <button 
                    onClick={() => setSelectedNode(null)} 
                    className="mt-1 text-[10px] text-slate-400 hover:text-white underline"
                  >
                    Dismiss Inspector
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* BOTTOM BUCKET 1: ETH TRANSACTION STORAGE RESERVOIR */}
          {/* ======================================================== */}
          <div className="bg-gradient-to-r from-[#0c183b] via-[#0f214d] to-[#0c183b] border-2 border-cyan-500/40 rounded-xl p-4 shadow-xl relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-full bg-cyan-500/5 blur-2xl pointer-events-none"></div>

            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-cyan-900/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-extrabold text-base shadow-md shadow-cyan-500/20">
                  Ξ
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Ethereum (ETH) Storage Reservoir
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      Storing ETH Amounts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Aggregates all native ETH inflows and smart-contract peeling transfers
                  </p>
                </div>
              </div>

              {/* Stored Amount & Counter */}
              <div className="text-right">
                <div className="text-xl font-black text-cyan-300 font-mono tracking-tight flex items-center justify-end gap-1.5">
                  <span>{ethBucket.totalAmount.toFixed(2)} ETH</span>
                  <span className="text-xs text-slate-400 font-normal">(~ ${(ethBucket.totalAmount * 3240).toLocaleString()})</span>
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {ethBucket.txCount} Transactions Captured in Reservoir
                </span>
              </div>
            </div>

            {/* Reservoir Fill Bar & Recent ETH Inputs Chips */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Reservoir Capacity</span>
                  <span className="text-cyan-300 font-mono">{Math.min(100, Math.round((ethBucket.totalAmount / 30) * 100))}% Filled</span>
                </div>
                <div className="w-full h-2 bg-[#070d1e] rounded-full overflow-hidden border border-cyan-950">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 rounded-full transition-all duration-500 shadow-sm shadow-cyan-400"
                    style={{ width: `${Math.min(100, Math.round((ethBucket.totalAmount / 30) * 100))}%` }}
                  ></div>
                </div>
              </div>

              {/* Live Captured Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-semibold">Latest Inputs:</span>
                {ethBucket.recentTxs.slice(0, 3).map((tx, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#071126] border border-cyan-800 text-cyan-300 flex items-center gap-1">
                    <ArrowDown className="w-2.5 h-2.5 text-cyan-400" />
                    {tx.amount} <span className="text-slate-500 text-[9px]">({tx.from})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Inflow Pipe Indicator */}
            <div className="mt-2 text-center flex items-center justify-center gap-2 text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
              <span>ETH Flow Channels Connected to Graph Nodes</span>
              <ArrowDown className="w-3 h-3 animate-bounce" />
            </div>
          </div>

          {/* ======================================================== */}
          {/* BOTTOM BUCKET 2: USDT STABLECOIN STORAGE RESERVOIR */}
          {/* ======================================================== */}
          <div className="bg-gradient-to-r from-[#07241c] via-[#0b3328] to-[#07241c] border-2 border-emerald-500/40 rounded-xl p-4 shadow-xl relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-48 h-full bg-emerald-500/5 blur-2xl pointer-events-none"></div>

            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-emerald-900/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 font-extrabold text-base shadow-md shadow-emerald-500/20">
                  ₮
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Tether (USDT) Storage Reservoir
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Storing USDT Amounts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Captures all dollar-pegged stablecoin exit routes, mixer dumps, and DEX conversions
                  </p>
                </div>
              </div>

              {/* Stored Amount & Counter */}
              <div className="text-right">
                <div className="text-xl font-black text-emerald-300 font-mono tracking-tight flex items-center justify-end gap-1.5">
                  <span>${usdtBucket.totalAmount.toLocaleString()} USDT</span>
                  <span className="text-xs text-slate-400 font-normal">(~ ₹{(usdtBucket.totalAmount * 86.5).toLocaleString()})</span>
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {usdtBucket.txCount} Transactions Captured in Reservoir
                </span>
              </div>
            </div>

            {/* Reservoir Fill Bar & Recent USDT Inputs Chips */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Reservoir Capacity</span>
                  <span className="text-emerald-300 font-mono">{Math.min(100, Math.round((usdtBucket.totalAmount / 120000) * 100))}% Filled</span>
                </div>
                <div className="w-full h-2 bg-[#070d1e] rounded-full overflow-hidden border border-emerald-950">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-600 via-emerald-400 to-green-500 rounded-full transition-all duration-500 shadow-sm shadow-emerald-400"
                    style={{ width: `${Math.min(100, Math.round((usdtBucket.totalAmount / 120000) * 100))}%` }}
                  ></div>
                </div>
              </div>

              {/* Live Captured Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-semibold">Latest Inputs:</span>
                {usdtBucket.recentTxs.slice(0, 3).map((tx, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#041410] border border-emerald-800 text-emerald-300 flex items-center gap-1">
                    <ArrowDown className="w-2.5 h-2.5 text-emerald-400" />
                    {tx.amount} <span className="text-slate-500 text-[9px]">({tx.from})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Inflow Pipe Indicator pointing up from Graph */}
            <div className="mt-2 text-center flex items-center justify-center gap-2 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
              <span>USDT Flow Channels Connected to Graph Nodes</span>
              <ArrowDown className="w-3 h-3 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Right Column: Wallet Details & Risk Profile */}
        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#162548]">
              <h2 className="text-sm font-bold text-white tracking-wide">Wallet Details</h2>
              <div className="flex gap-1.5">
                <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-semibold">
                  Suspicious
                </span>
                <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-semibold">
                  High Risk
                </span>
              </div>
            </div>

            {/* Wallet Address with copy */}
            <div className="mt-3 p-2 rounded-lg bg-[#070d1e] border border-[#162548] flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 truncate max-w-[210px]">
                {activeCase.suspectWallet}
              </span>
              <button 
                onClick={() => copyToClipboard(activeCase.suspectWallet)}
                className="text-slate-400 hover:text-white p-1"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Balance and Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-3 text-xs">
              <div className="p-2 rounded-lg bg-[#070d1e] border border-[#162548]">
                <span className="text-[10px] text-slate-400 block">Balance</span>
                <span className="font-bold text-white">{activeCase.balanceBTC}</span>
                <span className="text-[10px] text-slate-400 block">({activeCase.balanceINR})</span>
              </div>
              <div className="p-2 rounded-lg bg-[#070d1e] border border-[#162548]">
                <span className="text-[10px] text-slate-400 block">Total Transactions</span>
                <span className="font-bold text-white">{transactionsList.length} On-chain</span>
              </div>
              <div className="p-2 rounded-lg bg-[#070d1e] border border-[#162548]">
                <span className="text-[10px] text-slate-400 block">First Seen</span>
                <span className="font-medium text-slate-300 text-[11px]">{activeCase.firstSeen}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#070d1e] border border-[#162548]">
                <span className="text-[10px] text-slate-400 block">Last Seen</span>
                <span className="font-medium text-slate-300 text-[11px]">{activeCase.lastSeen}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400">Tags:</span>
              {activeCase.tags.map((tag, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-[#132349] text-blue-300 border border-[#20376d]">
                  {tag}
                </span>
              ))}
            </div>

            {/* Detected Entities */}
            <div className="mt-3.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Detected Entities
              </span>
              <div className="space-y-1.5">
                {activeCase.detectedEntities.map((ent, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#070d1e] border border-[#162548] text-xs">
                    <div>
                      <span className="font-semibold text-slate-200">{ent.name}</span>
                      <span className="text-[10px] text-slate-400 block">{ent.type}</span>
                    </div>
                    <span className="text-[11px] font-bold text-cyan-400">
                      Confidence: {ent.confidence}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suspicious Patterns */}
            <div className="mt-3.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Suspicious Patterns
              </span>
              <div className="space-y-1">
                {activeCase.suspiciousPatterns.map((pat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 px-1.5 border-b border-[#142347]">
                    <span className="text-slate-300">• {pat.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${pat.color}`}>
                      {pat.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Investigation Recommendations */}
            <div className="mt-3.5 p-2.5 rounded-lg bg-[#070d1e] border border-[#182952]">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Investigation Recommendations
              </span>
              <ol className="text-[11px] text-slate-300 list-decimal list-inside space-y-1">
                {activeCase.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* Action Button: Generate Investigation Report */}
          <button
            onClick={handleGenerateReport}
            className="mt-4 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Investigation Report</span>
          </button>
        </div>
      </div>

      {/* 3. Bottom Panel: Tabbed Investigation Data */}
      <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#162548]">
          <div className="flex items-center gap-2">
            {[
              { id: 'transactions', label: `Transactions (${transactionsList.length})` },
              { id: 'network', label: 'Network Analysis' },
              { id: 'entities', label: 'Related Entities' },
              { id: 'evidence', label: 'Evidence' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-[#101e40]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => showToast("Exporting data as CSV...", "info")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e1b3d] hover:bg-[#132450] border border-[#1e3466] text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

        {/* Tab Content 1: Transactions Table */}
        {activeTab === 'transactions' && (
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070d1e] text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Tx Hash</th>
                  <th className="py-2.5 px-3">From</th>
                  <th className="py-2.5 px-3">To</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Token</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#152345]">
                {transactionsList.map((tx, idx) => (
                  <tr key={tx.id || idx} className="hover:bg-[#0e1b3d]/60 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-cyan-400 hover:underline cursor-pointer">
                      {tx.txHash}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{tx.from}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{tx.to}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{tx.amount}</td>
                    <td className={`py-2.5 px-3 font-semibold ${tx.token === 'ETH' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                      {tx.token}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{tx.time}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-semibold">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content 2: Network Analysis */}
        {activeTab === 'network' && (
          <div className="py-6 text-center text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-cyan-400">Graph Clustering & Bucket Routing Breakdown</p>
            <p className="text-slate-400 max-w-lg mx-auto">
              Dynamic multi-layer graph algorithm partitions funds into two primary storage reservoirs: ETH (Upper Bucket) for smart-contract gas and bridge routes, and USDT (Lower Bucket) for stablecoin off-ramp laundering.
            </p>
          </div>
        )}

        {/* Tab Content 3: Related Entities */}
        {activeTab === 'entities' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="p-3 bg-[#070d1e] border border-[#162548] rounded-lg text-xs">
              <span className="font-bold text-white block">Binance Hot Wallet Cluster</span>
              <p className="text-slate-400 text-[11px] mt-1">Associated with official Binance deposit pipeline. FIU Request ref: #REQ-98124.</p>
            </div>
            <div className="p-3 bg-[#070d1e] border border-[#162548] rounded-lg text-xs">
              <span className="font-bold text-white block">Tornado Cash Router 0.1 BTC Pool</span>
              <p className="text-slate-400 text-[11px] mt-1">OFAC Specially Designated Nationals (SDN) entity. Automated freeze alert triggered.</p>
            </div>
          </div>
        )}

        {/* Tab Content 4: Evidence */}
        {activeTab === 'evidence' && (
          <div className="py-6 text-center text-xs text-slate-300 space-y-3">
            <p className="font-semibold text-emerald-400">14 Evidence Artifacts Registered</p>
            <p className="text-slate-400 max-w-md mx-auto">
              Cryptographic hashes, mempool capture logs, and IP geolocation metadata cryptographically sealed.
            </p>
            <button 
              onClick={() => showToast("Opening evidence locker...", "info")}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
            >
              Open Secure Evidence Locker
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
