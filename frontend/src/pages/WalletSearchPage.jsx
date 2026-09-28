import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Copy, 
  Check, 
  ArrowRight, 
  Wallet, 
  Building2, 
  Filter, 
  RefreshCw 
} from 'lucide-react';

import './WalletSearch.css';

// ============================================================
// COMPREHENSIVE CASE REPOSITORY WITH DASHBOARD DATASETS
// ============================================================
const DETAILED_CASES_CATALOG = [
  {
    id: 1,
    caseId: "CN-1024",
    title: "Dark Web Payment Analysis",
    caseType: "Money Laundering",
    status: "Active",
    priority: "High",
    assignedTo: "A. Sharma",
    created: "12 Apr 2025, 14:32",
    dateCreated: "12 Apr 2025",
    lastUpdated: "14 Apr 2025, 16:47",
    suspectWallet: "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2",
    riskScore: 87,
    riskCategory: "High Risk",
    totalFundsTracedINR: "₹ 48,75,320",
    totalFundsTracedBTC: "~ 14.85 ETH / $68.4K USDT",
    hops: 4,
    transactionsCount: 127,
    vaspCount: "2 Identified",
    investigator: "A. Sharma",
    department: "Cyber Crime Unit, Law Enforcement",
    balanceBTC: "14.85 ETH",
    balanceINR: "₹ 48,75,320",
    firstSeen: "12 Apr 2025, 10:24",
    lastSeen: "14 Apr 2025, 16:32",
    tags: ["Scam", "Mixer", "High Risk", "Money Laundering"],
    detectedEntities: [
      { name: "Binance", type: "Exchange / VASP", confidence: "98%", status: "Identified", risk: "Medium" },
      { name: "Tornado Cash", type: "Mixer / Tumbler", confidence: "87%", status: "Identified", risk: "Critical" },
      { name: "Huobi", type: "Exchange", confidence: "62%", status: "Monitored", risk: "Medium" },
    ],
    suspiciousPatterns: [
      { label: "Rapid fund movement", level: "High", color: "text-red-400 bg-red-950/60 border-red-800" },
      { label: "Multiple small transfers", level: "Medium", color: "text-amber-400 bg-amber-950/60 border-amber-800" },
      { label: "Interaction with mixer", level: "High", color: "text-red-400 bg-red-950/60 border-red-800" },
      { label: "Link to known scam cluster", level: "Medium", color: "text-amber-400 bg-amber-950/60 border-amber-800" },
    ],
    recommendations: [
      "Examine Binance wallet activity and request KYC records via VASP interface",
      "Trace subsequent peeling chain funds exiting Wallet C into Tornado Cash pool",
      "Flag Wallet B for continuous velocity monitoring and automated freeze alert",
    ],
    ethBucket: {
      totalAmount: 14.85,
      txCount: 8,
      recentTxs: [
        { id: 1, amount: "+1.2 ETH", from: "Victim Deposit", time: "10:24" },
        { id: 2, amount: "+0.8 ETH", from: "Suspect Wallet", time: "11:03" },
        { id: 3, amount: "+0.5 ETH", from: "Relay Wallet A", time: "14:22" },
        { id: 4, amount: "+2.1 ETH", from: "Hot Wallet Relay", time: "15:40" },
      ]
    },
    usdtBucket: {
      totalAmount: 68400,
      txCount: 14,
      recentTxs: [
        { id: 1, amount: "+$2,500 USDT", from: "Suspect Wallet", time: "12:17" },
        { id: 2, amount: "+$4,000 USDT", from: "Suspect Wallet", time: "15:10" },
        { id: 3, amount: "+$12,500 USDT", from: "Binance Liquidity", time: "16:03" },
        { id: 4, amount: "+$8,200 USDT", from: "Peeling Chain C", time: "16:45" },
      ]
    },
    graph: {
      nodes: [
        { id: "victim", label: "Victim", address: "0x12ab...9f3e", type: "victim", x: 60, y: 190, color: "#00d2ff" },
        { id: "suspect", label: "Suspect Wallet", address: "0x3a7f...f3a2", type: "suspect", x: 190, y: 190, color: "#ef4444", pulse: true },
        { id: "walletA", label: "Wallet A", address: "0x5e2a...1a7c", type: "wallet", x: 340, y: 100, color: "#3b82f6" },
        { id: "walletB", label: "Wallet B", address: "0x6c3e...5b8a", type: "wallet", x: 340, y: 190, color: "#3b82f6" },
        { id: "walletC", label: "Wallet C", address: "0x9d7b...2e4f", type: "wallet", x: 340, y: 280, color: "#3b82f6" },
        { id: "walletD", label: "Wallet D", address: "0x5e2a...7c1d", type: "wallet", x: 480, y: 100, color: "#3b82f6" },
        { id: "binance", label: "Binance", address: "0x4f9c...8d2c", type: "exchange", x: 500, y: 190, color: "#f59e0b" },
        { id: "tornado", label: "Tornado Cash", address: "0x0000...0001", type: "mixer", x: 500, y: 280, color: "#a855f7" },
      ],
      edges: [
        { id: "e1", from: "victim", to: "suspect", amount: "1.2 ETH", token: "ETH", val: 1.2 },
        { id: "e2", from: "suspect", to: "walletA", amount: "0.8 ETH", token: "ETH", val: 0.8 },
        { id: "e3", from: "suspect", to: "walletB", amount: "2,500 USDT", token: "USDT", val: 2500 },
        { id: "e4", from: "suspect", to: "walletC", amount: "4,000 USDT", token: "USDT", val: 4000 },
        { id: "e5", from: "walletA", to: "walletD", amount: "0.5 ETH", token: "ETH", val: 0.5 },
        { id: "e6", from: "walletB", to: "binance", amount: "2,500 USDT", token: "USDT", val: 2500 },
        { id: "e7", from: "walletC", to: "tornado", amount: "4,000 USDT", token: "USDT", val: 4000 },
      ]
    },
    transactions: [
      { id: 1, txHash: "0x9d11a...7d9c", from: "0x12ab...9f3e", to: "0x3a7f...f3a2", amount: "1.2", token: "ETH", time: "12 Apr 10:24", status: "Confirmed", risk: "High" },
      { id: 2, txHash: "0x4e7c...2d1f", from: "0x3a7f...f3a2", to: "0x5e2a...1a7c", amount: "0.8", token: "ETH", time: "12 Apr 11:03", status: "Confirmed", risk: "Medium" },
      { id: 3, txHash: "0x69d2...6a4e", from: "0x3a7f...f3a2", to: "0x6c3e...5b8a", amount: "2,500", token: "USDT", time: "12 Apr 12:17", status: "Confirmed", risk: "Medium" },
      { id: 4, txHash: "0x61a...3e7b", from: "0x6c3e...5b8a", to: "0x4f9c...8d2c", amount: "2,500", token: "USDT", time: "12 Apr 15:10", status: "Confirmed", risk: "Low" },
      { id: 5, txHash: "0x2d8c...9f0a", from: "0x9d7b...2e4f", to: "0x0000...0001", amount: "4,000", token: "USDT", time: "12 Apr 16:03", status: "Confirmed", risk: "Critical" },
      { id: 6, txHash: "0x7e3b...5a1c", from: "0x3a7f...f3a2", to: "0x5e2a...7c1d", amount: "0.5", token: "ETH", time: "12 Apr 14:22", status: "Confirmed", risk: "Medium" },
    ]
  },
  {
    id: 2,
    caseId: "CN-1025",
    title: "Cross-Chain Bridge Peeling Scheme",
    caseType: "Cross-Chain Laundering",
    status: "Active",
    priority: "Critical",
    assignedTo: "R. Verma",
    created: "13 Apr 2025, 09:15",
    dateCreated: "13 Apr 2025",
    lastUpdated: "14 Apr 2025, 18:20",
    suspectWallet: "0x71c892a0149f82de801c84102948192038491028",
    riskScore: 94,
    riskCategory: "Suspicious",
    totalFundsTracedINR: "₹ 82,40,150",
    totalFundsTracedBTC: "~ 28.40 ETH / $94.5K USDT",
    hops: 5,
    transactionsCount: 215,
    vaspCount: "3 Identified",
    investigator: "R. Verma",
    department: "Directorate of Financial Investigation",
    balanceBTC: "28.40 ETH",
    balanceINR: "₹ 82,40,150",
    firstSeen: "13 Apr 2025, 08:40",
    lastSeen: "14 Apr 2025, 18:20",
    tags: ["Bridge Exploitation", "Peeling Chain", "Suspicious", "Cross-chain"],
    detectedEntities: [
      { name: "Arbitrum Bridge", type: "Cross-Chain Bridge", confidence: "99%", status: "Identified", risk: "High" },
      { name: "KuCoin", type: "Exchange / VASP", confidence: "94%", status: "Identified", risk: "Medium" },
      { name: "Uniswap V3", type: "DEX Pool", confidence: "89%", status: "Monitored", risk: "Low" },
    ],
    suspiciousPatterns: [
      { label: "Rapid Cross-Chain Hop", level: "High", color: "text-red-400 bg-red-950/60 border-red-800" },
      { label: "High Velocity Peeling", level: "Critical", color: "text-purple-400 bg-purple-950/60 border-purple-800" },
      { label: "Smurfing into Sub-accounts", level: "High", color: "text-red-400 bg-red-950/60 border-red-800" },
    ],
    recommendations: [
      "Issue emergency Section 91 freeze request to KuCoin compliance desk",
      "Monitor Arbitrum L2 bridge relayer contract exit addresses",
      "Inspect associated Uniswap liquidity pool deposit hashes",
    ],
    ethBucket: {
      totalAmount: 28.40,
      txCount: 19,
      recentTxs: [
        { id: 1, amount: "+8.5 ETH", from: "Bridge Relayer", time: "09:30" },
        { id: 2, amount: "+12.4 ETH", from: "Stolen Treasury", time: "11:15" },
        { id: 3, amount: "+4.2 ETH", from: "Relay Node 2", time: "14:10" },
        { id: 4, amount: "+3.3 ETH", from: "DEX Swap Liquidity", time: "17:45" },
      ]
    },
    usdtBucket: {
      totalAmount: 94500,
      txCount: 26,
      recentTxs: [
        { id: 1, amount: "+$32,000 USDT", from: "Arbitrum Bridge Out", time: "10:05" },
        { id: 2, amount: "+$24,500 USDT", from: "Sub-wallet Alpha", time: "13:40" },
        { id: 3, amount: "+$18,000 USDT", from: "KuCoin Deposit Hop", time: "16:20" },
        { id: 4, amount: "+$20,000 USDT", from: "Splitter Node B", time: "18:00" },
      ]
    },
    graph: {
      nodes: [
        { id: "victim", label: "DeFi Treasury", address: "0x892a...12c4", type: "victim", x: 60, y: 190, color: "#00d2ff" },
        { id: "suspect", label: "Suspect Wallet", address: "0x71c8...1028", type: "suspect", x: 190, y: 190, color: "#ef4444", pulse: true },
        { id: "walletA", label: "Bridge Hop A", address: "0x32ba...891f", type: "wallet", x: 340, y: 120, color: "#3b82f6" },
        { id: "walletB", label: "Bridge Hop B", address: "0x44cd...992e", type: "wallet", x: 340, y: 260, color: "#3b82f6" },
        { id: "bridge", label: "Arbitrum Bridge", address: "0x00a1...22b1", type: "bridge", x: 490, y: 120, color: "#10b981" },
        { id: "kucoin", label: "KuCoin Deposit", address: "0x6cc5...9b21", type: "exchange", x: 490, y: 260, color: "#f59e0b" },
      ],
      edges: [
        { id: "e1", from: "victim", to: "suspect", amount: "28.4 ETH", token: "ETH", val: 28.4 },
        { id: "e2", from: "suspect", to: "walletA", amount: "15.0 ETH", token: "ETH", val: 15.0 },
        { id: "e3", from: "suspect", to: "walletB", amount: "50,000 USDT", token: "USDT", val: 50000 },
        { id: "e4", from: "walletA", to: "bridge", amount: "13.4 ETH", token: "ETH", val: 13.4 },
        { id: "e5", from: "walletB", to: "kucoin", amount: "44,500 USDT", token: "USDT", val: 44500 },
      ]
    },
    transactions: [
      { id: 1, txHash: "0x71a...92bc", from: "0x892a...12c4", to: "0x71c8...1028", amount: "28.4", token: "ETH", time: "13 Apr 09:15", status: "Confirmed", risk: "Critical" },
      { id: 2, txHash: "0x82c...11df", from: "0x71c8...1028", to: "0x32ba...891f", amount: "15.0", token: "ETH", time: "13 Apr 11:20", status: "Confirmed", risk: "High" },
      { id: 3, txHash: "0x93e...44aa", from: "0x71c8...1028", to: "0x44cd...992e", amount: "50,000", token: "USDT", time: "13 Apr 12:45", status: "Confirmed", risk: "Critical" },
      { id: 4, txHash: "0x11b...55fe", from: "0x44cd...992e", to: "0x6cc5...9b21", amount: "44,500", token: "USDT", time: "14 Apr 16:30", status: "Confirmed", risk: "High" },
    ]
  },
  {
    id: 3,
    caseId: "CN-1026",
    title: "Ransomware Extortion Fund Tracing",
    caseType: "Ransomware / Extortion",
    status: "Active",
    priority: "High",
    assignedTo: "P. Singh",
    created: "14 Apr 2025, 11:00",
    dateCreated: "14 Apr 2025",
    lastUpdated: "14 Apr 2025, 19:10",
    suspectWallet: "0x9481029384910293840192840192849102839481",
    riskScore: 98,
    riskCategory: "High Risk",
    totalFundsTracedINR: "₹ 1,24,60,000",
    totalFundsTracedBTC: "~ 42.50 ETH / $148K USDT",
    hops: 6,
    transactionsCount: 342,
    vaspCount: "4 Identified",
    investigator: "P. Singh",
    department: "National Cyber Coordination Center",
    balanceBTC: "42.50 ETH",
    balanceINR: "₹ 1,24,60,000",
    firstSeen: "14 Apr 2025, 06:10",
    lastSeen: "14 Apr 2025, 19:10",
    tags: ["Ransomware", "OFAC Sanctions", "LockBit", "High Risk"],
    detectedEntities: [
      { name: "Tornado Cash", type: "Mixer / Tumbler", confidence: "99%", status: "Identified", risk: "Critical" },
      { name: "Kraken", type: "Exchange / VASP", confidence: "92%", status: "Identified", risk: "Medium" },
      { name: "FixedFloat", type: "Instant Swap", confidence: "86%", status: "Monitored", risk: "High" },
    ],
    suspiciousPatterns: [
      { label: "Known Ransomware Cluster", level: "Critical", color: "text-red-400 bg-red-950/60 border-red-800" },
      { label: "OFAC Sanctions Direct Hit", level: "Critical", color: "text-red-400 bg-red-950/60 border-red-800" },
      { label: "Automated Splitting Scripts", level: "High", color: "text-red-400 bg-red-950/60 border-red-800" },
    ],
    recommendations: [
      "File immediate OFAC regulatory alert for identified destination addresses",
      "Request Kraken freeze deposit UID linked to transaction #91204",
      "Trace secondary mixer peeling chains for off-ramp bank identification",
    ],
    ethBucket: {
      totalAmount: 42.50,
      txCount: 34,
      recentTxs: [
        { id: 1, amount: "+15.0 ETH", from: "Ransom Extortion", time: "11:25" },
        { id: 2, amount: "+12.5 ETH", from: "Victim Corporate Escrow", time: "12:50" },
        { id: 3, amount: "+8.0 ETH", from: "Feeder Relay", time: "16:10" },
        { id: 4, amount: "+7.0 ETH", from: "Peeling Splitter", time: "18:30" },
      ]
    },
    usdtBucket: {
      totalAmount: 148000,
      txCount: 41,
      recentTxs: [
        { id: 1, amount: "+$60,000 USDT", from: "Corporate Treasury", time: "11:00" },
        { id: 2, amount: "+$45,000 USDT", from: "Splitter Alpha", time: "14:15" },
        { id: 3, amount: "+$25,000 USDT", from: "Tornado Cash Pool", time: "17:00" },
        { id: 4, amount: "+$18,000 USDT", from: "Off-ramp Staging", time: "18:45" },
      ]
    },
    graph: {
      nodes: [
        { id: "victim", label: "Hospital Escrow", address: "0x44bb...119c", type: "victim", x: 60, y: 190, color: "#00d2ff" },
        { id: "suspect", label: "LockBit Receptor", address: "0x9481...9481", type: "suspect", x: 190, y: 190, color: "#ef4444", pulse: true },
        { id: "walletA", label: "Splitter Alpha", address: "0x1122...3344", type: "wallet", x: 340, y: 110, color: "#3b82f6" },
        { id: "walletB", label: "Splitter Beta", address: "0x5566...7788", type: "wallet", x: 340, y: 270, color: "#3b82f6" },
        { id: "tornado", label: "Tornado Cash", address: "0x0000...0001", type: "mixer", x: 490, y: 110, color: "#a855f7" },
        { id: "kraken", label: "Kraken Deposit", address: "0x7788...9900", type: "exchange", x: 490, y: 270, color: "#f59e0b" },
      ],
      edges: [
        { id: "e1", from: "victim", to: "suspect", amount: "42.5 ETH", token: "ETH", val: 42.5 },
        { id: "e2", from: "suspect", to: "walletA", amount: "20.0 ETH", token: "ETH", val: 20.0 },
        { id: "e3", from: "suspect", to: "walletB", amount: "80,000 USDT", token: "USDT", val: 80000 },
        { id: "e4", from: "walletA", to: "tornado", amount: "20.0 ETH", token: "ETH", val: 20.0 },
        { id: "e5", from: "walletB", to: "kraken", amount: "68,000 USDT", token: "USDT", val: 68000 },
      ]
    },
    transactions: [
      { id: 1, txHash: "0x44a...991e", from: "0x44bb...119c", to: "0x9481...9481", amount: "42.5", token: "ETH", time: "14 Apr 11:00", status: "Confirmed", risk: "Critical" },
      { id: 2, txHash: "0x55b...882d", from: "0x9481...9481", to: "0x1122...3344", amount: "20.0", token: "ETH", time: "14 Apr 12:30", status: "Confirmed", risk: "Critical" },
      { id: 3, txHash: "0x66c...773c", from: "0x9481...9481", to: "0x5566...7788", amount: "80,000", token: "USDT", time: "14 Apr 13:45", status: "Confirmed", risk: "Critical" },
    ]
  },
  {
    id: 4,
    caseId: "CN-1023",
    title: "Decentralized Mixer Tumbler Wash",
    caseType: "Mixer Investigation",
    status: "Under Review",
    priority: "Medium",
    assignedTo: "K. Mehta",
    created: "11 Apr 2025, 16:40",
    dateCreated: "11 Apr 2025",
    lastUpdated: "13 Apr 2025, 12:15",
    suspectWallet: "0x892a1fe984dc092a71d87f5492ac012b84910284",
    riskScore: 72,
    riskCategory: "Medium Risk",
    totalFundsTracedINR: "₹ 24,10,800",
    totalFundsTracedBTC: "~ 7.35 ETH / $28.9K USDT",
    hops: 3,
    transactionsCount: 74,
    vaspCount: "2 Identified",
    investigator: "K. Mehta",
    department: "Financial Intelligence Unit",
    balanceBTC: "7.35 ETH",
    balanceINR: "₹ 24,10,800",
    firstSeen: "11 Apr 2025, 12:10",
    lastSeen: "13 Apr 2025, 12:15",
    tags: ["Mixer", "Tumbler", "Under Review", "Layer-2"],
    detectedEntities: [
      { name: "Railgun Privacy", type: "DeFi Privacy Pool", confidence: "91%", status: "Identified", risk: "High" },
      { name: "OKX", type: "Exchange / VASP", confidence: "88%", status: "Identified", risk: "Medium" },
    ],
    suspiciousPatterns: [
      { label: "Zero-Knowledge Anonymization", level: "High", color: "text-amber-400 bg-amber-950/60 border-amber-800" },
      { label: "Multi-sig Withdrawal", level: "Medium", color: "text-blue-400 bg-blue-950/60 border-blue-800" },
    ],
    recommendations: [
      "Review Railgun anonymizer deposits for timing correlation",
      "Dispatch preservation request to OKX compliance for target UID",
    ],
    ethBucket: {
      totalAmount: 7.35,
      txCount: 6,
      recentTxs: [
        { id: 1, amount: "+3.2 ETH", from: "Privacy Pool Relay", time: "12:15" },
        { id: 2, amount: "+2.5 ETH", from: "Unmasked Hop", time: "14:20" },
        { id: 3, amount: "+1.65 ETH", from: "L2 Staging", time: "16:40" },
      ]
    },
    usdtBucket: {
      totalAmount: 28900,
      txCount: 11,
      recentTxs: [
        { id: 1, amount: "+$12,000 USDT", from: "OKX Liquidity", time: "13:00" },
        { id: 2, amount: "+$9,500 USDT", from: "Relay Node 4", time: "15:30" },
        { id: 3, amount: "+$7,400 USDT", from: "Peeling Outflow", time: "17:10" },
      ]
    },
    graph: {
      nodes: [
        { id: "victim", label: "Seed Wallet", address: "0x55aa...33bb", type: "victim", x: 60, y: 190, color: "#00d2ff" },
        { id: "suspect", label: "Tumbler Feeder", address: "0x892a...0284", type: "suspect", x: 190, y: 190, color: "#ef4444", pulse: true },
        { id: "railgun", label: "Railgun Pool", address: "0x1212...3434", type: "mixer", x: 360, y: 130, color: "#a855f7" },
        { id: "okx", label: "OKX Deposit", address: "0x5656...7878", type: "exchange", x: 360, y: 250, color: "#f59e0b" },
      ],
      edges: [
        { id: "e1", from: "victim", to: "suspect", amount: "7.35 ETH", token: "ETH", val: 7.35 },
        { id: "e2", from: "suspect", to: "railgun", amount: "4.5 ETH", token: "ETH", val: 4.5 },
        { id: "e3", from: "suspect", to: "okx", amount: "28,900 USDT", token: "USDT", val: 28900 },
      ]
    },
    transactions: [
      { id: 1, txHash: "0x12a...883c", from: "0x55aa...33bb", to: "0x892a...0284", amount: "7.35", token: "ETH", time: "11 Apr 16:40", status: "Confirmed", risk: "Medium" },
      { id: 2, txHash: "0x23b...994d", from: "0x892a...0284", to: "0x5656...7878", amount: "28,900", token: "USDT", time: "12 Apr 10:15", status: "Confirmed", risk: "Medium" },
    ]
  },
  {
    id: 5,
    caseId: "CN-1022",
    title: "Phishing & Fake Liquidity Drainer",
    caseType: "Scam / Phishing",
    status: "Active",
    priority: "High",
    assignedTo: "S. Khan",
    created: "10 Apr 2025, 08:30",
    dateCreated: "10 Apr 2025",
    lastUpdated: "14 Apr 2025, 14:05",
    suspectWallet: "0x4e8a102948192038491029481029481920384910",
    riskScore: 89,
    riskCategory: "High Risk",
    totalFundsTracedINR: "₹ 61,80,000",
    totalFundsTracedBTC: "~ 19.20 ETH / $72K USDT",
    hops: 4,
    transactionsCount: 188,
    vaspCount: "2 Identified",
    investigator: "S. Khan",
    department: "Cyber Crime Unit",
    balanceBTC: "19.20 ETH",
    balanceINR: "₹ 61,80,000",
    firstSeen: "10 Apr 2025, 07:15",
    lastSeen: "14 Apr 2025, 14:05",
    tags: ["Phishing", "Permit Drainer", "Scam", "High Risk"],
    detectedEntities: [
      { name: "Uniswap Router", type: "DEX Protocol", confidence: "96%", status: "Identified", risk: "Low" },
      { name: "Bybit", type: "Exchange / VASP", confidence: "93%", status: "Identified", risk: "Medium" },
    ],
    suspiciousPatterns: [
      { label: "ERC20 Permit Signature Exploit", level: "Critical", color: "text-red-400 bg-red-950/60 border-red-800" },
      { label: "Direct DEX Liquidity Dump", level: "High", color: "text-red-400 bg-red-950/60 border-red-800" },
    ],
    recommendations: [
      "Contact Bybit security desk for emergency deposit account freeze",
      "Trace liquidity provider tokens redeemed on Uniswap pools",
    ],
    ethBucket: {
      totalAmount: 19.20,
      txCount: 12,
      recentTxs: [
        { id: 1, amount: "+8.2 ETH", from: "Drained Victim A", time: "08:30" },
        { id: 2, amount: "+6.0 ETH", from: "Drained Victim B", time: "11:15" },
        { id: 3, amount: "+5.0 ETH", from: "Drainer Contract", time: "14:00" },
      ]
    },
    usdtBucket: {
      totalAmount: 72000,
      txCount: 22,
      recentTxs: [
        { id: 1, amount: "+$35,000 USDT", from: "Uniswap Router Dump", time: "09:00" },
        { id: 2, amount: "+$22,000 USDT", from: "Stolen Vault", time: "12:30" },
        { id: 3, amount: "+$15,000 USDT", from: "Bybit Staging", time: "13:50" },
      ]
    },
    graph: {
      nodes: [
        { id: "victim", label: "Phished Victim", address: "0x3344...5566", type: "victim", x: 60, y: 190, color: "#00d2ff" },
        { id: "suspect", label: "Drainer Contract", address: "0x4e8a...4910", type: "suspect", x: 190, y: 190, color: "#ef4444", pulse: true },
        { id: "uniswap", label: "Uniswap V2", address: "0x7a25...812d", type: "exchange", x: 360, y: 120, color: "#f59e0b" },
        { id: "bybit", label: "Bybit Deposit", address: "0x8899...0011", type: "exchange", x: 360, y: 260, color: "#f59e0b" },
      ],
      edges: [
        { id: "e1", from: "victim", to: "suspect", amount: "19.2 ETH", token: "ETH", val: 19.2 },
        { id: "e2", from: "suspect", to: "uniswap", amount: "12.0 ETH", token: "ETH", val: 12.0 },
        { id: "e3", from: "suspect", to: "bybit", amount: "72,000 USDT", token: "USDT", val: 72000 },
      ]
    },
    transactions: [
      { id: 1, txHash: "0x33b...11aa", from: "0x3344...5566", to: "0x4e8a...4910", amount: "19.2", token: "ETH", time: "10 Apr 08:30", status: "Confirmed", risk: "Critical" },
      { id: 2, txHash: "0x44c...22bb", from: "0x4e8a...4910", to: "0x8899...0011", amount: "72,000", token: "USDT", time: "10 Apr 11:45", status: "Confirmed", risk: "High" },
    ]
  },
  {
    id: 6,
    caseId: "CN-1021",
    title: "Illegal Exchange P2P Hawala Ring",
    caseType: "VASP Violation",
    status: "Under Review",
    priority: "Medium",
    assignedTo: "K. Mehta",
    created: "09 Apr 2025, 13:20",
    dateCreated: "09 Apr 2025",
    lastUpdated: "12 Apr 2025, 17:50",
    suspectWallet: "0x5e2a114e9acbf0987114da2bcde0817291a7c1d2",
    riskScore: 58,
    riskCategory: "Medium Risk",
    totalFundsTracedINR: "₹ 32,50,000",
    totalFundsTracedBTC: "~ 9.80 ETH / $41.2K USDT",
    hops: 3,
    transactionsCount: 96,
    vaspCount: "2 Identified",
    investigator: "K. Mehta",
    department: "Economic Offences Wing",
    balanceBTC: "9.80 ETH",
    balanceINR: "₹ 32,50,000",
    firstSeen: "09 Apr 2025, 11:00",
    lastSeen: "12 Apr 2025, 17:50",
    tags: ["VASP Violation", "P2P Off-Ramp", "Hawala", "Medium Risk"],
    detectedEntities: [
      { name: "Huobi", type: "Exchange / VASP", confidence: "95%", status: "Identified", risk: "Medium" },
      { name: "Gate.io", type: "Exchange / VASP", confidence: "87%", status: "Identified", risk: "Low" },
    ],
    suspiciousPatterns: [
      { label: "Cyclic P2P Merchant Inflows", level: "Medium", color: "text-amber-400 bg-amber-950/60 border-amber-800" },
      { label: "Frequent Non-KYC Cashouts", level: "High", color: "text-red-400 bg-red-950/60 border-red-800" },
    ],
    recommendations: [
      "Issue KYC record demand to Huobi legal for registered bank accounts",
      "Cross-check suspicious IFSC routes against FIU-IND reports",
    ],
    ethBucket: {
      totalAmount: 9.80,
      txCount: 9,
      recentTxs: [
        { id: 1, amount: "+4.5 ETH", from: "P2P Seller Node", time: "13:20" },
        { id: 2, amount: "+3.3 ETH", from: "Hawala Desk Relay", time: "15:40" },
        { id: 3, amount: "+2.0 ETH", from: "Cashout Staging", time: "17:15" },
      ]
    },
    usdtBucket: {
      totalAmount: 41200,
      txCount: 15,
      recentTxs: [
        { id: 1, amount: "+$18,000 USDT", from: "Huobi Sub-wallet", time: "14:10" },
        { id: 2, amount: "+$14,200 USDT", from: "Gate.io Internal", time: "16:00" },
        { id: 3, amount: "+$9,000 USDT", from: "P2P Liquidity", time: "17:30" },
      ]
    },
    graph: {
      nodes: [
        { id: "victim", label: "Hawala Pool", address: "0x1133...5577", type: "victim", x: 60, y: 190, color: "#00d2ff" },
        { id: "suspect", label: "P2P Merchant", address: "0x5e2a...c1d2", type: "suspect", x: 190, y: 190, color: "#ef4444", pulse: true },
        { id: "huobi", label: "Huobi Deposit", address: "0x9900...1122", type: "exchange", x: 360, y: 130, color: "#f59e0b" },
        { id: "gate", label: "Gate.io Relay", address: "0x3344...5566", type: "exchange", x: 360, y: 250, color: "#f59e0b" },
      ],
      edges: [
        { id: "e1", from: "victim", to: "suspect", amount: "9.80 ETH", token: "ETH", val: 9.80 },
        { id: "e2", from: "suspect", to: "huobi", amount: "25,000 USDT", token: "USDT", val: 25000 },
        { id: "e3", from: "suspect", to: "gate", amount: "16,200 USDT", token: "USDT", val: 16200 },
      ]
    },
    transactions: [
      { id: 1, txHash: "0x55d...33aa", from: "0x1133...5577", to: "0x5e2a...c1d2", amount: "9.80", token: "ETH", time: "09 Apr 13:20", status: "Confirmed", risk: "Medium" },
      { id: 2, txHash: "0x66e...44bb", from: "0x5e2a...c1d2", to: "0x9900...1122", amount: "25,000", token: "USDT", time: "09 Apr 15:40", status: "Confirmed", risk: "Medium" },
    ]
  },
  {
    id: 7,
    caseId: "CN-1020",
    title: "NFT Wash Trading & Synthetic Bids",
    caseType: "Market Manipulation",
    status: "Closed",
    priority: "Low",
    assignedTo: "A. Sharma",
    created: "08 Apr 2025, 10:10",
    dateCreated: "08 Apr 2025",
    lastUpdated: "10 Apr 2025, 11:30",
    suspectWallet: "0x12a9bc045f89c02d184724bcae34091a89201948",
    riskScore: 28,
    riskCategory: "Low Risk",
    totalFundsTracedINR: "₹ 8,90,000",
    totalFundsTracedBTC: "~ 2.75 ETH / $11.5K USDT",
    hops: 2,
    transactionsCount: 42,
    vaspCount: "1 Identified",
    investigator: "A. Sharma",
    department: "Securities Fraud Division",
    balanceBTC: "2.75 ETH",
    balanceINR: "₹ 8,90,000",
    firstSeen: "08 Apr 2025, 09:00",
    lastSeen: "10 Apr 2025, 11:30",
    tags: ["NFT Fraud", "Wash Trading", "Low Risk", "Closed"],
    detectedEntities: [
      { name: "OpenSea", type: "NFT Marketplace", confidence: "98%", status: "Identified", risk: "Low" },
    ],
    suspiciousPatterns: [
      { label: "Circular Bidding Loop", level: "Low", color: "text-emerald-400 bg-emerald-950/60 border-emerald-800" },
    ],
    recommendations: [
      "Case completed. Flagged address added to non-critical intelligence repository.",
    ],
    ethBucket: {
      totalAmount: 2.75,
      txCount: 4,
      recentTxs: [
        { id: 1, amount: "+1.5 ETH", from: "Seaport Router", time: "10:10" },
        { id: 2, amount: "+1.25 ETH", from: "Wash Bidder", time: "11:20" },
      ]
    },
    usdtBucket: {
      totalAmount: 11500,
      txCount: 6,
      recentTxs: [
        { id: 1, amount: "+$6,500 USDT", from: "Synthetic Settlement", time: "10:30" },
        { id: 2, amount: "+$5,000 USDT", from: "Bid Refund", time: "12:00" },
      ]
    },
    graph: {
      nodes: [
        { id: "victim", label: "Bidder Wallet", address: "0x7788...99aa", type: "victim", x: 80, y: 190, color: "#00d2ff" },
        { id: "suspect", label: "NFT Creator", address: "0x12a9...1948", type: "suspect", x: 240, y: 190, color: "#10b981", pulse: false },
        { id: "opensea", label: "OpenSea Seaport", address: "0x0000...000a", type: "exchange", x: 420, y: 190, color: "#3b82f6" },
      ],
      edges: [
        { id: "e1", from: "victim", to: "suspect", amount: "2.75 ETH", token: "ETH", val: 2.75 },
        { id: "e2", from: "suspect", to: "opensea", amount: "11,500 USDT", token: "USDT", val: 11500 },
      ]
    },
    transactions: [
      { id: 1, txHash: "0x77e...55aa", from: "0x7788...99aa", to: "0x12a9...1948", amount: "2.75", token: "ETH", time: "08 Apr 10:10", status: "Confirmed", risk: "Low" },
    ]
  },
  {
    id: 8,
    caseId: "CN-1019",
    title: "State-Sponsored Cyber Espionage Siphon",
    caseType: "Advanced Persistent Threat",
    status: "Active",
    priority: "Critical",
    assignedTo: "P. Singh",
    created: "07 Apr 2025, 15:45",
    dateCreated: "07 Apr 2025",
    lastUpdated: "14 Apr 2025, 19:40",
    suspectWallet: "0x9812ba9c87f654e3210fabcd901234ef89102948",
    riskScore: 99,
    riskCategory: "Suspicious",
    totalFundsTracedINR: "₹ 2,15,40,000",
    totalFundsTracedBTC: "~ 68.50 ETH / $260K USDT",
    hops: 6,
    transactionsCount: 480,
    vaspCount: "4 Identified",
    investigator: "P. Singh",
    department: "National Intelligence Grid",
    balanceBTC: "68.50 ETH",
    balanceINR: "₹ 2,15,40,000",
    firstSeen: "07 Apr 2025, 14:00",
    lastSeen: "14 Apr 2025, 19:40",
    tags: ["Lazarus Sub-Cluster", "Suspicious", "OFAC Sanctions", "Zero-Day"],
    detectedEntities: [
      { name: "Sinbad Mixer", type: "OFAC Sanctioned Mixer", confidence: "99%", status: "Identified", risk: "Critical" },
      { name: "Tornado Cash", type: "Mixer / Tumbler", confidence: "97%", status: "Identified", risk: "Critical" },
      { name: "FixedFloat", type: "Instant Swap", confidence: "91%", status: "Monitored", risk: "High" },
    ],
    suspiciousPatterns: [
      { label: "Lazarus Heuristic Signature", level: "Critical", color: "text-purple-400 bg-purple-950/60 border-purple-800" },
      { label: "Mempool Frontrunning Obfuscation", level: "Critical", color: "text-red-400 bg-red-950/60 border-red-800" },
    ],
    recommendations: [
      "Execute multilateral mutual legal assistance treaty (MLAT) preservation requests",
      "Add full cluster to national watchlist for automated mempool interception",
    ],
    ethBucket: {
      totalAmount: 68.50,
      txCount: 48,
      recentTxs: [
        { id: 1, amount: "+24.0 ETH", from: "Bridge Siphon", time: "15:45" },
        { id: 2, amount: "+20.5 ETH", from: "Zero-Day Inflow", time: "16:30" },
        { id: 3, amount: "+14.0 ETH", from: "Staging Node 9", time: "18:00" },
        { id: 4, amount: "+10.0 ETH", from: "Sinbad Deposit", time: "19:20" },
      ]
    },
    usdtBucket: {
      totalAmount: 260000,
      txCount: 56,
      recentTxs: [
        { id: 1, amount: "+$110,000 USDT", from: "Exchange Infiltration", time: "15:50" },
        { id: 2, amount: "+$85,000 USDT", from: "Mixer Exit Hop", time: "17:15" },
        { id: 3, amount: "+$65,000 USDT", from: "FixedFloat Swap", time: "19:00" },
      ]
    },
    graph: {
      nodes: [
        { id: "victim", label: "Central Bank Escrow", address: "0x0011...2233", type: "victim", x: 60, y: 190, color: "#00d2ff" },
        { id: "suspect", label: "APT Infiltration", address: "0x9812...2948", type: "suspect", x: 190, y: 190, color: "#ef4444", pulse: true },
        { id: "sinbad", label: "Sinbad Mixer", address: "0x4455...6677", type: "mixer", x: 360, y: 120, color: "#a855f7" },
        { id: "tornado", label: "Tornado Cash", address: "0x0000...0001", type: "mixer", x: 360, y: 260, color: "#a855f7" },
      ],
      edges: [
        { id: "e1", from: "victim", to: "suspect", amount: "68.5 ETH", token: "ETH", val: 68.5 },
        { id: "e2", from: "suspect", to: "sinbad", amount: "35.0 ETH", token: "ETH", val: 35.0 },
        { id: "e3", from: "suspect", to: "tornado", amount: "150,000 USDT", token: "USDT", val: 150000 },
      ]
    },
    transactions: [
      { id: 1, txHash: "0x99f...11bb", from: "0x0011...2233", to: "0x9812...2948", amount: "68.5", token: "ETH", time: "07 Apr 15:45", status: "Confirmed", risk: "Critical" },
    ]
  }
];

