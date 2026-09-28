import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  X, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  ArrowRight, 
  Download, 
  CheckCircle2, 
  FileCheck2,
  AlertCircle
} from 'lucide-react';

const SAHYOG_PORTAL_CASES = [
  {
    ncrpRef: "NCRP-2025-IN-98124",
    firNo: "FIR-442/2025 (Special Cell/IFSO)",
    statePolice: "Delhi Police (IFSO - Cyber Crime)",
    dateFiled: "12 Apr 2025",
    complainantName: "V. R. Narayanan",
    category: "Crypto Investment & Task-Based Fraud",
    suspectWallet: "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2",
    amountINR: "₹ 48,75,320",
    cryptoEstimate: "14.85 ETH / 68,400 USDT",
    status: "Priority Freeze Order Dispatched",
    vaspAttribution: ["Binance", "Tornado Cash"]
  },
  {
    ncrpRef: "NCRP-2025-IN-99431",
    firNo: "FIR-128/2025 (Cyber East Mumbai)",
    statePolice: "Maharashtra Cyber / Mumbai Police",
    dateFiled: "14 Apr 2025",
    complainantName: "S. K. Kulkarni",
    category: "Digital Arrest & Crypto Extortion Racket",
    suspectWallet: "0x71C8364f3B71c182E1E3c4A0A10a6E1e8C123456",
    amountINR: "₹ 1,25,00,000",
    cryptoEstimate: "38.2 ETH / KuCoin Hot Wallet",
    status: "Under Active Tracing",
    vaspAttribution: ["KuCoin", "Polygon Bridge"]
  },
  {
    ncrpRef: "NCRP-2025-IN-104820",
    firNo: "FIR-091/2025 (TGCSB Cyberabad)",
    statePolice: "Telangana Cyber Security Bureau (TGCSB)",
    dateFiled: "15 Apr 2025",
    complainantName: "M. Anuradha",
    category: "Fake VASP Arbitrage & P2P Mule Network",
    suspectWallet: "0x8894e0a0c962cb723c1976a4421c95949be2d4e3",
    amountINR: "₹ 84,10,000",
    cryptoEstimate: "92,000 USDT",
    status: "Bank & Wallet Freeze Requisition Sent",
    vaspAttribution: ["WazirX", "Binance P2P"]
  }
];

export default function SahyogModal() {
  const { 
    isSahyogModalOpen, 
    setIsSahyogModalOpen, 
    showToast, 
    setCurrentPage, 
    setActiveCase,
    cases 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  if (!isSahyogModalOpen) return null;

  const filteredCases = SAHYOG_PORTAL_CASES.filter(c => 
    c.ncrpRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.suspectWallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.statePolice.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImportCase = (caseItem) => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setIsSahyogModalOpen(false);
      
      // Match or build case for dashboard
      const existing = cases.find(c => c.caseId === "CN-1024") || cases[0];
      if (existing) {
        setActiveCase({
          ...existing,
          title: `[SAHYOG] ${caseItem.category}`,
          suspectWallet: caseItem.suspectWallet,
          department: caseItem.statePolice,
          totalFundsTracedINR: caseItem.amountINR,
          ncrpRef: caseItem.ncrpRef,
          firNo: caseItem.firNo
        });
      }

      showToast(`Successfully imported Case from SAHYOG Portal (${caseItem.ncrpRef})!`, 'success');
      setCurrentPage('dashboard');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white dark:bg-[#0b142d] border border-slate-300 dark:border-[#1e3468] rounded-lg shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="bg-blue-700 dark:bg-[#0c1a40] text-white px-5 py-3.5 flex items-center justify-between border-b border-blue-800 dark:border-[#1a2f60]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-wide">
                  SAHYOG / NCRP Portal Integration
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold uppercase">
                  I4C Official Gateway
                </span>
              </div>
              <p className="text-[11px] text-blue-100 dark:text-slate-300">
                Ministry of Home Affairs • National Cybercrime Reporting Portal Interoperability
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsSahyogModalOpen(false)}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Info Box */}
        <div className="p-4 bg-slate-50 dark:bg-[#070e24] border-b border-slate-200 dark:border-[#15254d] text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-slate-700 dark:text-slate-300 space-y-0.5">
            <span className="font-semibold text-slate-900 dark:text-white">
              Secured Police-to-Intelligence API Bridge Active
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Real-time synchronization with NCRP complaints allows automated retrieval of suspect cryptocurrency deposit addresses, victim loss amounts, and multi-state linked FIRs.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-[#15254d] bg-white dark:bg-[#0b142d]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by NCRP Acknowledgement Ref, FIR No., State Police Unit, or Wallet Address..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#070d1e] border border-slate-300 dark:border-[#1d2f5a] focus:border-blue-600 dark:focus:border-cyan-500 rounded-md text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono outline-none"
            />
          </div>
        </div>

        {/* Cases List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100/60 dark:bg-[#050a18]">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider px-1">
            <span>Available NCRP Live Directives ({filteredCases.length})</span>
            <span>Law Enforcement Verified</span>
          </div>

          {filteredCases.map((item, idx) => (
            <div 
              key={idx}
              className="p-3.5 bg-white dark:bg-[#0b142d] border border-slate-200 dark:border-[#1b2b52] rounded-md hover:border-blue-600 dark:hover:border-blue-500 transition-all shadow-xs space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 dark:text-cyan-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-[#0d1c42] border border-blue-200 dark:border-[#1c3a7a]">
                    {item.ncrpRef}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.firNo}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {item.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548]">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Investigative Agency</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.statePolice}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548]">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Defrauded Value</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{item.amountINR}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{item.cryptoEstimate}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#162548]">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Suspect Wallet</span>
                  <span className="font-mono text-[11px] text-blue-700 dark:text-cyan-300 truncate block" title={item.suspectWallet}>
                    {item.suspectWallet.substring(0, 10)}...{item.suspectWallet.substring(34)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Category:</span> {item.category} • <span className="font-medium">VASPs:</span> {item.vaspAttribution.join(', ')}
                </div>

                <button
                  onClick={() => handleImportCase(item)}
                  disabled={isSyncing}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <span>Import & Trace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-[#070e24] border-t border-slate-200 dark:border-[#15254d] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Indian Cyber Crime Coordination Centre (I4C) SAHYOG Interconnect</span>
          <button
            onClick={() => {
              showToast("Queried NCRP API. No new pending cases in the last 15 minutes.", "info");
            }}
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check for New NCRP Complaints</span>
          </button>
        </div>
      </div>
    </div>
  );
}
