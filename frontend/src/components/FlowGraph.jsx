import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Wallet, 
  GitFork, 
  ArrowRightLeft, 
  Building2, 
  Copy, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause, 
  RefreshCw,
  Shuffle,
  Shield,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

/**
 * DEFAULT_DEMO_NODES
 * High-fidelity forensic graph nodes including:
 * - Victim (Cyan)
 * - Suspect (Red with pulse)
 * - Relay / Peeling Wallets (Blue)
 * - Cross-Chain Bridge with Dual Chains (Emerald)
 * - CEX / Exchange (Amber)
 * - Mixer (Purple) with 3 Equal-Volume Outflows
 */
export const DEFAULT_DEMO_NODES = [
  { 
    id: "victim", 
    label: "Victim Deposit", 
    address: "0x12ab...9f3e", 
    fullAddress: "0x12ab2948c901e8234891240192840192839f3e41",
    type: "victim", 
    x: 65, 
    y: 200, 
    color: "#0284c7",
    riskScore: 18,
    chain: "ETH"
  },
  { 
    id: "suspect", 
    label: "Suspect Target", 
    address: "0x3a7f...c9e4", 
    fullAddress: "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2",
    type: "suspect", 
    x: 200, 
    y: 200, 
    color: "#dc2626", 
    pulse: true,
    riskScore: 89,
    chain: "ETH"
  },
  { 
    id: "walletA", 
    label: "Relay Wallet A", 
    address: "0x5e2a...1a7c", 
    fullAddress: "0x5e2a114e9acbf0987114da2bcde0817291a7c1d2",
    type: "wallet", 
    x: 350, 
    y: 95, 
    color: "#2563eb",
    riskScore: 54,
    chain: "ETH"
  },
  { 
    id: "walletB", 
    label: "Peeling Wallet B", 
    address: "0x6c3e...5b8a", 
    fullAddress: "0x6c3e104829adbf90128491028491029485b8a3e1",
    type: "wallet", 
    x: 350, 
    y: 200, 
    color: "#2563eb",
    riskScore: 62,
    chain: "ETH"
  },
  { 
    id: "walletC", 
    label: "Mixer Feeder C", 
    address: "0x9d7b...2e4f", 
    fullAddress: "0x9d7b3c2e4f910283948192038491029482e4f012",
    type: "wallet", 
    x: 350, 
    y: 305, 
    color: "#2563eb",
    riskScore: 78,
    chain: "ETH"
  },
  { 
    id: "bridge", 
    label: "Stargate Bridge", 
    address: "0xaf88...5831", 
    fullAddress: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    type: "bridge", 
    sourceChain: "ETH",
    destChain: "POLYGON",
    x: 520, 
    y: 95, 
    color: "#059669",
    riskScore: 65,
    swapInfo: "Lock: ETH ➔ Mint: POLYGON"
  },
  { 
    id: "binance", 
    label: "Binance CEX", 
    address: "0x4f9c...8d2c", 
    fullAddress: "0x4f9c3e8d2c91028491029481920384918d2c0192",
    type: "exchange", 
    x: 520, 
    y: 200, 
    color: "#d97706",
    riskScore: 40,
    chain: "MULTI"
  },
  { 
    id: "tornado", 
    label: "Tornado Cash", 
    address: "0x0000...0001", 
    fullAddress: "0xgv122h4hj5vh5h56hhih6b6h7hbvhybu546hbh7b",
    type: "mixer", 
    x: 520, 
    y: 305, 
    color: "#9333ea",
    riskScore: 98,
    patternAnalysis: "Volume-based Time Window Pattern Analysis: Auto-detects equal-volume outflow wallets within the target time range."
  },
  { 
    id: "destPolygon", 
    label: "Polygon Recipient", 
    address: "0xb7c8...d931", 
    fullAddress: "0xb7c819201948192038491028491029487c1d931",
    type: "wallet", 
    chain: "POLYGON",
    x: 740, 
    y: 95, 
    color: "#059669",
    riskScore: 68
  },
  { 
    id: "mixerOutflow1", 
    label: "Outflow Wallet α", 
    address: "0x71a4...b219", 
    fullAddress: "0x71a418901824018249018249018240192834b219",
    type: "wallet", 
    x: 740, 
    y: 240, 
    color: "#9333ea",
    riskScore: 88,
    isMixerOutflow: true,
    matchingVolume: "1,000 USDT"
  },
  { 
    id: "mixerOutflow2", 
    label: "Outflow Wallet β", 
    address: "0x82b5...320a", 
    fullAddress: "0x82b52901824018249018249018240192835c320a",
    type: "wallet", 
    x: 740, 
    y: 305, 
    color: "#9333ea",
    riskScore: 88,
    isMixerOutflow: true,
    matchingVolume: "1,000 USDT"
  },
  { 
    id: "mixerOutflow3", 
    label: "Outflow Wallet γ", 
    address: "0x93c6...431b", 
    fullAddress: "0x93c63901824018249018249018240192836d431b",
    type: "wallet", 
    x: 740, 
    y: 370, 
    color: "#9333ea",
    riskScore: 88,
    isMixerOutflow: true,
    matchingVolume: "1,000 USDT"
  },
];