// Helper to truncate wallet
function shortWallet(address = "") {
  if (!address) return "";
  const str = String(address);
  if (str.length <= 16) return str;
  return `${str.slice(0, 8)}...${str.slice(-6)}`;
}

// Helper for risk badge styling (GIGW Compliant Solid Colors)
function getRiskBadge(riskCategory = "", riskScore = 0) {
  const norm = (riskCategory || "").toLowerCase();
  if (norm.includes("suspicious")) {
    return {
      label: "Suspicious",
      class: "bg-purple-100 dark:bg-purple-950 text-purple-850 dark:text-purple-300 border border-purple-300 dark:border-purple-700",
      dotClass: "bg-purple-600 dark:bg-purple-400",
      cardClass: "case-card-suspicious"
    };
  }
  if (norm.includes("high") || riskScore >= 70) {
    return {
      label: "High Risk",
      class: "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700",
      dotClass: "bg-red-600 dark:bg-red-400",
      cardClass: "case-card-high-risk"
    };
  }
  if (norm.includes("medium") || (riskScore >= 40 && riskScore < 70)) {
    return {
      label: "Medium Risk",
      class: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700",
      dotClass: "bg-amber-600 dark:bg-amber-400",
      cardClass: "case-card-medium-risk"
    };
  }
  return {
    label: "Low Risk",
    class: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700",
    dotClass: "bg-emerald-600 dark:bg-emerald-400",
    cardClass: "case-card-low-risk"
  };
}

