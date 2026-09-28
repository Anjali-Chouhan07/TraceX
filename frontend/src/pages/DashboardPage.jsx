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
  RefreshCw, 
  ChevronLeft,
  ArrowDown,
  Mail
} from 'lucide-react';
import Sec91NoticeModal from '../components/Sec91NoticeModal';
import FlowGraph, { DEFAULT_DEMO_NODES, DEFAULT_DEMO_EDGES } from '../components/FlowGraph';

const VASP_LEGAL_EMAILS = {
  binance: "legal@binance.com",
  coinbase: "subpoena@coinbase.com",
  kraken: "compliance@kraken.com",
  huobi: "legal@huobi.com",
  htx: "legal@huobi.com",
  kucoin: "compliance@kucoin.com",
  okx: "compliance@okx.com",
  bitfinex: "compliance@bitfinex.com",
  bybit: "compliance@bybit.com",
  gate: "support@gate.io",
  mexc: "compliance@mexc.com",
  "tornado cash": "compliance@tornadocash.eth",
  default: "legal-compliance@crypto-exchange.com",
};
export default function DashboardPage() {
  const { 
    activeCase, 
    showToast, 
    generateNewReport, 
    setCurrentPage, 
    setIsSahyogModalOpen 
  } = useApp();
  
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTab, setActiveTab] = useState('transactions');
  const [selectedNode, setSelectedNode] = useState(null);
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  

  // Sec 91 BNSS Modal State
  const [sec91Target, setSec91Target] = useState({
    isOpen: false,
    entityName: '',
    address: ''
  });

  // Initial Base Graph Nodes - dynamically uses activeCase graph if present or DEFAULT_DEMO_NODES
  const initialNodes = activeCase?.graph?.nodes || DEFAULT_DEMO_NODES;
  const initialEdges = activeCase?.graph?.edges || DEFAULT_DEMO_EDGES;

  // Dynamic Graph State
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  // Two Buckets State (Upper ETH Bucket & Lower USDT Bucket)
  const [ethBucket, setEthBucket] = useState(activeCase?.ethBucket || {
    totalAmount: 14.85,
    txCount: 8,
    recentTxs: [
      { id: 1, amount: "+1.2 ETH", from: "Victim", time: "10:24" },
      { id: 2, amount: "+0.8 ETH", from: "Suspect Wallet", time: "11:03" },
      { id: 3, amount: "+0.5 ETH", from: "Wallet A", time: "14:22" },
      { id: 4, amount: "+2.1 ETH", from: "Hot Wallet Relay", time: "15:40" },
    ]
  });

  const [usdtBucket, setUsdtBucket] = useState(activeCase?.usdtBucket || {
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
  const [transactionsList, setTransactionsList] = useState(activeCase?.transactions || []);

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

  // Additional Node Pool to dynamically expand the graph
  const additionalNodePool = [
    {
      node: { id: "arbitrumNode", label: "Arbitrum Relay", address: "0x3c2d...1e8f", type: "wallet", x: 860, y: 70, color: "#2563eb" },
      parent: "destPolygon",
      amount: "1.4 ETH",
      token: "ETH",
      val: 1.4,
      desc: "Layer-2 Arbitrum Bridge Route"
    },
    {
      node: { id: "uniswap", label: "Uniswap V3 Pool", address: "0x1f98...e4d3", type: "exchange", x: 860, y: 160, color: "#d97706" },
      parent: "arbitrumNode",
      amount: "2.8 ETH",
      token: "ETH",
      val: 2.8,
      desc: "Decentralized Swap Liquidity Pool"
    },
    {
      node: { id: "peelingOutflow", label: "Peeling Cashout", address: "0x811a...7e9c", type: "wallet", x: 860, y: 250, color: "#2563eb" },
      parent: "mixerOutflow1",
      amount: "5,500 USDT",
      token: "USDT",
      val: 5500,
      desc: "Unmasked Peeling Chain Output"
    },
    {
      node: { id: "avalancheBridge", label: "Avalanche Bridge", address: "0xa0b8...9e10", type: "bridge", x: 860, y: 340, color: "#059669", sourceChain: "ETH", destChain: "AVAX" },
      parent: "mixerOutflow2",
      amount: "9,200 USDT",
      token: "USDT",
      val: 9200,
      desc: "Cross-chain Lock & Mint Smart Contract"
    },
  ];

  const handleAddTransactionNode = () => {
    const nextIndex = nodes.length - initialNodes.length;
    if (nextIndex >= additionalNodePool.length) {
      showToast("Maximum demo network depth reached! Reset graph to restart.", "info");
      return;
    }

    const nextPreset = additionalNodePool[nextIndex];
    const newNode = nextPreset.node;

    setNodes(prev => [...prev, newNode]);

    const newEdge = {
      id: `edge-${Date.now()}`,
      from: nextPreset.parent,
      to: newNode.id,
      amount: nextPreset.amount,
      token: nextPreset.token,
      val: nextPreset.val
    };
    setEdges(prev => [...prev, newEdge]);

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

  useEffect(() => {
    let interval = null;
    if (isAutoSimulating) {
      interval = setInterval(() => {
        handleAddTransactionNode();
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isAutoSimulating, nodes.length]);
 
   const handleSendNoticeToExchange = (entityName, entityAddress) => {
  const caseId = activeCase?.caseId || "CN-1024";

  const suspectAddr =
    entityAddress ||
    activeCase?.suspectWallet ||
    "";

  const normalizedName = String(entityName || "").toLowerCase().trim();

  let targetEmail = VASP_LEGAL_EMAILS.default;

  for (const key of Object.keys(VASP_LEGAL_EMAILS)) {
    if (normalizedName.includes(key)) {
      targetEmail = VASP_LEGAL_EMAILS[key];
      break;
    }
  }

  const subject =
    `URGENT: Legal Preservation Notice & Account Freeze Request - Case #${caseId} - ${entityName}`;

  const body = `ATTN: Legal & Regulatory Compliance Department (${entityName})

Subject: Formal Request for Emergency Account Freeze and KYC Preservation
Case Reference: #${caseId}
Target Suspect Wallet: ${suspectAddr}
Timestamp: ${new Date().toUTCString()}

Sir / Madam,

Pursuant to an active blockchain forensic investigation, illicit funds have been traced directly into deposit addresses under your platform's custodial management.

You are hereby formally requested to:
1. Immediately freeze all trading, staking, and withdrawal capabilities on accounts transacting with the target address.
2. Preserve all KYC documents, identification records, IP connection logs, and linked fiat settlement banking instruments.
3. Provide confirmation of account restraint and internal reference ID within 24 hours.

Issued under statutory authority:
Cyber Crime & Financial Intelligence Enforcement Division
TraceX Forensic Intelligence Network
Case Reference: #${caseId}`;

  const mailtoUrl =
    `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoUrl;

  showToast(
    `Drafted legal notice email to ${entityName} (${targetEmail})`,
    "info"
  );
};
  return (
    <div className="p-4 lg:p-6 space-y-6 select-none">
      {/* 1. Official Case Header Bar (GIGW Compliant Dual-Theme) */}
      <div className="bg-white dark:bg-[#0b142d] border border-slate-200 dark:border-[#1b2b52] rounded-lg p-4 shadow-xs transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('wallet-search')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-[#070d1e] hover:bg-slate-200 dark:hover:bg-[#122045] border border-slate-300 dark:border-[#1b2b52] text-xs text-slate-700 dark:text-cyan-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer mr-1 shadow-xs"
              title="Return to Wallet Search Case Directory"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="font-semibold">All Cases</span>
            </button>

            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>Case #{activeCase.caseId}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 font-semibold">
                {activeCase.status}
              </span>
            </h1>

            <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#1a2b50] rounded-md px-3 py-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Suspect Wallet:</span>
              <span className="font-mono text-blue-700 dark:text-cyan-300 font-semibold">
                {activeCase.suspectWallet.substring(0, 16)}...{activeCase.suspectWallet.substring(34)}
              </span>
              <button 
                onClick={() => copyToClipboard(activeCase.suspectWallet)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white ml-1"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Right Action & Metadata */}
          <div className="flex items-center gap-3">
            {/* Functional SAHYOG Portal Sync Button */}
            <button
              onClick={() => setIsSahyogModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-700/80 text-blue-900 dark:text-blue-200 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer shadow-xs"
              title="Fetch Case / Wallet from SAHYOG Portal (I4C Gateway)"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              <span>Fetch from SAHYOG Portal</span>
            </button>

            <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-[#1a2b50] pl-3">
              <div>
                <span className="block text-slate-400">Created:</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{activeCase.created}</span>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-[#1a2b50]"></div>
              <div>
                <span className="block text-slate-400">Last Updated:</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{activeCase.lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Badges Row - Clean GIGW Styling */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-[#162548]">
          <div className="flex items-center gap-3 p-2.5 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60">
            <div className="w-9 h-9 rounded-md bg-red-100 dark:bg-red-600/20 border border-red-300 dark:border-red-500/40 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-red-700 dark:text-red-300 font-bold uppercase">Risk Score</div>
              <div className="text-base font-extrabold text-red-700 dark:text-red-400">{activeCase.riskScore} / 100</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#1b2b52]">
            <div className="w-9 h-9 rounded-md bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/40 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Total Funds Traced</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {activeCase.totalFundsTracedINR}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">{activeCase.totalFundsTracedBTC}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#1b2b52]">
            <div className="w-9 h-9 rounded-md bg-sky-100 dark:bg-cyan-600/20 border border-sky-200 dark:border-cyan-500/40 flex items-center justify-center text-sky-700 dark:text-cyan-400 shrink-0">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Active Graph Nodes</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-cyan-300">{nodes.length} Nodes</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#1b2b52]">
            <div className="w-9 h-9 rounded-md bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-700 dark:text-indigo-400 shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Stored Transactions</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                {ethBucket.txCount + usdtBucket.txCount} Traced
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 col-span-2 sm:col-span-1">
            <div className="w-9 h-9 rounded-md bg-amber-100 dark:bg-amber-600/20 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase">VASP / Exchange</div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-400 leading-tight">
                {activeCase.vaspCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN SECTION: CENTRAL GRAPH + ETH BUCKET + USDT BUCKET */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Flow Graph + Buckets */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#0b142d] border border-slate-200 dark:border-[#1b2b52] rounded-lg p-4 shadow-xs space-y-3 transition-colors">
            <FlowGraph
              nodes={nodes}
              edges={edges}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
              isAutoSimulating={isAutoSimulating}
              onToggleAutoSimulate={() => setIsAutoSimulating(!isAutoSimulating)}
              onResetGraph={handleResetGraph}
              title="Interactive Wallet Flow Graph"
            />
          </div>

          {/* ETH & USDT Storage Reservoirs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ETH Reservoir */}
            <div className="bg-slate-50 dark:bg-[#0c183b] border border-slate-300 dark:border-blue-900 rounded-lg p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-blue-950">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 flex items-center justify-center text-blue-700 dark:text-cyan-300 font-extrabold text-sm">
                    Ξ
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                      Ethereum (ETH) Reservoir
                    </h3>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Smart-contract transfers
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-sm font-black text-blue-800 dark:text-cyan-300">
                    {ethBucket.totalAmount.toFixed(2)} ETH
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {ethBucket.txCount} Captured
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Recent Inflows:</div>
                <div className="flex flex-wrap gap-1.5">
                  {ethBucket.recentTxs.slice(0, 3).map((tx, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#071126] border border-slate-300 dark:border-blue-800 text-blue-900 dark:text-cyan-300 flex items-center gap-1">
                      <ArrowDown className="w-2.5 h-2.5 text-blue-600" />
                      {tx.amount} <span className="text-slate-500 text-[9px]">({tx.from})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* USDT Reservoir */}
            <div className="bg-slate-50 dark:bg-[#07241c] border border-slate-300 dark:border-emerald-900 rounded-lg p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-emerald-950">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-extrabold text-sm">
                    ₮
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                      Tether (USDT) Reservoir
                    </h3>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Stablecoin exit points
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                    ${usdtBucket.totalAmount.toLocaleString()} USDT
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {usdtBucket.txCount} Captured
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Recent Inflows:</div>
                <div className="flex flex-wrap gap-1.5">
                  {usdtBucket.recentTxs.slice(0, 3).map((tx, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#041410] border border-slate-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                      <ArrowDown className="w-2.5 h-2.5 text-emerald-600" />
                      {tx.amount} <span className="text-slate-500 text-[9px]">({tx.from})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Wallet Details & Detected Entities Panel */}
        <div className="bg-white dark:bg-[#0b142d] border border-slate-200 dark:border-[#1b2b52] rounded-lg p-4 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#162548]">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Wallet Forensics</h2>
              <div className="flex gap-1.5">
                <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 px-2 py-0.5 rounded font-bold uppercase">
                  Suspicious
                </span>
                <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 px-2 py-0.5 rounded font-bold uppercase">
                  High Risk
                </span>
              </div>
            </div>

            {/* Wallet Address with copy */}
            <div className="mt-3 p-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548] flex items-center justify-between">
              <span className="text-xs font-mono text-blue-700 dark:text-cyan-400 font-semibold truncate max-w-[210px]" title={activeCase.suspectWallet}>
                {activeCase.suspectWallet}
              </span>
              <button 
                onClick={() => copyToClipboard(activeCase.suspectWallet)}
                className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-1"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Balance and Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="p-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Balance</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeCase.balanceBTC}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">({activeCase.balanceINR})</span>
              </div>
              <div className="p-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Transactions</span>
                <span className="font-bold text-slate-900 dark:text-white">{transactionsList.length} On-chain</span>
              </div>
              <div className="p-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">First Seen</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">{activeCase.firstSeen}</span>
              </div>
              <div className="p-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Last Seen</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">{activeCase.lastSeen}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Tags:</span>
              {activeCase.tags.map((tag, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#132349] text-slate-700 dark:text-blue-300 border border-slate-300 dark:border-[#20376d] font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {/* ==================================================== */}
            {/* DETECTED ENTITIES / VASP ATTRIBUTION WITH SEC 91 BNSS */}
            {/* ==================================================== */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#162548]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                  Detected Entities / VASP Attribution
                </span>
                <span className="text-[10px] text-blue-700 dark:text-cyan-400 font-semibold">
                  Actionable
                </span>
              </div>

              <div className="space-y-2.5">
                {activeCase.detectedEntities.map((ent, idx) => (
                  <div key={idx} className="p-2.5 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span className="font-bold text-slate-900 dark:text-slate-100">{ent.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{ent.type}</span>
                      </div>
                      <span className="text-[11px] font-bold text-blue-700 dark:text-cyan-400 font-mono">
                        Confidence: {ent.confidence}
                      </span>
                    </div>

                    {/* Secondary Action Button: Generate Lawful Notice (Sec 91 BNSS) */}
                    <button
                      onClick={() => setSec91Target({ isOpen: true, entityName: ent.name, address: activeCase.suspectWallet })}
                      className="w-full py-1.5 px-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-900 dark:text-cyan-300 border border-blue-300 dark:border-blue-800/60 rounded-md text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title={`Generate statutory freeze directive under Section 91 BNSS for ${ent.name}`}
                    >
                      <FileText className="w-3 h-3 text-blue-700 dark:text-cyan-400 shrink-0" />
                      <span>Generate Lawful Notice (Sec 91 BNSS)</span>
                    </button>
                    <button
                        onClick={() =>
                          handleSendNoticeToExchange(ent.name, ent.address || wallet)
                        }
                        className="w-full py-1.5 px-2 bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/50 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                        title={`Open pre-filled Gmail / email dispatch to ${ent.name} legal department`}
                      >
                        <Mail className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="truncate">Send to Exchange</span>
                      </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Suspicious Patterns */}
            <div className="mt-3.5">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Suspicious Patterns
              </span>
              <div className="space-y-1">
                {activeCase.suspiciousPatterns.map((pat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 px-1.5 border-b border-slate-200 dark:border-[#142347]">
                    <span className="text-slate-700 dark:text-slate-300">• {pat.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${pat.color}`}>
                      {pat.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button: Generate Investigation Report */}
          <button
            onClick={handleGenerateReport}
            className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-md flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Investigation Report</span>
          </button>
        </div>
      </div>

      {/* 3. Bottom Panel: Tabbed Investigation Data */}
      <div className="bg-white dark:bg-[#0b142d] border border-slate-200 dark:border-[#1b2b52] rounded-lg p-4 shadow-xs transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#162548]">
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
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#101e40]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => showToast("Exporting case data as CSV...", "info")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#0e1b3d] hover:bg-slate-200 dark:hover:bg-[#132450] border border-slate-300 dark:border-[#1e3466] text-slate-700 dark:text-slate-300 rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Tab Content 1: Transactions Table */}
        {activeTab === 'transactions' && (
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-[#070d1e] text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
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
              <tbody className="divide-y divide-slate-200 dark:divide-[#152345]">
                {transactionsList.map((tx, idx) => (
                  <tr key={tx.id || idx} className="hover:bg-slate-50 dark:hover:bg-[#0e1b3d]/60 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-blue-700 dark:text-cyan-400 hover:underline cursor-pointer">
                      {tx.txHash}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{tx.from}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{tx.to}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{tx.amount}</td>
                    <td className="py-2.5 px-3 font-semibold">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={tx.token === 'ETH' ? 'text-blue-700 dark:text-cyan-400' : 'text-emerald-700 dark:text-emerald-400'}>
                          {tx.token}
                        </span>
                        {(tx.isMixer || tx.type?.includes("Mixer")) && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                            🌪️ Mixer {tx.isMatching ? 'Pattern' : ''}
                          </span>
                        )}
                        {(tx.isBridge || tx.isSwap || tx.type?.includes("Bridge") || tx.type?.includes("Swap")) && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            🌉 Bridge Swap
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{tx.time}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[10px] font-semibold">
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
          <div className="py-6 text-center text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <p className="font-bold text-blue-800 dark:text-cyan-400">Graph Clustering & Bucket Routing Breakdown</p>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              Multi-layer heuristic pipeline partitions funds into two primary storage reservoirs: ETH (Upper Bucket) for smart-contract gas and bridge routes, and USDT (Lower Bucket) for stablecoin off-ramp laundering.
            </p>
          </div>
        )}

        {/* Tab Content 3: Related Entities */}
        {activeTab === 'entities' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="p-3 bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548] rounded-md text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">Binance Hot Wallet Cluster</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">Associated with official Binance deposit pipeline. FIU Request ref: #REQ-98124.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548] rounded-md text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">Tornado Cash Router 0.1 BTC Pool</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">OFAC Specially Designated Nationals (SDN) entity. Automated freeze alert triggered.</p>
            </div>
          </div>
        )}

        {/* Tab Content 4: Evidence */}
        {activeTab === 'evidence' && (
          <div className="py-6 text-center text-xs text-slate-700 dark:text-slate-300 space-y-3">
            <p className="font-bold text-emerald-700 dark:text-emerald-400">14 Evidence Artifacts Registered</p>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Cryptographic hashes, mempool capture logs, and IP geolocation metadata cryptographically sealed under Section 63 BSA 2023.
            </p>
            <button 
              onClick={() => showToast("Opening court evidence locker...", "info")}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-md text-xs font-semibold cursor-pointer"
            >
              Open Secure Evidence Locker
            </button>
          </div>
        )}
      </div>

      {/* Official Section 91 BNSS Requisition Notice Modal */}
      <Sec91NoticeModal
        isOpen={sec91Target.isOpen}
        onClose={() => setSec91Target({ ...sec91Target, isOpen: false })}
        entityName={sec91Target.entityName}
        walletAddress={sec91Target.address}
      />
    </div>
  );
}