/**
 * DEFAULT_DEMO_EDGES
 * High-fidelity edge flows including:
 * - 3 Outgoing lines from Mixer each carrying identical matching volume "1,000 USDT"
 * - Distinct dashed / colored bridge connectors showing token swap activity
 */
export const DEFAULT_DEMO_EDGES = [
  { id: "e1", from: "victim", to: "suspect", amount: "1.2 ETH", token: "ETH", val: 1.2 },
  { id: "e2", from: "suspect", to: "walletA", amount: "0.8 ETH", token: "ETH", val: 0.8 },
  { id: "e3", from: "suspect", to: "walletB", amount: "2,500 USDT", token: "USDT", val: 2500 },
  { id: "e4", from: "suspect", to: "walletC", amount: "3,000 USDT", token: "USDT", val: 3000 },
  
  // Bridge Route: ETH Wallet ➔ Stargate Bridge ➔ Polygon Recipient (Dashed connector & swap activity)
  { id: "e5", from: "walletA", to: "bridge", amount: "0.8 ETH", token: "ETH", val: 0.8 },
  { 
    id: "e-bridge-swap", 
    from: "bridge", 
    to: "destPolygon", 
    amount: "2,450 MATIC", 
    token: "MATIC", 
    val: 2450,
    isBridge: true,
    isSwap: true,
    swapLabel: "ETH ➔ MATIC",
    dashed: true
  },
  
  // Peeling flow into Binance CEX
  { id: "e6", from: "walletB", to: "binance", amount: "2,500 USDT", token: "USDT", val: 2500 },
  
  // Inflow to Tornado Cash Mixer
  { id: "e7", from: "walletC", to: "tornado", amount: "3,000 USDT", token: "USDT", val: 3000 },
  
  // Mixer Requirement: 3 Outgoing edge lines with IDENTICAL/MATCHING volume labels ("1,000 USDT")
  { 
    id: "e-mix-1", 
    from: "tornado", 
    to: "mixerOutflow1", 
    amount: "1,000 USDT", 
    token: "USDT", 
    val: 1000, 
    isMixer: true, 
    isMatching: true,
    pattern: "Volume-based Time Window Pattern Analysis: Auto-detects equal-volume outflow wallets within the target time range."
  },
  { 
    id: "e-mix-2", 
    from: "tornado", 
    to: "mixerOutflow2", 
    amount: "1,000 USDT", 
    token: "USDT", 
    val: 1000, 
    isMixer: true, 
    isMatching: true,
    pattern: "Volume-based Time Window Pattern Analysis: Auto-detects equal-volume outflow wallets within the target time range."
  },
  { 
    id: "e-mix-3", 
    from: "tornado", 
    to: "mixerOutflow3", 
    amount: "1,000 USDT", 
    token: "USDT", 
    val: 1000, 
    isMixer: true, 
    isMatching: true,
    pattern: "Volume-based Time Window Pattern Analysis: Auto-detects equal-volume outflow wallets within the target time range."
  },
];

