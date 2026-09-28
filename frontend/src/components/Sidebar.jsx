import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Home, 
  PlusCircle, 
  Search, 
  Briefcase, 
  Activity, 
  Building2, 
  FileText, 
  Settings, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  X,
  ExternalLink
} from 'lucide-react';

export default function Sidebar() {
  const { currentPage, setCurrentPage, stats, activeCase, setIsSahyogModalOpen, showToast } = useApp();
  const [isLearnMoreModalOpen, setIsLearnMoreModalOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Case Dashboard', icon: Home, badge: activeCase?.caseId ? `#${activeCase.caseId}` : null },
    { id: 'cases', label: 'Wallet Search', icon: Briefcase },
    { id: 'wallet-search', label: 'Cases Directory', icon: Search, badge: stats.totalCases },
    { id: 'new-investigation', label: 'New Investigation', icon: PlusCircle, badge: 'New' },
    { id: 'transaction-monitor', label: 'Transaction Monitor', icon: Activity, badge: 'Live' },
    { id: 'vasp-directory', label: 'VASP Directory', icon: Building2, badge: stats.totalVASPs },
    { id: 'reports', label: 'Reports', icon: FileText, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <>
      <aside className="w-64 bg-white dark:bg-[#050a18] border-r border-slate-200 dark:border-[#152345] flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none p-3 overflow-y-auto transition-colors">
        {/* Navigation Items */}
        <div className="space-y-1">
          <div className="px-3 pt-2 pb-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              INVESTIGATION SUITE
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors group cursor-pointer ${
                  isActive
                    ? 'bg-blue-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0c1630]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-blue-800 text-blue-100'
                      : item.badge === 'Live'
                        ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800 animate-pulse'
                        : item.badge === 'New'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-[#101e40] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1b3164]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* SAHYOG / NCRP Portal Integration Sync Action */}
          <div className="pt-3 px-1">
            <button
              onClick={() => setIsSahyogModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-700/80 text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-xs cursor-pointer"
              title="Connect and synchronize suspect records from I4C SAHYOG Portal"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                <span>Fetch from SAHYOG</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-bold uppercase">
                NCRP
              </span>
            </button>
          </div>
        </div>

        {/* Bottom LEA Institutional Node Status Badge */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#152345]">
          <div className="rounded-md bg-slate-50 dark:bg-[#070e22] p-3 border border-slate-200 dark:border-[#18284f] text-left">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  I4C LEA Node
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="text-[11px] font-bold text-slate-800 dark:text-white leading-tight">
              Cyber Investigation Suite
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              Compliant with BNSS 2023 & BSA 2023 Section 63 Digital Evidence Standards
            </p>

            <button
              onClick={() => setIsLearnMoreModalOpen(true)}
              className="mt-2.5 w-full py-1.5 px-2.5 rounded-md bg-white dark:bg-[#0d1838] hover:bg-slate-100 dark:hover:bg-[#142350] border border-slate-200 dark:border-[#1d2f5a] text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Framework Directives</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Institutional Legal & Forensic Framework Modal */}
      {isLearnMoreModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b142d] border border-slate-300 dark:border-[#1e3468] rounded-md max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in select-none">
            <button 
              onClick={() => setIsLearnMoreModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#122045]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-md bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 flex items-center justify-center text-blue-700 dark:text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  TraceX Law Enforcement Intelligence Architecture
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Operational Guidelines & Statutory Protocols for Cyber Crime Investigation
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#18274d]">
                <h5 className="font-bold text-blue-800 dark:text-cyan-400 mb-1">
                  1. Statutory Preservation under Section 91 BNSS
                </h5>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Bharatiya Nagarik Suraksha Sanhita, 2023 empowers Investigating Officers to requisition immediate freezing of suspect custodial wallets and production of subscriber records within 24 hours.
                </p>
              </div>

              <div className="p-3 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#18274d]">
                <h5 className="font-bold text-blue-800 dark:text-blue-400 mb-1">
                  2. Court-Admissible Hash Chain Audit (Section 63 BSA)
                </h5>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Evidentiary certificates generated from TraceX satisfy the mandatory electronic evidence conditions under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 with cryptographic timestamp hashing.
                </p>
              </div>

              <div className="p-3 rounded-md bg-slate-50 dark:bg-[#070d1e] border border-slate-200 dark:border-[#18274d]">
                <h5 className="font-bold text-blue-800 dark:text-blue-400 mb-1">
                  3. SAHYOG & NCRP Interoperability
                </h5>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Direct API bridges enable rapid ingestion of victim cryptocurrency complaint records across all State Police Cyber Crime Divisions and Central Agencies.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => {
                  setIsLearnMoreModalOpen(false);
                  showToast("Statutory directives acknowledged.", "info");
                }}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-md text-xs font-bold transition-colors cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
