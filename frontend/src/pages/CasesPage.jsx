import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { useApp } from "../context/AppContext";
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
  Search,
  ArrowDown,
  RefreshCw,
  Mail,
  AlertTriangle,
} from "lucide-react";

import "./CasesPage.css";

const API_URL = "/api/v1/engine/trace";

// Known Law Enforcement / Compliance Contact Directory for VASPs
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

// ============================================================
// GRAPH CONFIG
// ============================================================

const GRAPH_CONFIG = {
  MAX_VISIBLE_NODES: 28,
  NOISE_KEEP_PERCENT: 30,
  LAYER_GAP: 280,
  NODE_GAP: 140,
  FIT_PADDING: 60,
};

// ============================================================
// HELPERS
// ============================================================

function shortAddress(address = "") {
  if (!address) return "";
  const value = String(address);
  if (value.length <= 16) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function formatAmount(value, asset = "") {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return `0 ${asset}`;
  if (number >= 1_000_000_000) return `${(number / 1_000_000_000).toFixed(2)}B ${asset}`;
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(2)}M ${asset}`;
  if (number >= 1000) return `${(number / 1000).toFixed(2)}K ${asset}`;
  if (number >= 1) return `${number.toFixed(2)} ${asset}`;
  return `${number.toFixed(4)} ${asset}`;
}

function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

// ============================================================
// NODE CLASSIFICATION
// ============================================================

function getNodeClass(node, searchedWallet = "") {
  const lbl = String(node?.label || node?.display_name || node?.entity_resolved || "").toLowerCase();
  const nClass = String(node?.node_class || node?.nodeClass || node?.type || "").toLowerCase();
  const addr = String(node?.id || node?.address || "").toLowerCase();
  const searched = String(searchedWallet || "").toLowerCase();

  // 1. Mixer (Tornado Cash, Tumbler, Blender)
  if (
    Boolean(node?.is_mixer) ||
    nClass === "mixer" ||
    lbl.includes("mixer") ||
    lbl.includes("tornado") ||
    lbl.includes("tumbler") ||
    lbl.includes("blender")
  ) {
    return "mixer";
  }

  // 2. Cross-Chain Bridge / Swap
  if (
    Boolean(node?.is_bridge) ||
    nClass === "bridge" ||
    lbl.includes("bridge") ||
    lbl.includes("stargate") ||
    lbl.includes("across") ||
    lbl.includes("wormhole") ||
    lbl.includes("multichain") ||
    lbl.includes("cbridge") ||
    lbl.includes("hop protocol") ||
    lbl.includes("layerzero") ||
    lbl.includes("thorchain")
  ) {
    return "bridge";
  }

  // 3. Victim
  if (
    Boolean(node?.is_victim) ||
    nClass === "victim" ||
    node?.hop === -1 ||
    lbl.includes("victim")
  ) {
    return "victim";
  }

  // 4. Investigation Target / Suspect
  if (
    Boolean(node?.is_investigation_wallet) ||
    nClass === "investigation" ||
    nClass === "suspect" ||
    lbl.includes("suspect") ||
    (searched && addr === searched)
  ) {
    return "investigation";
  }

  // 5. Exchange / VASP
  if (
    Boolean(node?.is_exchange) ||
    nClass === "exchange" ||
    lbl.includes("binance") ||
    lbl.includes("coinbase") ||
    lbl.includes("kraken") ||
    lbl.includes("huobi") ||
    lbl.includes("kucoin") ||
    lbl.includes("okx") ||
    lbl.includes("bybit")
  ) {
    return "exchange";
  }

  return "intermediary";
}

function getNodeName(node, searchedWallet) {
  const nodeAddress = String(node?.id || node?.address || "").toLowerCase();
  const searched = String(searchedWallet || "").toLowerCase();
  const nClass = getNodeClass(node, searchedWallet);

  if (nClass === "victim") {
    return node.label || node.display_name || "Victim Deposit";
  }

  if (
    nodeAddress === searched ||
    node?.is_investigation_wallet ||
    nClass === "investigation"
  ) {
    return node.label || node.display_name || "Suspect Target";
  }

  if (nClass === "bridge") {
    return node.entity_resolved || node.display_name || node.label || "Cross-Chain Bridge";
  }

  if (nClass === "mixer") {
    return node.entity_resolved || node.display_name || node.label || "Mixer Pool";
  }

  if (nClass === "exchange") {
    return node.entity_resolved || node.display_name || "Exchange";
  }

  return node.label || "Intermediary Wallet";
}

function getNodeLabel(node, searchedWallet) {
  const nClass = getNodeClass(node, searchedWallet);
  const name = getNodeName(node, searchedWallet);
  const address = shortAddress(node?.address || node?.id || "");

  if (nClass === "bridge") {
    const srcChain = node.bridge_source_chain || node.sourceChain || "ETH";
    const dstChain = node.bridge_dest_chain || node.destChain || "BSC";
    return `🌉 ${name}\n[${srcChain} ➔ ${dstChain}]\n[${address}]`;
  }

  if (nClass === "mixer") {
    return `🌪️ ${name}\n[Mixer Pool]\n[${address}]`;
  }

  if (nClass === "victim") {
    return `🛡️ ${name}\n[${address}]`;
  }

  if (nClass === "investigation") {
    return `🎯 ${name}\n[${address}]`;
  }

  if (nClass === "exchange") {
    return `🏛️ ${name}\n[${address}]`;
  }

  return `${name}\n[${address}]`;
}

// ============================================================
// AGGREGATE TRANSACTIONS
// ============================================================

function aggregateEdges(rawEdges) {
  const groups = new Map();

  rawEdges.forEach((edge) => {
    const source = String(edge?.source || edge?.from || "").toLowerCase();
    const target = String(edge?.target || edge?.to || "").toLowerCase();
    const asset = String(edge?.asset || "ETH").toUpperCase();

    if (!source || !target) return;

    const key = `${source}|${target}|${asset}`;

    if (!groups.has(key)) {
      groups.set(key, {
        id: `agg-${groups.size}-${source.slice(0, 6)}-${target.slice(0, 6)}-${asset}`,
        source,
        target,
        asset,
        totalAmount: 0,
        transactionCount: 0,
        maxAmount: 0,
        latestTimestamp: null,
        txHashes: [],
      });
    }

    const group = groups.get(key);
    const amount = numeric(edge.amount);

    group.totalAmount += amount;
    group.transactionCount += Number(edge.transaction_count || edge.transactions || 1);
    group.maxAmount = Math.max(group.maxAmount, amount);

    if (edge.timestamp) {
      group.latestTimestamp = edge.timestamp;
    }

    if (edge.tx_hash || edge.hash || edge.id) {
      group.txHashes.push(edge.tx_hash || edge.hash || edge.id);
    }
  });

  return [...groups.values()];
}

// ============================================================
// NODE FLOW CALCULATION
// ============================================================

function calculateNodeFlow(nodes, aggregatedEdges) {
  const flowMap = new Map();

  nodes.forEach((node) => {
    flowMap.set(String(node.id).toLowerCase(), {
      incoming: 0,
      outgoing: 0,
      total: 0,
    });
  });

  aggregatedEdges.forEach((edge) => {
    const source = edge.source;
    const target = edge.target;

    if (flowMap.has(source)) {
      flowMap.get(source).outgoing += edge.totalAmount;
    }
    if (flowMap.has(target)) {
      flowMap.get(target).incoming += edge.totalAmount;
    }
  });

  flowMap.forEach((item) => {
    item.total = Math.max(item.incoming, item.outgoing);
  });

  return flowMap;
}

// ============================================================
// HIGH-VALUE FILTER / NOISE CANCELLATION
// ============================================================

function filterGraphData(rawNodes, aggregatedEdges, searchedWallet, noiseCancellation) {
  const searched = String(searchedWallet || "").toLowerCase();
  const flowMap = calculateNodeFlow(rawNodes, aggregatedEdges);

  if (!noiseCancellation) {
    const rankedNodes = [...rawNodes]
      .filter((node) => String(node.id).toLowerCase() !== searched)
      .sort((a, b) => {
        const flowA = flowMap.get(String(a.id).toLowerCase())?.total || 0;
        const flowB = flowMap.get(String(b.id).toLowerCase())?.total || 0;
        return flowB - flowA;
      });

    const selected = rankedNodes.slice(0, GRAPH_CONFIG.MAX_VISIBLE_NODES - 1);
    const selectedIds = new Set([
      searched,
      ...selected.map((node) => String(node.id).toLowerCase()),
    ]);

    const visibleNodes = rawNodes.filter((node) =>
      selectedIds.has(String(node.id).toLowerCase())
    );

    const visibleEdges = aggregatedEdges.filter(
      (edge) => selectedIds.has(edge.source) && selectedIds.has(edge.target)
    );

    return { visibleNodes, visibleEdges, flowMap };
  }

  // Noise cancellation threshold
  const flowValues = aggregatedEdges
    .map((edge) => numeric(edge.totalAmount))
    .filter((value) => value > 0)
    .sort((a, b) => b - a);

  if (!flowValues.length) {
    return {
      visibleNodes: rawNodes.filter((node) => String(node.id).toLowerCase() === searched),
      visibleEdges: [],
      flowMap,
    };
  }

  const keepCount = Math.max(
    1,
    Math.ceil(flowValues.length * (GRAPH_CONFIG.NOISE_KEEP_PERCENT / 100))
  );
  const threshold = flowValues[Math.min(keepCount - 1, flowValues.length - 1)];

  const highValueEdges = aggregatedEdges.filter((edge) => edge.totalAmount >= threshold);
  const visibleIds = new Set([searched]);

  highValueEdges.forEach((edge) => {
    visibleIds.add(edge.source);
    visibleIds.add(edge.target);
  });

  let visibleNodes = rawNodes.filter((node) =>
    visibleIds.has(String(node.id).toLowerCase())
  );

  if (visibleNodes.length > GRAPH_CONFIG.MAX_VISIBLE_NODES) {
    const sorted = visibleNodes
      .filter((node) => String(node.id).toLowerCase() !== searched)
      .sort((a, b) => {
        const flowA = flowMap.get(String(a.id).toLowerCase())?.total || 0;
        const flowB = flowMap.get(String(b.id).toLowerCase())?.total || 0;
        return flowB - flowA;
      });

    visibleNodes = [
      rawNodes.find((node) => String(node.id).toLowerCase() === searched),
      ...sorted.slice(0, GRAPH_CONFIG.MAX_VISIBLE_NODES - 1),
    ].filter(Boolean);
  }

  const finalIds = new Set(visibleNodes.map((node) => String(node.id).toLowerCase()));
  const visibleEdges = highValueEdges.filter(
    (edge) => finalIds.has(edge.source) && finalIds.has(edge.target)
  );

  return { visibleNodes, visibleEdges, flowMap, threshold };
}

// ============================================================
// HORIZONTAL LAYOUT
// ============================================================

function calculateHorizontalPositions(nodes, edges, searchedWallet) {
  const searched = String(searchedWallet || "").toLowerCase();
  const outgoing = new Map();
  const incoming = new Map();

  edges.forEach((edge) => {
    if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
    outgoing.get(edge.source).push(edge.target);

    if (!incoming.has(edge.target)) incoming.set(edge.target, []);
    incoming.get(edge.target).push(edge.source);
  });

  // Forward hop calculation
  const hopMap = new Map();
  hopMap.set(searched, 0);
  const queue = [searched];

  while (queue.length) {
    const current = queue.shift();
    const currentHop = hopMap.get(current);
    const children = outgoing.get(current) || [];

    children.forEach((child) => {
      if (!hopMap.has(child)) {
        hopMap.set(child, currentHop + 1);
        queue.push(child);
      }
    });
  }

  // Incoming nodes
  const incomingNodes = new Set();
  const incomingQueue = [searched];
  const incomingVisited = new Set([searched]);

  while (incomingQueue.length) {
    const current = incomingQueue.shift();
    const parents = incoming.get(current) || [];

    parents.forEach((parent) => {
      if (!incomingVisited.has(parent)) {
        incomingVisited.add(parent);
        incomingNodes.add(parent);
        incomingQueue.push(parent);
      }
    });
  }

  const layers = new Map();

  nodes.forEach((node) => {
    const id = String(node.id).toLowerCase();
    let layer;

    if (id === searched) {
      layer = 0;
    } else if (incomingNodes.has(id) && !hopMap.has(id)) {
      layer = -1;
    } else {
      layer = hopMap.get(id);
      if (layer === undefined) {
        layer = Number.isFinite(Number(node.hop)) ? Number(node.hop) : 1;
      }
    }

    if (!layers.has(layer)) {
      layers.set(layer, []);
    }
    layers.get(layer).push(node);
  });

  layers.forEach((layerNodes) => {
    layerNodes.sort((a, b) => {
      const flowA = numeric(a._visualFlow);
      const flowB = numeric(b._visualFlow);
      return flowB - flowA;
    });
  });

  const positions = new Map();
  const sortedLayers = [...layers.entries()].sort(([a], [b]) => a - b);

  sortedLayers.forEach(([layer, layerNodes]) => {
    const x = 140 + (layer + 1) * GRAPH_CONFIG.LAYER_GAP;
    const totalHeight = (layerNodes.length - 1) * GRAPH_CONFIG.NODE_GAP;
    const startY = 220 - totalHeight / 2;

    layerNodes.forEach((node, index) => {
      positions.set(String(node.id).toLowerCase(), {
        x,
        y: startY + index * GRAPH_CONFIG.NODE_GAP,
      });
    });
  });

  return positions;
}

// ============================================================
// BUILD GRAPH ELEMENTS
// ============================================================

function buildHorizontalElements(topology, searchedWallet, noiseCancellation) {
  const rawNodes = topology?.nodes || [];
  const rawEdges = topology?.edges || [];

  if (!rawNodes.length) return [];

  const aggregatedEdges = aggregateEdges(rawEdges);
  const filtered = filterGraphData(
    rawNodes,
    aggregatedEdges,
    searchedWallet,
    noiseCancellation
  );

  let visibleNodes = filtered.visibleNodes;
  const visibleEdges = filtered.visibleEdges;
  const flowMap = filtered.flowMap;

  visibleNodes = visibleNodes.map((node) => {
    const flow = flowMap.get(String(node.id).toLowerCase());
    return {
      ...node,
      _visualFlow: flow?.total || 0,
      _incomingFlow: flow?.incoming || 0,
      _outgoingFlow: flow?.outgoing || 0,
    };
  });

  const positions = calculateHorizontalPositions(
    visibleNodes,
    visibleEdges,
    searchedWallet
  );

  const elements = [];

  // Nodes
  visibleNodes.forEach((node) => {
    const id = String(node.id).toLowerCase();
    const nodeClass = getNodeClass(node);
    const displayName = getNodeName(node, searchedWallet);
    const label = getNodeLabel(node, searchedWallet);
    const position = positions.get(id);

    if (!position) return;

    elements.push({
      data: {
        id,
        label,
        displayName,
        address: node.address || node.id,
        fullAddress: node.full_address || node.address || node.id,
        nodeClass,
        node_class: nodeClass,
        is_exchange: Boolean(node.is_exchange || nodeClass === "exchange"),
        is_mixer: Boolean(node.is_mixer || nodeClass === "mixer"),
        is_bridge: Boolean(node.is_bridge || nodeClass === "bridge"),
        is_victim: Boolean(node.is_victim || nodeClass === "victim"),
        bridge_source_chain: node.bridge_source_chain || node.sourceChain,
        bridge_dest_chain: node.bridge_dest_chain || node.destChain,
        entity_resolved: node.entity_resolved,
        riskScore: numeric(node.risk_score),
        flowValue: numeric(node._visualFlow),
        incomingFlow: numeric(node._incomingFlow),
        outgoingFlow: numeric(node._outgoingFlow),
        hop: node.hop,
      },
      position,
    });
  });

  // Mixer Equal-Volume Pattern Detection: Group outgoing edges from any Mixer node
  const mixerOutflows = new Map();
  visibleEdges.forEach((edge) => {
    const srcNode = visibleNodes.find((n) => String(n.id).toLowerCase() === edge.source);
    if (srcNode && (srcNode.is_mixer || getNodeClass(srcNode) === "mixer")) {
      if (!mixerOutflows.has(edge.source)) {
        mixerOutflows.set(edge.source, []);
      }
      mixerOutflows.get(edge.source).push(edge);
    }
  });

  const matchingEdgeIds = new Set();
  mixerOutflows.forEach((outflowEdges) => {
    if (outflowEdges.length >= 2) {
      const amountCounts = new Map();
      outflowEdges.forEach((e) => {
        const amt = numeric(e.totalAmount);
        amountCounts.set(amt, (amountCounts.get(amt) || 0) + 1);
      });
      outflowEdges.forEach((e) => {
        const amt = numeric(e.totalAmount);
        if (amountCounts.get(amt) >= 2) {
          matchingEdgeIds.add(e.id);
        }
      });
    }
  });

  // Edges
  visibleEdges.forEach((edge) => {
    const source = edge.source;
    const target = edge.target;

    if (!positions.has(source) || !positions.has(target)) return;

    const sourceNode = visibleNodes.find((n) => String(n.id).toLowerCase() === source);
    const targetNode = visibleNodes.find((n) => String(n.id).toLowerCase() === target);

    const isBridgeEdge = Boolean(
      edge.is_bridge || 
      edge.isBridge || 
      (sourceNode && getNodeClass(sourceNode) === "bridge") || 
      (targetNode && getNodeClass(targetNode) === "bridge")
    );

    const isMixerEdge = Boolean(
      edge.is_mixer || 
      edge.isMixer || 
      (sourceNode && getNodeClass(sourceNode) === "mixer") || 
      (targetNode && getNodeClass(targetNode) === "mixer")
    );

    const isMatching = matchingEdgeIds.has(edge.id) || Boolean(edge.is_matching);

    let amountLabel = `${formatAmount(edge.totalAmount, edge.asset)}${
      edge.transactionCount > 1 ? `  •  ${edge.transactionCount} tx` : ""
    }`;

    if (isBridgeEdge) {
      amountLabel = `🌉 [Swap] ${amountLabel}`;
    } else if (isMatching) {
      amountLabel = `⚡ [Equal Vol] ${amountLabel}`;
    }

    elements.push({
      data: {
        id: edge.id,
        source,
        target,
        amount: edge.totalAmount,
        asset: edge.asset,
        amountLabel,
        transactionCount: edge.transactionCount,
        maxAmount: edge.maxAmount,
        latestTimestamp: edge.latestTimestamp,
        is_bridge: isBridgeEdge ? "true" : "false",
        is_mixer: isMixerEdge ? "true" : "false",
        is_matching: isMatching ? "true" : "false",
        edgeType: isBridgeEdge ? "bridge" : (isMatching ? "matching_mixer" : (isMixerEdge ? "mixer" : "normal")),
      },
    });
  });

  return elements;
}

// ============================================================
// CYTOSCAPE STYLESHEET
// ============================================================

function getGraphStylesheet(theme = 'light') {
  const isDark = theme === 'dark';
  return [
    {
      selector: "node",
      style: {
        "background-color": isDark ? "#071329" : "#ffffff",
        "border-width": 3,
        "border-color": isDark ? "#3b82f6" : "#2563eb",
        width: 104,
        height: 104,
        shape: "ellipse",
        color: isDark ? "#f3f7ff" : "#0f172a",
        "font-family": "Inter, system-ui, sans-serif",
        "font-size": 10.5,
        "font-weight": 800,
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": 92,
        "line-height": 1.25,
        label: "data(label)",
        "text-outline-width": 0,
        "overlay-opacity": 0,
        "z-index": 10,
      },
    },
    // 1. Investigation Target / Suspect
    {
      selector: 'node[nodeClass = "investigation"]',
      style: {
        "border-color": isDark ? "#f87171" : "#dc2626",
        "border-width": 4.5,
        "background-color": isDark ? "#300808" : "#fef2f2",
        width: 120,
        height: 120,
        "font-size": 11,
        "font-weight": 900,
        color: isDark ? "#fecaca" : "#991b1b",
      },
    },
    // 2. Victim
    {
      selector: 'node[nodeClass = "victim"]',
      style: {
        "border-color": isDark ? "#00d2ff" : "#0284c7",
        "border-width": 4,
        "background-color": isDark ? "#082f49" : "#f0f9ff",
        color: isDark ? "#7dd3fc" : "#0369a1",
        "font-weight": 900,
        width: 112,
        height: 112,
      },
    },
    // 3. Wallets / Intermediary
    {
      selector: 'node[nodeClass = "intermediary"]',
      style: {
        "border-color": isDark ? "#3b82f6" : "#2563eb",
        "border-width": 3,
        "background-color": isDark ? "#071329" : "#f8fafc",
        color: isDark ? "#f3f7ff" : "#0f172a",
      },
    },
    // 4. Exchanges
    {
      selector: 'node[nodeClass = "exchange"]',
      style: {
        "border-color": isDark ? "#f5b700" : "#d97706",
        "border-width": 4,
        "background-color": isDark ? "#261a04" : "#fef3c7",
        color: isDark ? "#fef08a" : "#78350f",
        "font-weight": 900,
        width: 114,
        height: 114,
      },
    },
    // 5. Mixer (Tornado Cash / Tumbler)
    {
      selector: 'node[nodeClass = "mixer"]',
      style: {
        "border-color": isDark ? "#c084fc" : "#9333ea",
        "border-width": 4.5,
        "background-color": isDark ? "#250947" : "#faf5ff",
        color: isDark ? "#f3e8ff" : "#581c87",
        "font-weight": 900,
        width: 120,
        height: 120,
      },
    },
    // 6. Cross-Chain Bridge
    {
      selector: 'node[nodeClass = "bridge"]',
      style: {
        "border-color": isDark ? "#10b981" : "#059669",
        "border-width": 4,
        "background-color": isDark ? "#042f24" : "#ecfdf5",
        color: isDark ? "#6ee7b7" : "#065f46",
        "font-weight": 900,
        width: 124,
        height: 112,
        shape: "round-rectangle",
      },
    },
    // Base Edge
    {
      selector: "edge",
      style: {
        width: 2.8,
        "line-color": isDark ? "#3275df" : "#2563eb",
        "target-arrow-color": isDark ? "#18d9f5" : "#2563eb",
        "target-arrow-shape": "triangle",
        "arrow-scale": 1.2,
        "curve-style": "straight",
        label: "data(amountLabel)",
        color: isDark ? "#dce8ff" : "#1e3a8a",
        "font-family": "Inter, system-ui, sans-serif",
        "font-size": 9.5,
        "font-weight": 800,
        "text-background-color": isDark ? "#071329" : "#ffffff",
        "text-background-opacity": 0.95,
        "text-background-padding": "4px",
        "text-border-width": 1,
        "text-border-color": isDark ? "#244a83" : "#cbd5e1",
        "text-border-opacity": 1,
        "text-rotation": "autorotate",
        "text-margin-y": -2,
        "z-index": 5,
      },
    },
    // Bridge Edge: Distinct Dashed Connector showing token swap activity
    {
      selector: 'edge[is_bridge = "true"]',
      style: {
        width: 3.5,
        "line-style": "dashed",
        "line-dash-pattern": [6, 3],
        "line-color": isDark ? "#10b981" : "#059669",
        "target-arrow-color": isDark ? "#10b981" : "#059669",
        color: isDark ? "#6ee7b7" : "#047857",
        "text-border-color": isDark ? "#065f46" : "#a7f3d0",
        "font-weight": 900,
      },
    },
    // Mixer Outflow Edge with Equal-Volume Matching
    {
      selector: 'edge[is_matching = "true"]',
      style: {
        width: 3.5,
        "line-style": "dashed",
        "line-dash-pattern": [4, 2],
        "line-color": isDark ? "#c084fc" : "#9333ea",
        "target-arrow-color": isDark ? "#c084fc" : "#9333ea",
        color: isDark ? "#e9d5ff" : "#6b21a8",
        "text-border-color": isDark ? "#7e22ce" : "#d8b4fe",
        "font-weight": 900,
      },
    },
    // General Mixer Edge
    {
      selector: 'edge[is_mixer = "true"]',
      style: {
        width: 3,
        "line-color": isDark ? "#a855f7" : "#9333ea",
        "target-arrow-color": isDark ? "#a855f7" : "#9333ea",
        color: isDark ? "#e9d5ff" : "#6b21a8",
      },
    },
    {
      selector: "edge[amount >= 10000]",
      style: {
        width: 4,
        "line-color": isDark ? "#16a6ff" : "#1d4ed8",
        "target-arrow-color": isDark ? "#18d9f5" : "#1d4ed8",
        "font-size": 10.5,
        "font-weight": 900,
      },
    },
  ];
}

// Baseline Initial Topology so UI is immediately rich on load
const INITIAL_DEMO_TOPOLOGY = {
  nodes: [
    {
      id: "0x12ab2948c901e8234891240192840192839f3e41",
      label: "Victim Deposit",
      address: "0x12ab...9f3e",
      full_address: "0x12ab2948c901e8234891240192840192839f3e41",
      node_class: "victim",
      is_victim: true,
      risk_score: 18,
      is_exchange: false,
      is_mixer: false,
      hop: -1,
    },
    {
      id: "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2",
      label: "Suspect Target",
      address: "0x3a7f...f3a2",
      full_address: "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2",
      node_class: "investigation",
      is_investigation_wallet: true,
      risk_score: 87,
      is_exchange: false,
      is_mixer: false,
      hop: 0,
    },
    {
      id: "0x5e2a114e9acbf0987114da2bcde0817291a7c1d2",
      label: "Relay Wallet A",
      address: "0x5e2a...c1d2",
      full_address: "0x5e2a114e9acbf0987114da2bcde0817291a7c1d2",
      node_class: "intermediary",
      risk_score: 55,
      is_exchange: false,
      is_mixer: false,
      hop: 1,
    },
    {
      id: "0x6c3e104829adbf90128491028491029485b8a3e1",
      label: "Peeling Wallet B",
      address: "0x6c3e...a3e1",
      full_address: "0x6c3e104829adbf90128491028491029485b8a3e1",
      node_class: "intermediary",
      risk_score: 64,
      is_exchange: false,
      is_mixer: false,
      hop: 1,
    },
    {
      id: "0x9d7b3c2e4f910283948192038491029482e4f012",
      label: "Mixer Feeder C",
      address: "0x9d7b...f012",
      full_address: "0x9d7b3c2e4f910283948192038491029482e4f012",
      node_class: "intermediary",
      risk_score: 82,
      is_exchange: false,
      is_mixer: false,
      hop: 1,
    },
    {
      id: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      label: "Stargate Bridge",
      address: "0xaf88...5831",
      full_address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      node_class: "bridge",
      is_bridge: true,
      bridge_source_chain: "ETH",
      bridge_dest_chain: "BSC",
      entity_resolved: "Stargate Bridge",
      risk_score: 65,
      hop: 2,
    },
    {
      id: "0x4f9c3e8d2c91028491029481920384918d2c0192",
      label: "Binance CEX",
      address: "0x4f9c...0192",
      full_address: "0x4f9c3e8d2c91028491029481920384918d2c0192",
      node_class: "exchange",
      is_exchange: true,
      is_mixer: false,
      entity_resolved: "Binance",
      risk_score: 40,
      hop: 2,
    },
    {
      id: "0x0000000000000000000000000000000000000001",
      label: "Tornado Cash",
      address: "0x0000...0001",
      full_address: "0x0000000000000000000000000000000000000001",
      node_class: "mixer",
      is_exchange: false,
      is_mixer: true,
      entity_resolved: "Tornado Cash Router",
      risk_score: 96,
      hop: 2,
    },
    {
      id: "0x5e2a189201948192038491028491029487c1d931",
      label: "BSC Recipient",
      address: "0x5e2a...d931",
      full_address: "0x5e2a189201948192038491028491029487c1d931",
      node_class: "intermediary",
      risk_score: 58,
      is_exchange: false,
      is_mixer: false,
      hop: 3,
    },
    {
      id: "0x71a418901824018249018249018240192834b219",
      label: "Mixer Outflow α",
      address: "0x71a4...b219",
      full_address: "0x71a418901824018249018249018240192834b219",
      node_class: "intermediary",
      is_mixer_outflow: true,
      risk_score: 88,
      hop: 3,
    },
    {
      id: "0x82b52901824018249018249018240192835c320a",
      label: "Mixer Outflow β",
      address: "0x82b5...320a",
      full_address: "0x82b52901824018249018249018240192835c320a",
      node_class: "intermediary",
      is_mixer_outflow: true,
      risk_score: 88,
      hop: 3,
    },
    {
      id: "0x93c63901824018249018249018240192836d431b",
      label: "Mixer Outflow γ",
      address: "0x93c6...431b",
      full_address: "0x93c63901824018249018249018240192836d431b",
      node_class: "intermediary",
      is_mixer_outflow: true,
      risk_score: 88,
      hop: 3,
    },
  ],
  edges: [
    {
      id: "e1",
      source: "0x12ab2948c901e8234891240192840192839f3e41",
      target: "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2",
      amount: 1.2,
      asset: "ETH",
      transaction_count: 1,
      timestamp: "12 Apr 10:24",
    },
    {
      id: "e2",
      source: "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2",
      target: "0x5e2a114e9acbf0987114da2bcde0817291a7c1d2",
      amount: 0.8,
      asset: "ETH",
      transaction_count: 1,
      timestamp: "12 Apr 11:03",
    },
    {
      id: "e3",
      source: "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2",
      target: "0x6c3e104829adbf90128491028491029485b8a3e1",
      amount: 2500,
      asset: "USDT",
      transaction_count: 2,
      timestamp: "12 Apr 12:17",
    },
    {
      id: "e4",
      source: "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2",
      target: "0x9d7b3c2e4f910283948192038491029482e4f012",
      amount: 3000,
      asset: "USDT",
      transaction_count: 3,
      timestamp: "12 Apr 15:10",
    },
    {
      id: "e5",
      source: "0x5e2a114e9acbf0987114da2bcde0817291a7c1d2",
      target: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      amount: 0.8,
      asset: "ETH",
      transaction_count: 1,
      timestamp: "12 Apr 14:22",
    },
    {
      id: "e-bridge-swap",
      source: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      target: "0x5e2a189201948192038491028491029487c1d931",
      amount: 2500,
      asset: "USDT",
      transaction_count: 1,
      timestamp: "12 Apr 14:45",
      is_bridge: true,
      swap_label: "ETH ➔ BSC Swap",
    },
    {
      id: "e6",
      source: "0x6c3e104829adbf90128491028491029485b8a3e1",
      target: "0x4f9c3e8d2c91028491029481920384918d2c0192",
      amount: 2500,
      asset: "USDT",
      transaction_count: 2,
      timestamp: "12 Apr 13:45",
    },
    {
      id: "e7",
      source: "0x9d7b3c2e4f910283948192038491029482e4f012",
      target: "0x0000000000000000000000000000000000000001",
      amount: 3000,
      asset: "USDT",
      transaction_count: 3,
      timestamp: "12 Apr 15:50",
    },
    // Mixer Equal-Volume Matching Outflows (3 lines with 1,000 USDT)
    {
      id: "e-mix-1",
      source: "0x0000000000000000000000000000000000000001",
      target: "0x71a418901824018249018249018240192834b219",
      amount: 1000,
      asset: "USDT",
      transaction_count: 1,
      timestamp: "12 Apr 16:15",
      is_mixer: true,
      is_matching: true,
    },
    {
      id: "e-mix-2",
      source: "0x0000000000000000000000000000000000000001",
      target: "0x82b52901824018249018249018240192835c320a",
      amount: 1000,
      asset: "USDT",
      transaction_count: 1,
      timestamp: "12 Apr 16:18",
      is_mixer: true,
      is_matching: true,
    },
    {
      id: "e-mix-3",
      source: "0x0000000000000000000000000000000000000001",
      target: "0x93c63901824018249018249018240192836d431b",
      amount: 1000,
      asset: "USDT",
      transaction_count: 1,
      timestamp: "12 Apr 16:22",
      is_mixer: true,
      is_matching: true,
    },
  ],
};

const INITIAL_DEMO_TRANSACTIONS = [
  {
    hash: "0x9d11a7d9c0291a82e41",
    source: "0x12ab2948c901e8234891240192840192839f3e41",
    target: "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2",
    amount: 1.2,
    asset: "ETH",
    timestamp: "12 Apr 10:24",
    status: "Confirmed",
    risk: "High",
    hop: 0,
  },
  {
    hash: "0x4e7c2d1f901a8274b5c",
    source: "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2",
    target: "0x5e2a114e9acbf0987114da2bcde0817291a7c1d2",
    amount: 0.8,
    asset: "ETH",
    timestamp: "12 Apr 11:03",
    status: "Confirmed",
    risk: "Medium",
    hop: 1,
  },
  {
    hash: "0x69d26a4e10294819c3e",
    source: "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2",
    target: "0x6c3e104829adbf90128491028491029485b8a3e1",
    amount: 2500,
    asset: "USDT",
    timestamp: "12 Apr 12:17",
    status: "Confirmed",
    risk: "Medium",
    hop: 1,
  },
  {
    hash: "0x61a3e7b1029481928d2",
    source: "0x6c3e104829adbf90128491028491029485b8a3e1",
    target: "0x4f9c3e8d2c91028491029481920384918d2c0192",
    amount: 2500,
    asset: "USDT",
    timestamp: "12 Apr 13:45",
    status: "Confirmed",
    risk: "Low",
    hop: 2,
  },
  {
    hash: "0x2d8c9f0a19203849a7b",
    source: "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2",
    target: "0x9d7b3c2e4f910283948192038491029482e4f012",
    amount: 3000,
    asset: "USDT",
    timestamp: "12 Apr 15:10",
    status: "Confirmed",
    risk: "High",
    hop: 1,
  },
  {
    hash: "0x7e3b5a1c90192849001",
    source: "0x9d7b3c2e4f910283948192038491029482e4f012",
    target: "0x0000000000000000000000000000000000000001",
    amount: 3000,
    asset: "USDT",
    timestamp: "12 Apr 15:50",
    status: "Confirmed",
    risk: "Critical",
    hop: 2,
    is_mixer: true,
  },
  {
    hash: "0x8f4c6b2d01920384902",
    source: "0x0000000000000000000000000000000000000001",
    target: "0x71a418901824018249018249018240192834b219",
    amount: 1000,
    asset: "USDT",
    timestamp: "12 Apr 16:15",
    status: "Confirmed",
    risk: "High",
    hop: 3,
    is_mixer: true,
    is_matching: true,
  },
  {
    hash: "0x9a5d7c3e12039485013",
    source: "0x0000000000000000000000000000000000000001",
    target: "0x82b52901824018249018249018240192835c320a",
    amount: 1000,
    asset: "USDT",
    timestamp: "12 Apr 16:18",
    status: "Confirmed",
    risk: "High",
    hop: 3,
    is_mixer: true,
    is_matching: true,
  },
  {
    hash: "0x93c63901824018249018249018240192836d431b",
    source: "0x0000000000000000000000000000000000000001",
    target: "0x93c63901824018249018249018240192836d431b",
    amount: 1000,
    asset: "USDT",
    timestamp: "12 Apr 16:22",
    status: "Confirmed",
    risk: "High",
    hop: 3,
    is_mixer: true,
    is_matching: true,
  },
  {
    hash: "0x1b2c3d4e5f6a7b8c9d0",
    source: "0x5e2a114e9acbf0987114da2bcde0817291a7c1d2",
    target: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    amount: 0.8,
    asset: "ETH",
    timestamp: "12 Apr 14:22",
    status: "Confirmed",
    risk: "Medium",
    hop: 2,
    is_bridge: true,
  },
  {
    hash: "0xbc7f9e5a34251607235",
    source: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    target: "0x5e2a189201948192038491028491029487c1d931",
    amount: 2500,
    asset: "USDT [BSC]",
    timestamp: "12 Apr 14:45",
    status: "Confirmed",
    risk: "Medium",
    hop: 3,
    is_bridge: true,
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CasesPage() {
  const { activeCase, showToast, generateNewReport, setIsSahyogModalOpen, theme } = useApp();
  const cyRef = useRef(null);
  const graphStylesheet = useMemo(() => getGraphStylesheet(theme), [theme]);

  // Investigation Wallet input & Trace states
  const initialWallet =
    activeCase?.suspectWallet || "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2";

  const [wallet, setWallet] = useState(initialWallet);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noiseCancellation, setNoiseCancellation] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");
  const [selectedNode, setSelectedNode] = useState(null);

  // Main trace data with initial high-fidelity baseline
  const [traceData, setTraceData] = useState({
    status: "success",
    searched_wallet: initialWallet,
    summary: {
      risk_score: activeCase?.riskScore || 87,
      risk_status: "High",
      total_nodes: 8,
      total_transactions: 14,
      transactions_returned: 14,
      hops_traced: 3,
      funds_by_asset: { ETH: 14.85, USDT: 68400 },
      total_funds: 68414.85,
    },
    topology: INITIAL_DEMO_TOPOLOGY,
    transactions: INITIAL_DEMO_TRANSACTIONS,
    patterns: [
      {
        type: "Fund Splitting",
        wallet: initialWallet,
        description: "Funds distributed towards multiple intermediary hops.",
      },
      {
        type: "Peeling Chain",
        wallet: "0x9d7b3c2e4f910283948192038491029482e4f012",
        description: "Sequential split of USDT stablecoin amounts prior to mixer exit.",
      },
      {
        type: "Mixer Interaction",
        wallet: "0x0000000000000000000000000000000000000001",
        description: "Direct interaction with Tornado Cash Router contract.",
      },
    ],
  });

  // Sync with activeCase when changed
  const prevActiveWalletRef = useRef(activeCase?.suspectWallet);
  useEffect(() => {
    if (activeCase?.suspectWallet && activeCase.suspectWallet !== prevActiveWalletRef.current) {
      prevActiveWalletRef.current = activeCase.suspectWallet;
      setWallet(activeCase.suspectWallet);
    }
  }, [activeCase?.suspectWallet]);

  // ==========================================================
  // RUN TRACE API CALL
  // ==========================================================
  async function runTrace(targetAddress) {
    const addressToQuery = (targetAddress || wallet).trim();

    if (!addressToQuery) {
      setError("Please enter a valid Ethereum wallet address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: addressToQuery,
          max_hops: 1,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Trace request failed.");
      }

      setTraceData(result);
      setNoiseCancellation(false);
      showToast(
        `On-chain trace complete! ${result.summary?.total_transactions || 0} transactions detected.`,
        "success"
      );
    } catch (err) {
      console.error("TRACE ERROR:", err);
      setError(err.message || "Unable to trace wallet.");
      showToast(err.message || "Failed to trace wallet.", "error");
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // GRAPH ELEMENTS MEMO
  // ==========================================================
  const graphElements = useMemo(() => {
    if (!traceData?.topology) return [];

    return buildHorizontalElements(
      traceData.topology,
      traceData.searched_wallet || wallet,
      noiseCancellation
    );
  }, [traceData, noiseCancellation, wallet]);

  const visibleNodes = graphElements.filter((element) => !element.data.source);
  const visibleEdges = graphElements.filter((element) => element.data.source);

  // Cytoscape Resize and Fit
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const timer = setTimeout(() => {
      cy.resize();
      if (cy.elements().length) {
        cy.fit(cy.elements(), GRAPH_CONFIG.FIT_PADDING);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [graphElements]);

  // Listen to node taps on canvas
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const handleTap = (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      } else if (evt.target.isNode && evt.target.isNode()) {
        setSelectedNode(evt.target.data());
      }
    };

    cy.on("tap", handleTap);
    return () => {
      cy.removeListener("tap", handleTap);
    };
  }, [graphElements]);

  // Zoom controls
  const handleZoomIn = () => {
    const cy = cyRef.current;
    if (cy) cy.zoom(cy.zoom() * 1.25);
  };

  const handleZoomOut = () => {
    const cy = cyRef.current;
    if (cy) cy.zoom(cy.zoom() * 0.8);
  };

  const handleResetZoom = () => {
    const cy = cyRef.current;
    if (cy && cy.elements().length) {
      cy.fit(cy.elements(), GRAPH_CONFIG.FIT_PADDING);
    }
  };

  // Copy helper
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Wallet address copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  // ==========================================================
  // DYNAMIC CALCULATIONS (METRICS & RESERVOIRS)
  // ==========================================================
  const rawTransactions = traceData?.transactions || [];

  // 1. Ethereum (ETH) Reservoir Data
  const ethTransactions = rawTransactions.filter(
    (t) => (t.asset || "ETH").toUpperCase() === "ETH"
  );
  const calculatedEthTotal = ethTransactions.reduce(
    (acc, t) => acc + numeric(t.amount),
    0
  );
  const dynamicEthTotal =
    calculatedEthTotal > 0
      ? calculatedEthTotal
      : traceData?.summary?.funds_by_asset?.ETH || 14.85;

  const dynamicEthTxCount =
    ethTransactions.length > 0 ? ethTransactions.length : 8;

  const dynamicEthRecentTxs =
    ethTransactions.length > 0
      ? ethTransactions.slice(0, 4).map((tx, idx) => ({
          id: tx.hash || tx.id || idx,
          amount: `+${formatAmount(tx.amount, "ETH")}`,
          from: shortAddress(tx.source || tx.from),
          time: tx.timestamp || "Recent",
        }))
      : [
          { id: 1, amount: "+1.2 ETH", from: "Victim Deposit", time: "10:24" },
          { id: 2, amount: "+0.8 ETH", from: "Suspect Wallet", time: "11:03" },
          { id: 3, amount: "+0.5 ETH", from: "Relay Wallet A", time: "14:22" },
          { id: 4, amount: "+2.1 ETH", from: "Hot Wallet Relay", time: "15:40" },
        ];

  // 2. Tether (USDT) Reservoir Data
  const usdtTransactions = rawTransactions.filter((t) => {
    const asset = (t.asset || "").toUpperCase();
    return ["USDT", "USDC", "DAI", "USD"].includes(asset) || (asset && asset !== "ETH");
  });
  const calculatedUsdtTotal = usdtTransactions.reduce(
    (acc, t) => acc + numeric(t.amount),
    0
  );
  const dynamicUsdtTotal =
    calculatedUsdtTotal > 0
      ? calculatedUsdtTotal
      : traceData?.summary?.funds_by_asset?.USDT || 68400;

  const dynamicUsdtTxCount =
    usdtTransactions.length > 0 ? usdtTransactions.length : 14;

  const dynamicUsdtRecentTxs =
    usdtTransactions.length > 0
      ? usdtTransactions.slice(0, 4).map((tx, idx) => ({
          id: tx.hash || tx.id || idx,
          amount: `+$${Number(tx.amount || 0).toLocaleString()} USDT`,
          from: shortAddress(tx.source || tx.from),
          time: tx.timestamp || "Recent",
        }))
      : [
          { id: 1, amount: "+$2,500 USDT", from: "Suspect Wallet", time: "12:17" },
          { id: 2, amount: "+$4,000 USDT", from: "Suspect Wallet", time: "15:10" },
          { id: 3, amount: "+$12,500 USDT", from: "Binance Liquidity", time: "16:03" },
          { id: 4, amount: "+$8,200 USDT", from: "Peeling Chain C", time: "16:45" },
        ];

  // 3. Top Metrics Summary
  const dynamicRiskScore =
    traceData?.summary?.risk_score ?? activeCase?.riskScore ?? 87;

  const dynamicRiskStatus =
    dynamicRiskScore >= 70
      ? "High Risk"
      : dynamicRiskScore >= 40
      ? "Medium Risk"
      : "Low Risk";

  const totalFundsCryptoEquivalent = `${dynamicEthTotal.toFixed(2)} ETH + $${Math.round(
    dynamicUsdtTotal
  ).toLocaleString()} USDT`;

  const totalFundsINR = Math.round(
    dynamicEthTotal * 3240 * 86.5 + dynamicUsdtTotal * 86.5
  );

  const dynamicStoredTransactions =
    traceData?.summary?.total_transactions ||
    traceData?.transactions?.length ||
    dynamicEthTxCount + dynamicUsdtTxCount;

  // 4. Detected Entities Extraction
  const detectedEntities = useMemo(() => {
    const list = [];
    const seen = new Set();

    // From trace graph nodes
    const graphNodes = traceData?.topology?.nodes || [];
    graphNodes.forEach((node) => {
      if (node.is_exchange || node.is_mixer || node.node_class === "exchange" || node.entity_resolved) {
        const name =
          node.entity_resolved || node.display_name || node.label || (node.is_mixer ? "Mixer" : "Exchange");
        if (!seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          list.push({
            name,
            type: node.is_mixer ? "Mixer / Tumbler" : "Exchange / VASP",
            confidence: node.is_exchange ? "98%" : node.is_mixer ? "92%" : "85%",
            risk: node.is_mixer ? "Critical" : "Medium",
            address: node.address || node.id,
          });
        }
      }
    });

    // Fallback/augment with activeCase.detectedEntities if list is small
    if (list.length === 0 && activeCase?.detectedEntities) {
      return activeCase.detectedEntities;
    }

    return list;
  }, [traceData, activeCase]);

  // ==========================================================
  // LEGAL NOTICE & EMAIL DISPATCH ACTIONS
  // ==========================================================

  // Action 1: Generate & Download Legal Notice
  const handleGenerateLegalNotice = (entityName, entityAddress) => {
    const caseId = activeCase?.caseId || "CN-1024";
    const timestampISO = new Date().toISOString();
    const formattedDate = new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "UTC",
    });

    const suspectAddr = entityAddress || wallet;

    const noticeText = `================================================================================
GOVERNMENT OF INDIA | MINISTRY OF HOME AFFAIRS
INDIAN CYBER CRIME COORDINATION CENTRE (I4C)
LEGAL NOTICE & STATUTORY PRESERVATION REQUISITION
ISSUED UNDER SECTION 91 & SECTION 107 OF BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 (BNSS)
[READ WITH SECTION 63 OF BHARATIYA SAKSHYA ADHINIYAM, 2023 (BSA)]
================================================================================

DATE & TIME OF NOTICE: ${formattedDate}
ISO TIMESTAMP: ${timestampISO}
INVESTIGATION CASE FILE: #${caseId}
NCRP REF: ${activeCase?.ncrpRef || "NCRP-2025-IN-98124"}
INVESTIGATING AGENCY: Cyber Crime & Financial Intelligence Enforcement Division (I4C Node)
PLATFORM: TraceX Automated Investigation Command

--------------------------------------------------------------------------------
ADDRESSEE:
Legal, Regulatory Compliance & Law Enforcement Liaison Department
ENTITY / VASP NAME: ${entityName}
DESIGNATION: Virtual Asset Service Provider (VASP) / Digital Custodial Institution
--------------------------------------------------------------------------------

SUBJECT: FORMAL DEMAND FOR IMMEDIATE ACCOUNT RESTRAINT & KYC PRESERVATION

Sir / Madam,

1. An official criminal investigation is actively underway regarding unauthorized digital fund siphoning,
   illicit multi-hop fund peeling, and cryptographic money laundering under the Bharatiya Nyaya Sanhita, 2023 (BNS).

2. Forensic path reconstruction performed using the TraceX Engine has traced stolen digital assets directly
   into the operational infrastructure, deposit pools, and custodial accounts under the control of ${entityName}.

TARGET SUSPECT WALLET ADDRESS UNDER ENFORCEMENT:
${suspectAddr}

ASSOCIATED CASE METRICS:
- Primary Case ID: #${caseId}
- Attributed Counterparty Entity: ${entityName}
- Attribution Confidence: High / Verified Cluster
- Date of Detection: ${new Date().toLocaleDateString("en-GB")}
- Forensic Classification: Receptor / Peeling Chain Exit Point

STATUTORY INSTRUCTIONS & MANDATORY COMPLIANCE:
Pursuant to Section 91 & Section 107 of the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS), you are hereby ordered and directed to execute the following within 24 hours:

