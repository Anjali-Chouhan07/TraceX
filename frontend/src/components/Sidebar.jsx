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
  X
} from 'lucide-react';

export default function Sidebar() {
  const { currentPage, setCurrentPage, stats, showToast } = useApp();
  const [isLearnMoreModalOpen, setIsLearnMoreModalOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null },
    { id: 'new-investigation', label: 'New Investigation', icon: PlusCircle, badge: 'New' },
    { id: 'wallet-search', label: 'Wallet Search', icon: Search, badge: null },
    { id: 'cases', label: 'Cases', icon: Briefcase, badge: stats.activeCases },
    { id: 'transaction-monitor', label: 'Transaction Monitor', icon: Activity, badge: 'Live' },
    { id: 'vasp-directory', label: 'VASP Directory', icon: Building2, badge: stats.totalVASPs },
    { id: 'reports', label: 'Reports', icon: FileText, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <>
      <aside className="w-64 bg-[#050a18] border-r border-[#152345] flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none p-3 overflow-y-auto">
        {/* Navigation Items */}
        <div className="space-y-1">
          <div className="px-3 pt-2 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#0c1630]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-blue-800 text-blue-100'
                      : item.badge === 'Live'
                        ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                        : item.badge === 'New'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-[#101e40] text-slate-300 border border-[#1b3164]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Card: Blockchain Intelligence for a Safer Tomorrow */}
        <div className="mt-4 pt-4 border-t border-[#152345]">
          <div className="relative rounded-xl bg-gradient-to-b from-[#0e1b3d] to-[#081024] p-4 border border-[#1e3468] overflow-hidden group shadow-lg">
            {/* Background glow circle */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/20 transition-all"></div>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                SIH Edition
              </span>
            </div>

            <h4 className="text-xs font-bold text-white leading-snug">
              Blockchain Intelligence
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              for a Safer Tomorrow
            </p>

            <button
              onClick={() => setIsLearnMoreModalOpen(true)}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-500 text-blue-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow"
            >
              <span>Learn More</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Learn More Modal */}
      {isLearnMoreModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b142d] border border-[#1e3468] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setIsLearnMoreModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#122045]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">CRYPTO NEXUS Intelligence Framework</h3>
                <p className="text-xs text-slate-400">Smart India Hackathon (SIH) National Security Solution</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-[#070d1e] border border-[#18274d]">
                <h5 className="font-semibold text-cyan-400 mb-1">Mission & Purpose</h5>
                <p>Equipping law enforcement and financial intelligence units with real-time heuristic tracing, graph neural network anomaly detection, and cross-border VASP compliance verification.</p>
              </div>

              <div className="p-3 rounded-lg bg-[#070d1e] border border-[#18274d]">
                <h5 className="font-semibold text-blue-400 mb-1">Key Capabilities</h5>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Automated wallet clustering and peeling chain unmasking</li>
                  <li>Instant risk scoring with explainable heuristic red flags</li>
                  <li>Live mempool threat classification (&lt;120ms latency)</li>
                  <li>Court-admissible evidentiary audit certificates</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setIsLearnMoreModalOpen(false);
                  showToast("Framework documentation loaded.", "info");
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
      </>
  );
}