export default function WalletSearchPage() {
  const { setActiveCase, setCurrentPage, showToast, setIsSahyogModalOpen } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [copiedWallet, setCopiedWallet] = useState(null);

  // Quick Copy
  const copyToClipboard = (e, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedWallet(text);
    showToast("Wallet address copied to clipboard!", "success");
    setTimeout(() => setCopiedWallet(null), 2000);
  };

  // Seamless Dashboard Navigation when ANY Case Card is clicked
  const handleSelectCase = (caseItem) => {
    setActiveCase(caseItem);
    setCurrentPage('dashboard');
    showToast(`Loaded Case #${caseItem.caseId} Dashboard`, "success");
  };

  // Filtered Cases
  const filteredCases = useMemo(() => {
    return DETAILED_CASES_CATALOG.filter((c) => {
      // Search term across ID, title, wallet, tags, or investigator
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = c.caseId.toLowerCase().includes(q);
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchWallet = c.suspectWallet.toLowerCase().includes(q);
        const matchTags = c.tags.some((t) => t.toLowerCase().includes(q));
        const matchInvestigator = (c.assignedTo || "").toLowerCase().includes(q);
        if (!matchId && !matchTitle && !matchWallet && !matchTags && !matchInvestigator) {
          return false;
        }
      }

      // Risk filter
      if (selectedRiskFilter !== "All") {
        if (selectedRiskFilter === "Suspicious" && !c.riskCategory.toLowerCase().includes("suspicious")) {
          return false;
        }
        if (selectedRiskFilter === "High Risk" && (!c.riskCategory.toLowerCase().includes("high") || c.riskCategory.toLowerCase().includes("suspicious"))) {
          return false;
        }
        if (selectedRiskFilter === "Medium Risk" && !c.riskCategory.toLowerCase().includes("medium")) {
          return false;
        }
        if (selectedRiskFilter === "Low Risk" && !c.riskCategory.toLowerCase().includes("low")) {
          return false;
        }
      }

      // Status filter
      if (selectedStatusFilter !== "All" && c.status !== selectedStatusFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedRiskFilter, selectedStatusFilter]);

  // Total summary metrics for the case cards
  const totalCasesCount = DETAILED_CASES_CATALOG.length;
  const highRiskCount = DETAILED_CASES_CATALOG.filter(
    (c) => c.riskCategory === "High Risk" || c.riskCategory === "Suspicious"
  ).length;

  return (
    <div className="wallet-search-page p-4 lg:p-6 space-y-6 select-none">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & OVERVIEW METRICS (GIGW Compliant)        */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#0b142d] border border-slate-200 dark:border-[#1b2b52] rounded-lg p-5 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-[#162548]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-950/60 border border-blue-200 dark:border-cyan-800 px-2 py-0.5 rounded">
                MHA / I4C LEA REPOSITORY
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                TraceX Intelligence & SAHYOG Network
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>Case Directory & Wallet Intelligence</span>
            </h1>
          </div>

          {/* Quick Stat Highlights & SAHYOG Sync Button */}
          <div className="flex items-center gap-3">
            {/* Functional SAHYOG Portal Sync Button */}
            <button
              onClick={() => setIsSahyogModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-700/80 text-blue-900 dark:text-blue-200 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer shadow-xs"
              title="Fetch Case / Wallet from SAHYOG Portal (I4C Gateway)"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              <span>Fetch from SAHYOG Portal</span>
            </button>

            <div className="px-3.5 py-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#1b2b52] text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Critical / High Risk</span>
              <span className="text-base font-extrabold text-red-600 dark:text-red-400 font-mono">
                {highRiskCount} Cases
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#1b2b52] text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Total Funds Monitored</span>
              <span className="text-base font-extrabold text-blue-700 dark:text-cyan-300 font-mono">
                ₹ 5.8+ Cr
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. SEARCH & FILTER CONTROLS BAR                         */}
        {/* ======================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Search Input */}
          <div className="flex-1 min-w-[300px] relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Case ID (e.g. CN-1024), Title, Wallet Address, or Tag..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#070d1e] border border-slate-300 dark:border-[#1d2f5a] focus:border-blue-600 dark:focus:border-cyan-500 rounded-md text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Risk Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
              Risk:
            </span>
            {["All", "High Risk", "Suspicious", "Medium Risk", "Low Risk"].map((filter) => {
              const isSelected = selectedRiskFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setSelectedRiskFilter(filter)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? filter === "High Risk"
                        ? "bg-red-700 text-white"
                        : filter === "Suspicious"
                        ? "bg-purple-700 text-white"
                        : filter === "Medium Risk"
                        ? "bg-amber-600 text-white"
                        : filter === "Low Risk"
                        ? "bg-emerald-700 text-white"
                        : "bg-blue-700 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548] text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#101e40]"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mr-1">Status:</span>
            {["All", "Active", "Under Review", "Closed"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  selectedStatusFilter === st
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548] text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}

            {(searchQuery || selectedRiskFilter !== "All" || selectedStatusFilter !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRiskFilter("All");
                  setSelectedStatusFilter("All");
                }}
                className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-cyan-300 ml-1"
                title="Reset All Filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. GRID OF RECTANGULAR CASE CARDS                        */}
      {/* ======================================================== */}
      {filteredCases.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#0b142d] border border-slate-200 dark:border-[#1b2b52] rounded-lg shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Matching Cases Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No investigation cases match your current search query or risk filter. Try resetting your search terms.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedRiskFilter("All");
              setSelectedStatusFilter("All");
            }}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-md text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCases.map((caseItem) => {
            const riskInfo = getRiskBadge(caseItem.riskCategory, caseItem.riskScore);
            const isCopied = copiedWallet === caseItem.suspectWallet;

            return (
              <div
                key={caseItem.id}
                onClick={() => handleSelectCase(caseItem)}
                className={`case-card ${riskInfo.cardClass} p-5 flex flex-col justify-between cursor-pointer select-none group`}
              >
                {/* Top Row: Case ID, Risk Badge, and Status */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-[#070d1e] border border-blue-200 dark:border-[#1d2f5a] text-blue-800 dark:text-cyan-300">
                        Case #{caseItem.caseId}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                          caseItem.status === "Active"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                            : caseItem.status === "Under Review"
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                            : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            caseItem.status === "Active" ? "bg-emerald-600 dark:bg-emerald-400 animate-pulse" : "bg-slate-400"
                          }`}
                        ></span>
                        {caseItem.status}
                      </span>
                    </div>

                    {/* Risk Badge */}
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${riskInfo.class}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${riskInfo.dotClass}`}></span>
                      {caseItem.riskCategory} ({caseItem.riskScore}/100)
                    </span>
                  </div>

                  {/* Title & Case Type */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {caseItem.title}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
                    {caseItem.caseType} • Assigned to {caseItem.assignedTo}
                  </span>

                  {/* Suspect / Target Wallet Address Box */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 p-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548] flex items-center justify-between gap-2 group-hover:border-blue-400 dark:group-hover:border-[#1e3b75] transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Wallet className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                      <span
                        className="font-wallet text-[11px] text-blue-700 dark:text-cyan-300 truncate font-semibold"
                        title={caseItem.suspectWallet}
                      >
                        {shortWallet(caseItem.suspectWallet)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => copyToClipboard(e, caseItem.suspectWallet)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0"
                      title="Copy Suspect Wallet"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Key Quick Stats Grid (2x2) */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="p-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#142345]">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                        Total Funds Traced
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white leading-tight block">
                        {caseItem.totalFundsTracedINR}
                      </span>
                      <span className="text-[10px] text-blue-700 dark:text-cyan-400 font-mono truncate block">
                        {caseItem.totalFundsTracedBTC}
                      </span>
                    </div>

                    <div className="p-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#142345]">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                        Total Transactions
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white leading-tight block">
                        {caseItem.transactionsCount} Traced
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        {caseItem.hops} Hops Network
                      </span>
                    </div>

                    <div className="p-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#142345]">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                        Created Date
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-[11px] block">
                        {caseItem.dateCreated}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        {caseItem.investigator}
                      </span>
                    </div>

                    <div className="p-2 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#142345]">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                        Last Updated
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-[11px] block">
                        {caseItem.lastUpdated}
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                        Live Tracking
                      </span>
                    </div>
                  </div>

                  {/* Relevant Tags */}
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    {caseItem.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0e1c3d] text-slate-700 dark:text-blue-300 border border-slate-200 dark:border-[#1c366e] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Detected Entities Quick Chips */}
                  <div className="mt-2.5 flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                    <Building2 className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">VASPs:</span>
                    <span className="truncate text-slate-600 dark:text-slate-400">
                      {caseItem.detectedEntities.map((e) => e.name).join(", ")}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Trigger: View Case Dashboard */}
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#142345]">
                  <button
                    onClick={() => handleSelectCase(caseItem)}
                    className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-600 text-white rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-colors btn-card-action cursor-pointer shadow-xs"
                  >
                    <span>View Case Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