export default function FlowGraph({
  nodes = DEFAULT_DEMO_NODES,
  edges = DEFAULT_DEMO_EDGES,
  selectedNode = null,
  onSelectNode = () => {},
  isAutoSimulating = false,
  onToggleAutoSimulate = null,
  onResetGraph = null,
  title = "Interactive Wallet Flow Graph",
  showLegend = true,
  className = ""
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copied, setCopied] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeInspector, setActiveInspector] = useState(selectedNode);

  // Sync internal inspector when external selectedNode changes
  React.useEffect(() => {
    if (selectedNode !== undefined) {
      setActiveInspector(selectedNode);
    }
  }, [selectedNode]);

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if any mixer in current nodes has equal-volume outflows
  const mixerNodes = nodes.filter(n => n.type === 'mixer' || n.node_class === 'mixer');
  const hasMixerEqualVolume = edges.some(e => e.isMatching || (e.from === 'tornado' && e.isMixer));

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#162548]">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse"></div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
            {title} ({nodes.length} Forensic Nodes)
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onToggleAutoSimulate && (
            <button
              onClick={onToggleAutoSimulate}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                isAutoSimulating 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-[#0e1c3d] hover:bg-slate-200 dark:hover:bg-[#152a5c] border border-slate-300 dark:border-[#1e3b79] text-slate-700 dark:text-cyan-300'
              }`}
              title="Automatically add new nodes as transactions stream"
            >
              {isAutoSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isAutoSimulating ? 'Streaming...' : 'Auto-Stream'}</span>
            </button>
          )}

          {onResetGraph && (
            <button
              onClick={onResetGraph}
              className="p-1.5 bg-slate-100 dark:bg-[#070d1e] hover:bg-slate-200 dark:hover:bg-[#122045] border border-slate-300 dark:border-[#162548] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md text-xs cursor-pointer transition-colors"
              title="Reset Graph Layout"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Visual Legend Bar with all 6 Node Types */}
      {showLegend && (
        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 px-1 flex-wrap gap-2">
          <div className="flex items-center gap-3.5 flex-wrap">
            {/* 1. Victim */}
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-full bg-[#0284c7] border border-cyan-300 shadow-xs flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white"></span>
              </span>
              <span>Victim</span>
            </span>

            {/* 2. Suspect */}
            <span className="flex items-center gap-1.5 font-medium">
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#dc2626] border border-red-300"></span>
              </span>
              <span className="text-red-600 dark:text-red-400 font-bold">Suspect</span>
            </span>

            {/* 3. Wallets */}
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-full bg-[#2563eb] border border-blue-300 shadow-xs"></span>
              <span>Wallets</span>
            </span>

            {/* 4. Exchanges */}
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-full bg-[#d97706] border border-amber-300 shadow-xs"></span>
              <span>Exchanges</span>
            </span>

            {/* 5. Mixer */}
            <span className="flex items-center gap-1.5 font-semibold text-purple-700 dark:text-purple-300">
              <span className="w-3.5 h-3.5 rounded-full bg-[#9333ea] border-2 border-purple-300 dark:border-purple-400 shadow-xs flex items-center justify-center text-[8px] text-white">
                🌪️
              </span>
              <span>Mixer (Tumbler)</span>
            </span>

            {/* 6. Bridge */}
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="w-3.5 h-3.5 rounded-md bg-[#059669] border border-emerald-300 dark:border-emerald-400 shadow-xs flex items-center justify-center text-[8px] text-white">
                🌉
              </span>
              <span>Bridge (Cross-Chain)</span>
            </span>
          </div>

          <span className="text-blue-700 dark:text-cyan-400 font-medium text-[10px]">
            Click node or edge for forensics
          </span>
        </div>
      )}

      {/* 3. Mixer Equal-Volume Pattern Visual Highlight Banner */}
      {hasMixerEqualVolume && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 dark:from-[#1b0d38]/90 dark:via-[#16173a]/80 dark:to-[#1b0d38]/90 border border-purple-300 dark:border-purple-600/60 rounded-md p-2 flex items-center justify-between text-xs text-purple-900 dark:text-purple-200 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-purple-200 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
              <Shuffle className="w-3.5 h-3.5" />
            </span>
            <div>
              <span className="font-extrabold uppercase tracking-wide text-[10px] text-purple-700 dark:text-purple-300 block">
                Forensic Pattern Detected
              </span>
              <span className="text-[11px] font-medium leading-tight">
                <strong>Volume-based Time Window Pattern Analysis:</strong> Auto-detects equal-volume outflow wallets within the target time range.
              </span>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-800/80 text-purple-900 dark:text-purple-100 font-mono text-[10px] font-bold shrink-0">
            3x Equal-Volume Outflows (1,000 USDT)
          </span>
        </div>
      )}

      {/* 4. Interactive SVG Graph Canvas */}
      <div className="relative h-[430px] bg-slate-50 dark:bg-[#070d1e] rounded-md border border-slate-200 dark:border-[#162548] overflow-hidden flex items-center justify-center select-none lea-grid-pattern">
        {/* Zoom Controls */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <button 
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
            className="w-7 h-7 bg-white dark:bg-[#0b142d] border border-slate-300 dark:border-[#1d305c] hover:bg-slate-100 dark:hover:bg-[#122248] text-slate-700 dark:text-slate-300 rounded-md flex items-center justify-center text-xs shadow-xs cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.65))}
            className="w-7 h-7 bg-white dark:bg-[#0b142d] border border-slate-300 dark:border-[#1d305c] hover:bg-slate-100 dark:hover:bg-[#122248] text-slate-700 dark:text-slate-300 rounded-md flex items-center justify-center text-xs shadow-xs cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setZoomLevel(1)}
            className="w-7 h-7 bg-white dark:bg-[#0b142d] border border-slate-300 dark:border-[#1d305c] hover:bg-slate-100 dark:hover:bg-[#122248] text-slate-700 dark:text-slate-300 rounded-md flex items-center justify-center text-xs shadow-xs cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic SVG Visual Graph */}
        <svg 
          className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-200"
          viewBox="0 0 920 420"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Standard Blue Arrow */}
            <marker id="flow-arrow-blue" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
            </marker>

            {/* Emerald Arrow for Bridge */}
            <marker id="flow-arrow-emerald" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
            </marker>

            {/* Purple Arrow for Mixer */}
            <marker id="flow-arrow-purple" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#9333ea" />
            </marker>

            {/* Amber Arrow for Exchange */}
            <marker id="flow-arrow-amber" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706" />
            </marker>

            {/* Mixer Outflow Glow Filter */}
            <filter id="mixer-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Vertical Guide / Reservoir Inflow Lines */}
          <line x1="200" y1="0" x2="200" y2="160" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.3" />
          <line x1="350" y1="0" x2="350" y2="75" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.3" />
          <line x1="350" y1="330" x2="350" y2="420" stroke="#059669" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.3" />
          <line x1="520" y1="330" x2="520" y2="420" stroke="#059669" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.3" />

          {/* Mixer Equal-Volume Matching Box Highlight in background */}
          <rect 
            x="700" 
            y="215" 
            width="170" 
            height="185" 
            rx="8" 
            fill="#a855f7" 
            fillOpacity="0.05" 
            stroke="#a855f7" 
            strokeWidth="1.5" 
            strokeDasharray="4 4"
          />
          

          {/* Render Dynamic Edges */}
          {edges.map((e) => {
            const sourceNode = nodes.find(n => n.id === (e.from || e.source));
            const targetNode = nodes.find(n => n.id === (e.to || e.target));
            if (!sourceNode || !targetNode) return null;

            const midX = (sourceNode.x + targetNode.x) / 2;
            const midY = (sourceNode.y + targetNode.y) / 2;

            const isUSDT = e.token === 'USDT';
            const isBridgeSwap = Boolean(e.isBridge || e.isSwap || sourceNode.type === 'bridge' || targetNode.type === 'bridge');
            const isMixerFlow = Boolean(e.isMixer || sourceNode.type === 'mixer' || targetNode.type === 'mixer');
            const isMatchingMixer = Boolean(e.isMatching);

            // Determine connector color & style
            let strokeColor = "#2563eb";
            let markerId = "flow-arrow-blue";
            let strokeDash = "none";
            let strokeWidth = "2";

            if (isBridgeSwap) {
              strokeColor = "#059669";
              markerId = "flow-arrow-emerald";
              strokeDash = "6 3";
              strokeWidth = "2.5";
            } else if (isMatchingMixer) {
              strokeColor = "#9333ea";
              markerId = "flow-arrow-purple";
              strokeDash = "4 2";
              strokeWidth = "2.5";
            } else if (isMixerFlow) {
              strokeColor = "#9333ea";
              markerId = "flow-arrow-purple";
              strokeDash = "none";
            } else if (isUSDT) {
              strokeColor = "#059669";
              markerId = "flow-arrow-emerald";
              strokeDash = "4 2";
            }

            return (
              <g 
                key={e.id || `${e.from}-${e.to}`} 
                className="cursor-pointer group"
                onClick={() => {
                  const info = isMatchingMixer 
                    ? `Equal-Volume Outflow: ${e.amount} (Tornado Cash ➔ ${targetNode.label}). Pattern: Volume-based Time Window Pattern Analysis: Auto-detects equal-volume outflow wallets within the target time range.`
                    : isBridgeSwap
                    ? `Cross-Chain Swap: ${e.amount} via ${sourceNode.label}. Activity: ${e.swapLabel || "ETH ➔ Token Swap"}`
                    : `Transfer: ${e.amount} (${sourceNode.label} ➔ ${targetNode.label})`;
                  setActiveInspector(info);
                  onSelectNode(info);
                }}
              >
                {/* Visual Connector Line */}
                <line 
                  x1={sourceNode.x} 
                  y1={sourceNode.y} 
                  x2={targetNode.x} 
                  y2={targetNode.y} 
                  stroke={strokeColor} 
                  strokeWidth={strokeWidth} 
                  strokeDasharray={strokeDash}
                  markerEnd={`url(#${markerId})`} 
                  className={isMatchingMixer ? "animate-pulse" : ""}
                />

                {/* Amount / Swap Badge on Edge */}
                <rect 
                  x={midX - (isBridgeSwap ? 46 : 38)} 
                  y={midY - 9} 
                  width={isBridgeSwap ? 92 : 76} 
                  height={18} 
                  rx="4" 
                  fill="#ffffff" 
                  className="dark:fill-[#0b142d]"
                  stroke={strokeColor} 
                  strokeWidth={isMatchingMixer || isBridgeSwap ? 1.5 : 1}
                />

                <text 
                  x={midX} 
                  y={midY + 3} 
                  fill={strokeColor} 
                  className="dark:fill-slate-100"
                  fontSize="8.5" 
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {isBridgeSwap && e.swapLabel ? `🌉 ${e.amount}` : e.amount}
                </text>
              </g>
            );
          })}

          {/* Render Dynamic Nodes */}
          {nodes.map((node) => {
            const isSuspect = node.type === 'suspect';
            const isMixer = node.type === 'mixer';
            const isBridge = node.type === 'bridge';
            const isExchange = node.type === 'exchange';
            const isVictim = node.type === 'victim';

            const radius = isSuspect ? 26 : (isMixer || isBridge ? 24 : 20);

            return (
              <g 
                key={node.id} 
                className="cursor-pointer group"
                onClick={() => {
                  let infoString = `${node.label} (${node.address}) - Type: ${node.type.toUpperCase()}`;
                  if (isMixer) {
                    infoString += ` | Volume-based Time Window Pattern Analysis: Auto-detects equal-volume outflow wallets within the target time range.`;
                  } else if (isBridge) {
                    infoString += ` | Cross-Chain Routing: ${node.sourceChain || 'ETH'} ➔ ${node.destChain || 'POLYGON'} Liquidity Swap`;
                  }
                  setActiveInspector({
                    ...node,
                    infoString
                  });
                  onSelectNode(infoString);
                }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Special Outer Glow / Rings */}
                {isSuspect && (
                  <>
                    <circle cx={node.x} cy={node.y} r="32" fill="#dc2626" opacity="0.12" className="animate-ping" />
                    <circle cx={node.x} cy={node.y} r="28" fill="#dc2626" opacity="0.2" />
                  </>
                )}

                {isMixer && (
                  <>
                    <circle cx={node.x} cy={node.y} r="30" fill="none" stroke="#9333ea" strokeWidth="1.5" strokeDasharray="3 3" className="animate-spin" style={{ transformOrigin: `${node.x}px ${node.y}px`, animationDuration: '8s' }} />
                    <circle cx={node.x} cy={node.y} r="26" fill="#9333ea" opacity="0.1" />
                  </>
                )}

                {isBridge && (
                  <rect 
                    x={node.x - 28} 
                    y={node.y - 28} 
                    width="56" 
                    height="56" 
                    rx="12" 
                    fill="#059669" 
                    opacity="0.1" 
                    stroke="#059669" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 2"
                  />
                )}

                {/* Base Node Circle */}
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r={radius} 
                  fill="#ffffff" 
                  className="dark:fill-[#0c1a3b] transition-all group-hover:stroke-width-3"
                  stroke={node.color || "#2563eb"} 
                  strokeWidth={isSuspect || isMixer || isBridge ? 3 : 2}
                />

                {/* Center Node Icon / Badge */}
                {isMixer && (
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="12">🌪️</text>
                )}
                {isBridge && (
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="12">🌉</text>
                )}
                {isVictim && (
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="12">🛡️</text>
                )}
                {isExchange && (
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="12">🏛️</text>
                )}
                {isSuspect && (
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="12">🎯</text>
                )}
                {!isMixer && !isBridge && !isVictim && !isExchange && !isSuspect && (
                  <text 
                    x={node.x} 
                    y={node.y + 3} 
                    fill="#0f172a" 
                    className="dark:fill-white font-bold"
                    fontSize="8" 
                    textAnchor="middle"
                  >
                    {node.label.length > 8 ? node.label.substring(0, 7) + '..' : node.label}
                  </text>
                )}

                {/* Node Label Below */}
                <text 
                  x={node.x} 
                  y={node.y + (isSuspect ? 38 : (isMixer || isBridge ? 36 : 32))} 
                  fill="#0f172a" 
                  className="dark:fill-white"
                  fontSize="8.5" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  {node.label}
                </text>

                {/* Address or Chain Badge Below */}
                <text 
                  x={node.x} 
                  y={node.y + (isSuspect ? 48 : (isMixer || isBridge ? 46 : 42))} 
                  fill={node.color || "#64748b"} 
                  fontSize="7.5" 
                  fontWeight="semibold" 
                  textAnchor="middle"
                >
                  {isBridge ? `${node.sourceChain || 'ETH'} ➔ ${node.destChain || 'POLYGON'}` : node.address}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node / Edge Details Floating Tooltip */}
        {activeInspector && (
          <div className="absolute bottom-3 right-3 bg-white dark:bg-[#0b142d] border border-blue-400 dark:border-cyan-500 rounded-md p-3 text-xs shadow-xl animate-in fade-in max-w-sm z-20">
            <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-200 dark:border-[#1f3869]">
              <span className="text-[10px] text-blue-700 dark:text-cyan-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Info className="w-3 h-3" />
                Forensic Payload Inspector
              </span>
              <button 
                onClick={() => {
                  setActiveInspector(null);
                  onSelectNode(null);
                }} 
                className="text-[10px] text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {typeof activeInspector === 'string' ? (
              <span className="text-slate-800 dark:text-slate-200 font-mono text-[11px] block leading-relaxed">
                {activeInspector}
              </span>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 dark:text-white font-bold text-[12px]">{activeInspector.label}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    activeInspector.type === 'suspect' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                    activeInspector.type === 'mixer' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                    activeInspector.type === 'bridge' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    activeInspector.type === 'exchange' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {activeInspector.type}
                  </span>
                </div>

                <div className="font-mono text-blue-700 dark:text-cyan-300 text-[10px] break-all">
                  {activeInspector.fullAddress || activeInspector.address}
                </div>

                {activeInspector.type === 'mixer' && (
                  <div className="p-1.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 rounded text-[10px] text-purple-900 dark:text-purple-200 font-medium">
                    ⚡ <strong>Volume-based Time Window Pattern Analysis:</strong> Auto-detects equal-volume outflow wallets within the target time range.
                  </div>
                )}

                {activeInspector.type === 'bridge' && (
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded text-[10px] text-emerald-900 dark:text-emerald-200 font-medium">
                    🌉 <strong>Cross-Chain Swap:</strong> {activeInspector.sourceChain || 'ETH'} ➔ {activeInspector.destChain || 'POLYGON'}. Smart contract lock-and-mint bridge transaction.
                  </div>
                )}

                {activeInspector.fullAddress && (
                  <button
                    onClick={() => copyToClipboard(activeInspector.fullAddress)}
                    className="mt-1 w-full py-1 bg-slate-100 hover:bg-slate-200 dark:bg-[#122248] dark:hover:bg-[#192f63] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#203c74] rounded text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied!" : "Copy Full Address"}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { FlowGraph as WalletGraph };