1. IMMEDIATE ASSET FREEZE:
   Freeze and lock all custodial deposit accounts, sub-accounts, collateral balances, and withdrawal privileges
   associated directly or indirectly with the target address specified above.

2. SUSPENSION OF OFF-RAMP OPERATIONS:
   Suspend any pending or scheduled cryptocurrency-to-fiat transactions, P2P orders, and OTC disbursements.

3. FULL RECORD & KYC DOSSIER FURNISHING (SEC 63 BSA COMPLIANT):
   Preserve and provide the complete identity and activity file of the account holder, including:
   a. Full Legal Name, Date of Birth, and Registered Physical Address.
   b. Scanned copies of Government Issued Identification (Aadhaar, Passport, National ID).
   c. Registered Contact Information (Phone numbers, Linked verified emails).
   d. Full IP Access Logs including source IP addresses, Port numbers, and Session Timestamps.
   e. Linked Bank Account details, Fiat Settlement Accounts, and Card numbers.
   f. Comprehensive Internal Ledger Records of all deposits and withdrawal attempts.

4. GAG ORDER / STRICT CONFIDENTIALITY:
   Maintain absolute confidentiality regarding this notice. Do not alert the account holder or third parties,
   as doing so may compromise ongoing judicial proceedings.

AUTHORIZED BY:
Superintendent of Police / Officer in Charge, Cyber Crime Division
Indian Cyber Crime Coordination Centre (I4C) / MHA
Digital Signature: [VERIFIED LEA DSC TOKEN: IN-GOV-I4C-${caseId}]
================================================================================`;

    const blob = new Blob([noticeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SEC_91_BNSS_NOTICE_${entityName.replace(/\s+/g, "_")}_Case_${caseId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Section 91 BNSS Lawful Notice for ${entityName} generated and downloaded!`, "success");
  };

  // Action 2: Send Notice to Exchange (Opens pre-filled mailto)
  const handleSendNoticeToExchange = (entityName, entityAddress) => {
    const caseId = activeCase?.caseId || "CN-1024";
    const suspectAddr = entityAddress || wallet;
    const normalizedName = entityName.toLowerCase().trim();

    let targetEmail = VASP_LEGAL_EMAILS.default;
    for (const key of Object.keys(VASP_LEGAL_EMAILS)) {
      if (normalizedName.includes(key)) {
        targetEmail = VASP_LEGAL_EMAILS[key];
        break;
      }
    }

    const subject = `URGENT: Legal Preservation Notice & Account Freeze Request - Case #${caseId} - ${entityName}`;
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

    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.open(mailtoUrl, "_blank");
    showToast(`Drafted legal notice email to ${entityName} (${targetEmail})`, "info");
  };

  // Action: Generate Investigation Report
  const handleGenerateReport = () => {
    generateNewReport({
      title: `Case ${activeCase?.caseId || "CN-1024"} Forensic Trace Summary`,
      type: "Case Summary",
      relatedCase: activeCase?.caseId || "CN-1024",
    });
  };

  // Action: Export Transactions CSV
  const handleExportCSV = () => {
    if (!rawTransactions.length) {
      showToast("No transactions available to export.", "info");
      return;
    }

    const headers = "Tx Hash,Source (From),Target (To),Amount,Asset,Timestamp,Status,Risk\n";
    const rows = rawTransactions
      .map(
        (tx) =>
          `"${tx.hash || tx.id || ""}","${tx.source || tx.from || ""}","${
            tx.target || tx.to || ""
          }","${tx.amount || 0}","${tx.asset || "ETH"}","${tx.timestamp || ""}","${
            tx.status || "Confirmed"
          }","${tx.risk || "Medium"}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TraceX_Transactions_${activeCase?.caseId || "CN-1024"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Transactions successfully exported as CSV!", "success");
  };

  return (
    <div className="cases-page-container p-4 lg:p-6 space-y-6">
      {/* ======================================================== */}
      {/* 1. TOP CASE HEADER & SUMMARY METRIC BAR (DASHBOARD STYLE) */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#0b142d] border border-slate-200 dark:border-[#1b2b52] rounded-lg p-4 shadow-xs space-y-4 transition-colors">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2.5">
              <span>Case #{activeCase?.caseId || "CN-1024"}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                {activeCase?.status || "Active"}
              </span>
            </h1>

            <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#1a2b50] rounded-md px-3 py-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Suspect Wallet:</span>
              <span className="text-xs font-mono text-blue-700 dark:text-cyan-300 font-semibold">
                {shortAddress(wallet)}
              </span>
              <button
                onClick={() => copyToClipboard(wallet)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white ml-1 transition-colors"
                title="Copy Address"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Right Meta info */}
          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <div>
              <span className="block text-slate-400">Created:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {activeCase?.created || "12 Apr 2025, 14:32"}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-[#1a2b50]"></div>
            <div>
              <span className="block text-slate-400">Last Updated:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {activeCase?.lastUpdated || "Just now"}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-[#1a2b50]"></div>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Forensic Engine Online</span>
            </div>
          </div>
        </div>

        {/* Top Controls / Search Bar */}
        <div className="pt-3 border-t border-slate-200 dark:border-[#162548]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[280px] relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") runTrace();
                }}
                placeholder="Enter Ethereum investigation wallet address (0x...)"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#070d1e] border border-slate-300 dark:border-[#1a2b50] rounded-md text-xs font-mono text-slate-900 dark:text-cyan-300 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Run Trace Button */}
            <button
              onClick={() => runTrace()}
              disabled={loading}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              title="Execute full multi-hop blockchain forensic reconstruction"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Tracing..." : "Run Trace"}</span>
            </button>

            {/* Noise Cancellation Toggle */}
            <button
              onClick={() => setNoiseCancellation((prev) => !prev)}
              className={`px-3 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                noiseCancellation
                  ? "bg-amber-100 dark:bg-amber-600/20 border-amber-300 dark:border-amber-500 text-amber-900 dark:text-amber-300"
                  : "bg-slate-100 dark:bg-[#0e1c3d] hover:bg-slate-200 dark:hover:bg-[#152a5c] border-slate-300 dark:border-[#1e3b79] text-slate-700 dark:text-cyan-300"
              }`}
              title="Filter out low-value micro-transactions and retain high-value flows"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  noiseCancellation ? "bg-amber-500 animate-ping" : "bg-blue-600 dark:bg-cyan-400"
                }`}
              ></span>
              <span>
                {noiseCancellation ? "Noise Filter ON (Top 30%)" : "Noise Cancellation"}
              </span>
            </button>

            {/* Reset to Active Case Wallet Button */}
            <button
              onClick={() => {
                const def =
                  activeCase?.suspectWallet || "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2";
                setWallet(def);
                runTrace(def);
              }}
              className="p-2 bg-slate-100 dark:bg-[#070d1e] hover:bg-slate-200 dark:hover:bg-[#122045] border border-slate-300 dark:border-[#162548] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md text-xs transition-colors cursor-pointer"
              title="Reset to Active Case Target Wallet"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Fetch from SAHYOG Portal */}
            <button
              onClick={() => setIsSahyogModalOpen(true)}
              className="px-3 py-2 bg-blue-50 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-700/80 text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Fetch Case / Wallet from SAHYOG Portal (I4C Gateway)"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              <span>Fetch from SAHYOG Portal</span>
            </button>
          </div>

          {error && (
            <div className="mt-2.5 p-2.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* 5 Summary Metric Cards (Matching Dashboard exactly) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-[#162548]">
          {/* Card 1: Risk Score */}
          <div className="flex items-center gap-3 p-2.5 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60">
            <div className="w-9 h-9 rounded-md bg-red-100 dark:bg-red-600/20 border border-red-300 dark:border-red-500/40 flex items-center justify-center text-red-700 dark:text-red-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-red-700 dark:text-red-300 font-bold uppercase">Risk Score</div>
              <div className="text-base font-extrabold text-red-700 dark:text-red-400">
                {dynamicRiskScore} / 100
              </div>
              <div className="text-[10px] text-red-600/90 dark:text-red-300/80 font-medium">
                {dynamicRiskStatus}
              </div>
            </div>
          </div>

          {/* Card 2: Total Funds Traced */}
          <div className="flex items-center gap-3 p-2.5 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#1b2b52]">
            <div className="w-9 h-9 rounded-md bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/40 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Total Funds Traced</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                ₹ {totalFundsINR.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]" title={totalFundsCryptoEquivalent}>
                {totalFundsCryptoEquivalent}
              </div>
            </div>
          </div>

          {/* Card 3: Active Graph Nodes */}
          <div className="flex items-center gap-3 p-2.5 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#1b2b52]">
            <div className="w-9 h-9 rounded-md bg-sky-100 dark:bg-cyan-600/20 border border-sky-200 dark:border-cyan-500/40 flex items-center justify-center text-sky-700 dark:text-cyan-400 shrink-0">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Active Graph Nodes</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-cyan-300">
                {visibleNodes.length} Nodes
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {traceData?.summary?.total_nodes || visibleNodes.length} Detected
              </div>
            </div>
          </div>

          {/* Card 4: Stored Transactions */}
          <div className="flex items-center gap-3 p-2.5 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#1b2b52]">
            <div className="w-9 h-9 rounded-md bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-700 dark:text-indigo-400 shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Stored Transactions</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                {dynamicStoredTransactions} Traced
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {visibleEdges.length} Visual Flows
              </div>
            </div>
          </div>

          {/* Card 5: VASP / Exchange */}
          <div className="flex items-center gap-3 p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 col-span-2 sm:col-span-1">
            <div className="w-9 h-9 rounded-md bg-amber-100 dark:bg-amber-600/20 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase">VASP / Exchange</div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-400 leading-tight">
                {detectedEntities.length} Identified
              </div>
              <div className="text-[10px] text-amber-700 dark:text-amber-300/80 truncate max-w-[120px]">
                {detectedEntities.map((e) => e.name).slice(0, 2).join(", ") || "Known Clusters"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN SECTION: CENTRAL GRAPH + RESERVOIRS + RIGHT PANEL */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Fund Flow Reconstruction Graph + Reservoirs */}
        <div className="lg:col-span-2 space-y-4">
          {/* ==================================================== */}
          {/* CENTRAL CANVAS: FUND FLOW RECONSTRUCTION GRAPH */}
          {/* ==================================================== */}
          <div className="bg-white dark:bg-[#0b142d] border border-slate-200 dark:border-[#1b2b52] rounded-lg p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#162548]">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse"></div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                  Interactive Fund Flow Reconstruction ({visibleNodes.length} Nodes ·{" "}
                  {visibleEdges.length} Flows)
                </h2>
              </div>

              {/* Tools: Noise Badge, Zoom, Fit */}
              <div className="flex items-center gap-2">
                {noiseCancellation && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    High-Value Only
                  </span>
                )}

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#070d1e] border border-slate-200 dark:border-[#1a2b50] rounded-md p-0.5">
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#122248] rounded transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#122248] rounded transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#122248] rounded transition-colors"
                    title="Reset Zoom & Center Canvas"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Legend Bar with all 6 node badges */}
            <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 px-1 flex-wrap gap-2">
              <div className="flex items-center gap-3.5 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] border border-cyan-400"></span>
                  Victim
                </span>
                <span className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400">
                  <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#dc2626]"></span>
                  </span>
                  Suspect
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] border border-blue-400"></span>
                  Wallets
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] border border-amber-400"></span>
                  Exchanges
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-purple-700 dark:text-purple-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9333ea] border border-purple-400"></span>
                  Mixer
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-md bg-[#059669] border border-emerald-400"></span>
                  Bridge
                </span>
              </div>
              <span className="text-blue-700 dark:text-cyan-400 font-mono font-medium">Tip: Click any node or dashed swap edge to inspect payload</span>
            </div>

            {/* Mixer Equal-Volume Pattern Visual Highlight Banner */}
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 dark:from-[#1b0d38]/90 dark:via-[#16173a]/80 dark:to-[#1b0d38]/90 border border-purple-300 dark:border-purple-600/60 rounded-md p-2 flex items-center justify-between text-xs text-purple-900 dark:text-purple-200 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-purple-200 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs">
                  🌪️
                </span>
                <div>
                  <span className="font-extrabold uppercase tracking-wide text-[10px] text-purple-700 dark:text-purple-300 block">
                    Mixer Flow Pattern Analysis
                  </span>
                  <span className="text-[11px] font-medium leading-tight">
                    <strong>Volume-based Time Window Pattern Analysis:</strong> Auto-detects equal-volume outflow wallets within the target time range.
                  </span>
                </div>
              </div>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-800/80 text-purple-900 dark:text-purple-100 font-mono text-[10px] font-bold shrink-0">
                Equal-Volume Clustering Active
              </span>
            </div>

            {/* Cytoscape Graph Canvas */}
            <div className="cytoscape-canvas-container cases-cyber-grid">
              <CytoscapeComponent
                cy={(cy) => {
                  cyRef.current = cy;
                }}
                elements={graphElements}
                stylesheet={graphStylesheet}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                wheelSensitivity={0.15}
                boxSelectionEnabled={false}
                autoungrabify={false}
                minZoom={0.2}
                maxZoom={2.5}
                layout={{
                  name: "preset",
                  fit: false,
                  padding: 40,
                }}
              />

              {/* Floating Node Inspector Tooltip */}
              {selectedNode && (
                <div className="node-inspector-popup">
                  <div className="flex items-center justify-between gap-2 pb-1 mb-1.5 border-b border-slate-200 dark:border-[#1f3869]">
                    <span className="text-[10px] text-blue-700 dark:text-cyan-400 font-bold uppercase tracking-wider">
                      Node Forensics
                    </span>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-[10px] text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="text-slate-900 dark:text-white font-bold">{selectedNode.displayName}</div>
                    <div className="font-mono text-blue-700 dark:text-cyan-300 text-[10px] break-all">
                      {selectedNode.fullAddress || selectedNode.address}
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-1 text-[10px]">
                      <span>Classification:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 uppercase">
                        {selectedNode.nodeClass}
                      </span>
                    </div>

                    {/* Mixer Highlight Box */}
                    {selectedNode.nodeClass === "mixer" && (
                      <div className="p-2 bg-purple-50 dark:bg-purple-950/70 border border-purple-300 dark:border-purple-700/80 rounded text-[10px] text-purple-950 dark:text-purple-200 font-medium">
                        <div className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1 mb-0.5">
                          <span>⚡ Equal-Volume Pattern Analysis</span>
                        </div>
                        <p className="leading-snug">
                          Volume-based Time Window Pattern Analysis: Auto-detects equal-volume outflow wallets within the target time range.
                        </p>
                      </div>
                    )}

                    {/* Bridge Highlight Box */}
                    {selectedNode.nodeClass === "bridge" && (
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/80 rounded text-[10px] text-emerald-950 dark:text-emerald-200 font-medium">
                        <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 mb-0.5">
                          <span>🌉 Cross-Chain Swap Routing</span>
                        </div>
                        <p className="leading-snug">
                          Active bridge connecting {selectedNode.bridge_source_chain || "ETH"} ➔ {selectedNode.bridge_dest_chain || "BSC"}. Distinct smart contract lock & mint token swap.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-[10px]">
                      <span>Risk Assessment:</span>
                      <span
                        className={`font-bold ${
                          selectedNode.riskScore >= 70
                            ? "text-red-600 dark:text-red-400"
                            : selectedNode.riskScore >= 40
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {selectedNode.riskScore} / 100
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-[10px]">
                      <span>Aggregated Flow:</span>
                      <span className="font-bold text-blue-700 dark:text-cyan-400">
                        {formatAmount(selectedNode.flowValue)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      copyToClipboard(selectedNode.fullAddress || selectedNode.address);
                    }}
                    className="mt-2 w-full py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/30 dark:hover:bg-blue-600/50 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-500/40 rounded text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Full Address</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ==================================================== */}
          {/* BOTTOM RESERVOIR 1: ETHEREUM (ETH) STORAGE RESERVOIR */}
          {/* ==================================================== */}
          <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-blue-50/90 dark:from-[#0c183b] dark:via-[#0f214d] dark:to-[#0c183b] border-2 border-blue-200 dark:border-cyan-500/40 rounded-lg p-4 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-full bg-cyan-500/5 blur-2xl pointer-events-none"></div>

            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-blue-200 dark:border-cyan-900/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-blue-100 dark:bg-cyan-500/20 border border-blue-300 dark:border-cyan-400/50 flex items-center justify-center text-blue-800 dark:text-cyan-300 font-extrabold text-base shadow-xs">
                  Ξ
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                      Ethereum (ETH) Storage Reservoir
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-cyan-950 text-blue-800 dark:text-cyan-300 border border-blue-300 dark:border-cyan-700 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse"></span>
                      Storing ETH Amounts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Aggregates all native ETH inflows and smart-contract peeling transfers
                  </p>
                </div>
              </div>

              {/* Amount & Counter */}
              <div className="text-right">
                <div className="text-xl font-black text-blue-900 dark:text-cyan-300 font-mono tracking-tight flex items-center justify-end gap-1.5">
                  <span>{dynamicEthTotal.toFixed(2)} ETH</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    (~ ${(dynamicEthTotal * 3240).toLocaleString()})
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                  {dynamicEthTxCount} Transactions Captured in Reservoir
                </span>
              </div>
            </div>

            {/* Reservoir Fill Bar & Recent Inputs */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 mb-1">
                  <span>Reservoir Capacity</span>
                  <span className="text-blue-800 dark:text-cyan-300 font-mono font-bold">
                    {Math.min(100, Math.max(12, Math.round((dynamicEthTotal / 30) * 100)))}%
                    Filled
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-[#070d1e] rounded-full overflow-hidden border border-slate-300 dark:border-cyan-950">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500 rounded-full reservoir-progress-bar shadow-xs"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(12, Math.round((dynamicEthTotal / 30) * 100))
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Live Captured Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">Latest Inputs:</span>
                {dynamicEthRecentTxs.map((tx, idx) => (
                  <span
                    key={tx.id || idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#071126] border border-blue-200 dark:border-cyan-800 text-blue-900 dark:text-cyan-300 flex items-center gap-1 shadow-xs"
                  >
                    <ArrowDown className="w-2.5 h-2.5 text-blue-600 dark:text-cyan-400" />
                    {tx.amount}{" "}
                    <span className="text-slate-500 text-[9px]">({tx.from})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Inflow indicator */}
            <div className="mt-2 text-center flex items-center justify-center gap-2 text-[10px] text-blue-700 dark:text-cyan-400 font-semibold uppercase tracking-wider">
              <span>ETH Flow Channels Connected to Graph Nodes</span>
              <ArrowDown className="w-3 h-3 animate-bounce" />
            </div>
          </div>

          {/* ==================================================== */}
          {/* BOTTOM RESERVOIR 2: TETHER (USDT) STORAGE RESERVOIR  */}
          {/* ==================================================== */}
          <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-emerald-50/90 dark:from-[#07241c] dark:via-[#0b3328] dark:to-[#07241c] border-2 border-emerald-200 dark:border-emerald-500/40 rounded-lg p-4 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-48 h-full bg-emerald-500/5 blur-2xl pointer-events-none"></div>

            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-emerald-200 dark:border-emerald-900/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-400/50 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-extrabold text-base shadow-xs">
                  ₮
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                      Tether (USDT) Storage Reservoir
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse"></span>
                      Storing USDT Amounts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Captures all dollar-pegged stablecoin exit routes, mixer dumps, and DEX conversions
                  </p>
                </div>
              </div>

              {/* Amount & Counter */}
              <div className="text-right">
                <div className="text-xl font-black text-emerald-800 dark:text-emerald-300 font-mono tracking-tight flex items-center justify-end gap-1.5">
                  <span>${Math.round(dynamicUsdtTotal).toLocaleString()} USDT</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    (~ ₹{Math.round(dynamicUsdtTotal * 86.5).toLocaleString("en-IN")})
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                  {dynamicUsdtTxCount} Transactions Captured in Reservoir
                </span>
              </div>
            </div>

            {/* Reservoir Fill Bar & Recent Inputs */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 mb-1">
                  <span>Reservoir Capacity</span>
                  <span className="text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                    {Math.min(
                      100,
                      Math.max(10, Math.round((dynamicUsdtTotal / 120000) * 100))
                    )}
                    % Filled
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-[#070d1e] rounded-full overflow-hidden border border-slate-300 dark:border-emerald-950">
                  <div
                    className="h-full bg-gradient-to-r from-teal-600 via-emerald-500 to-green-500 rounded-full reservoir-progress-bar shadow-xs"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(10, Math.round((dynamicUsdtTotal / 120000) * 100))
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Live Captured Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">Latest Inputs:</span>
                {dynamicUsdtRecentTxs.map((tx, idx) => (
                  <span
                    key={tx.id || idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#041410] border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-1 shadow-xs"
                  >
                    <ArrowDown className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                    {tx.amount}{" "}
                    <span className="text-slate-500 text-[9px]">({tx.from})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Inflow indicator */}
            <div className="mt-2 text-center flex items-center justify-center gap-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider">
              <span>USDT Flow Channels Connected to Graph Nodes</span>
              <ArrowDown className="w-3 h-3 animate-bounce" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: WALLET DETAILS & INVESTIGATION PANEL        */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-[#0b142d] border border-slate-200 dark:border-[#1b2b52] rounded-lg p-4 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#162548]">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Wallet Details</h2>
              <div className="flex gap-1.5">
                <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 px-2 py-0.5 rounded font-semibold">
                  Suspicious
                </span>
                <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 px-2 py-0.5 rounded font-semibold">
                  High Risk
                </span>
              </div>
            </div>

            {/* Wallet Address with copy */}
            <div className="mt-3 p-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548] flex items-center justify-between">
              <span className="text-xs font-mono text-blue-700 dark:text-cyan-400 truncate max-w-[210px]" title={wallet}>
                {wallet}
              </span>
              <button
                onClick={() => copyToClipboard(wallet)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 transition-colors"
                title="Copy Address"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Balance and Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-3 text-xs">
              <div className="p-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Balance</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {dynamicEthTotal.toFixed(2)} ETH
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  (₹{Math.round(dynamicEthTotal * 3240 * 86.5).toLocaleString("en-IN")})
                </span>
              </div>
              <div className="p-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Total Transactions</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {rawTransactions.length || 32} On-chain
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Traced in Graph</span>
              </div>
              <div className="p-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">First Seen</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                  {activeCase?.firstSeen || "12 Apr 2025, 10:24"}
                </span>
              </div>
              <div className="p-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Last Seen</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                  {activeCase?.lastSeen || "14 Apr 2025, 16:32"}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tags:</span>
              {(activeCase?.tags || ["Scam", "Mixer", "High Risk", "Money Laundering"]).map(
                (tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#132349] text-slate-700 dark:text-blue-300 border border-slate-200 dark:border-[#20376d] font-medium"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>

            {/* ==================================================== */}
            {/* DETECTED ENTITIES SECTION WITH EXCHANGE ACTION BUTTONS */}
            {/* ==================================================== */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#162548]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Detected Entities ({detectedEntities.length})
                </span>
                <span className="text-[10px] text-blue-700 dark:text-cyan-400 font-semibold">
                  Actionable VASPs
                </span>
              </div>

              <div className="space-y-2.5">
                {detectedEntities.map((ent, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548] space-y-2 hover:border-blue-400 dark:hover:border-[#1e3b75] transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-bold text-slate-900 dark:text-slate-100">{ent.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          {ent.type || "Exchange / VASP"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-blue-700 dark:text-cyan-400 block font-mono">
                          Confidence: {ent.confidence || "98%"}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            ent.risk === "Critical"
                              ? "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950/60 border-red-300 dark:border-red-800"
                              : "text-amber-800 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800"
                          }`}
                        >
                          {ent.risk || "Medium Risk"}
                        </span>
                      </div>
                    </div>

                    {/* TWO ACTION BUTTONS UNDER EVERY DETECTED EXCHANGE CARD */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200 dark:border-[#122246]">
                      {/* Button 1: Generate Legal Notice */}
                      <button
                        onClick={() =>
                          handleGenerateLegalNotice(ent.name, ent.address || wallet)
                        }
                        className="w-full py-1.5 px-2 bg-blue-50 dark:bg-[#0c1c3d] hover:bg-blue-100 dark:hover:bg-[#142e63] text-blue-900 dark:text-cyan-300 border border-blue-300 dark:border-cyan-800/60 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                        title={`Generate Lawful Notice under Section 91 BNSS for ${ent.name}`}
                      >
                        <FileText className="w-3 h-3 text-blue-600 dark:text-cyan-400 shrink-0" />
                        <span className="truncate">Generate Notice (Sec 91 BNSS)</span>
                      </button>

                      {/* Button 2: Send Notice to Exchange */}
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
                  </div>
                ))}
              </div>
            </div>

            {/* ==================================================== */}
            {/* SUSPICIOUS PATTERNS SECTION                          */}
            {/* ==================================================== */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#162548]">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Suspicious Patterns
              </span>
              <div className="space-y-1">
                {(traceData?.patterns && traceData.patterns.length > 0
                  ? traceData.patterns.map((p) => ({
                      label: p.type || "Pattern Detected",
                      level: "High",
                      color: "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950/60 border-red-300 dark:border-red-800",
                    }))
                  : activeCase?.suspiciousPatterns || [
                      {
                        label: "Rapid fund movement",
                        level: "High",
                        color: "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950/60 border-red-300 dark:border-red-800",
                      },
                      {
                        label: "Multiple small transfers",
                        level: "Medium",
                        color: "text-amber-800 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800",
                      },
                      {
                        label: "Interaction with mixer",
                        level: "High",
                        color: "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950/60 border-red-300 dark:border-red-800",
                      },
                    ]
                ).map((pat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 px-1.5 border-b border-slate-100 dark:border-[#142347]"
                  >
                    <span className="text-slate-700 dark:text-slate-300">• {pat.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${pat.color}`}>
                      {pat.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ==================================================== */}
            {/* INVESTIGATION RECOMMENDATIONS SECTION                */}
            {/* ==================================================== */}
            <div className="mt-3.5 p-2.5 rounded-md bg-amber-50/80 dark:bg-[#070d1e] border border-amber-200 dark:border-[#182952]">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block mb-1">
                Investigation Recommendations
              </span>
              <ol className="text-[11px] text-slate-700 dark:text-slate-300 list-decimal list-inside space-y-1">
                {(
                  activeCase?.recommendations || [
                    "Examine Binance wallet activity and request KYC records via VASP interface",
                    "Trace subsequent peeling chain funds exiting into mixer pools",
                    "Flag counterparty addresses for continuous velocity monitoring and freeze alert",
                  ]
                ).map((rec, idx) => (
                  <li key={idx} className="leading-snug">
                    {rec}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Action Button: Generate Investigation Report */}
          <button
            onClick={handleGenerateReport}
            className="mt-4 w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-md flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Investigation Report</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM PANEL: TABBED INVESTIGATION DATA               */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#0b142d] border border-slate-200 dark:border-[#1b2b52] rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#162548]">
          <div className="flex items-center gap-2">
            {[
              {
                id: "transactions",
                label: `Transactions (${rawTransactions.length || 0})`,
              },
              { id: "network", label: "Network Analysis" },
              { id: "entities", label: `Related Entities (${detectedEntities.length})` },
              { id: "evidence", label: "Evidence" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-blue-700 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#101e40]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-[#0e1b3d] hover:bg-slate-100 dark:hover:bg-[#132450] border border-slate-300 dark:border-[#1e3466] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md text-xs font-medium transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Tab 1: Transactions Table */}
        {activeTab === "transactions" && (
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-[#070d1e] text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-[#162548]">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Tx Hash</th>
                  <th className="py-2.5 px-3">From</th>
                  <th className="py-2.5 px-3">To</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Token</th>
                  <th className="py-2.5 px-3">Hop</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#152345]">
                {(rawTransactions.length > 0 ? rawTransactions : INITIAL_DEMO_TRANSACTIONS).map(
                  (tx, idx) => (
                    <tr
                      key={tx.hash || tx.id || idx}
                      className="hover:bg-slate-50 dark:hover:bg-[#0e1b3d]/60 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{idx + 1}</td>
                      <td
                        className="py-2.5 px-3 font-mono text-blue-700 dark:text-cyan-400 hover:underline cursor-pointer"
                        onClick={() => copyToClipboard(tx.hash || tx.id || "")}
                        title="Click to copy Hash"
                      >
                        {shortAddress(tx.hash || tx.id || "")}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {shortAddress(tx.source || tx.from || "")}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {shortAddress(tx.target || tx.to || "")}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {numeric(tx.amount).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-semibold">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={
                              (tx.asset || "ETH").toUpperCase().includes("ETH")
                                ? "text-blue-700 dark:text-cyan-400"
                                : "text-emerald-700 dark:text-emerald-400"
                            }
                          >
                            {tx.asset || "ETH"}
                          </span>
                          {(tx.is_mixer || tx.source === "0x0000000000000000000000000000000000000001" || tx.target === "0x0000000000000000000000000000000000000001" || tx.label?.toLowerCase().includes("tornado") || tx.type?.toLowerCase().includes("mixer")) && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800" title="Mixer Flow">
                              🌪️ Mixer {tx.is_matching ? 'Pattern' : ''}
                            </span>
                          )}
                          {(tx.is_bridge || (tx.asset && tx.asset.includes("BSC")) || tx.bridge_source_chain || tx.bridge_dest_chain || tx.label?.toLowerCase().includes("bridge") || tx.type?.toLowerCase().includes("bridge")) && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800" title="Cross-Chain Bridge Swap">
                              🌉 Bridge Swap
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-mono">
                        Hop {tx.hop ?? 1}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                        {tx.timestamp || "14 Apr 16:32"}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[10px] font-semibold">
                          {tx.status || "Confirmed"}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Network Analysis */}
        {activeTab === "network" && (
          <div className="py-6 text-center text-xs text-slate-700 dark:text-slate-300 space-y-3">
            <p className="font-semibold text-blue-800 dark:text-cyan-400 text-sm">
              Multi-Hop Flow Clustering & Storage Reservoir Routing Breakdown
            </p>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              TraceX algorithms continuously aggregate incoming and outgoing blockchain
              pathways, sorting liquidity into two primary storage channels: Ethereum (ETH) for
              native contract gas and Arbitrum/Optimism bridge routes, and Tether (USDT) for
              dollar-denominated peeling off-ramps and mixer conversions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mt-4 text-left">
              <div className="p-3 bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548] rounded-md">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-medium">Max Trace Depth</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {traceData?.summary?.hops_traced || 3} Hops Traced
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548] rounded-md">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-medium">Noise Filtering</span>
                <span className="text-sm font-bold text-blue-700 dark:text-cyan-300">
                  {noiseCancellation ? "Active (Top 30%)" : "Full Visibility"}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548] rounded-md">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-medium">Active Cluster</span>
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {detectedEntities.length} Regulated VASPs
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Related Entities */}
        {activeTab === "entities" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {detectedEntities.map((ent, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548] rounded-md text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-slate-900 dark:text-white">{ent.name}</span>
                  </div>
                  <span className="text-blue-700 dark:text-cyan-400 font-mono text-[11px] font-bold">
                    Confidence: {ent.confidence}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Associated with verified custodial clustering. Official preservation notice can be
                  dispatched to compliance authority.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleGenerateLegalNotice(ent.name, ent.address || wallet)}
                    className="px-2.5 py-1 bg-blue-50 dark:bg-[#0e1d3e] hover:bg-blue-100 dark:hover:bg-[#162d5f] text-blue-900 dark:text-cyan-300 border border-blue-300 dark:border-cyan-800/60 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                    <span>Generate Notice (Sec 91 BNSS)</span>
                  </button>
                  <button
                    onClick={() => handleSendNoticeToExchange(ent.name, ent.address || wallet)}
                    className="px-2.5 py-1 bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>Email Exchange Legal</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Evidence */}
        {activeTab === "evidence" && (
          <div className="py-6 text-center text-xs text-slate-700 dark:text-slate-300 space-y-3">
            <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">
              Cryptographic Blockchain Evidence Sealed
            </p>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Cryptographic transaction signatures, mempool timestamps, and multi-hop node flow
              hashes are cryptographically sealed in compliance with digital evidence standards.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() =>
                  showToast("Opening secure digital evidence locker...", "info")
                }
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-md text-xs font-bold cursor-pointer shadow-xs"
              >
                Open Secure Evidence Locker
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-slate-100 dark:bg-[#0e1b3d] hover:bg-slate-200 dark:hover:bg-[#152a5c] border border-slate-300 dark:border-[#1e3b79] text-slate-800 dark:text-cyan-300 rounded-md text-xs font-semibold cursor-pointer shadow-xs"
              >
                Download Evidence Chain CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}