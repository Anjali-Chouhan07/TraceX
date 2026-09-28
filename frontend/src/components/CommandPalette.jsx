import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  X, 
  Briefcase, 
  Wallet, 
  Building2, 
  FileText, 
  Activity, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function CommandPalette() {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    setCurrentPage, 
    cases, 
    vasps, 
    setActiveCase,
    showToast 
  } = useApp();

  const [query, setQuery] = useState('');

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matchedCases = cases.filter(c => 
      c.caseId.toLowerCase().includes(q) || 
      c.title.toLowerCase().includes(q) ||
      c.suspectWallet.toLowerCase().includes(q)
    ).map(c => ({
      id: `case-${c.id}`,
      type: 'Case',
      title: `${c.caseId}: ${c.title}`,
      subtitle: `Wallet: ${c.suspectWallet.substring(0, 12)}... | Status: ${c.status}`,
      icon: Briefcase,
      action: () => {
        setActiveCase(c);
        setCurrentPage('dashboard');
      }
    }));

    const matchedVasps = vasps.filter(v => 
      v.name.toLowerCase().includes(q) || 
      v.country.toLowerCase().includes(q)
    ).map(v => ({
      id: `vasp-${v.id}`,
      type: 'VASP',
      title: `${v.name} (${v.country})`,
      subtitle: `${v.type} • Reg: ${v.regStatus} • Risk: ${v.riskLevel}`,
      icon: Building2,
      action: () => {
        setCurrentPage('vasp-directory');
      }
    }));

    return [...matchedCases, ...matchedVasps].slice(0, 6);
  }, [query, cases, vasps]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/75 backdrop-blur-xs z-50 flex items-start justify-center pt-24 p-4">
      <div 
        className="bg-white dark:bg-[#0b142d] border border-slate-300 dark:border-[#1e3468] rounded-xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-[#182649] bg-slate-50 dark:bg-[#070d1e]">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a wallet (0x...), case ID (CN-1024), or VASP name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-white mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd 
            onClick={() => setIsCommandPaletteOpen(false)}
            className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-[#122045] px-2 py-0.5 rounded cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700"
          >
            ESC
          </kbd>
        </div>

        {/* Quick Navigation suggestions if no query */}
        {!query.trim() && (
          <div className="p-3">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 px-3 py-1.5 tracking-wider">
              Quick Shortcuts
            </div>
            <div className="space-y-1">
              {[
                { label: 'Active Investigation: Case #CN-1024', page: 'dashboard', icon: ShieldAlert, color: 'text-red-500 dark:text-red-400' },
                { label: 'Deep Wallet & Risk Search', page: 'wallet-search', icon: Wallet, color: 'text-blue-600 dark:text-cyan-400' },
                { label: 'Live Mempool Transaction Monitor', page: 'transaction-monitor', icon: Activity, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Browse 256 Virtual Asset Service Providers (VASPs)', page: 'vasp-directory', icon: Building2, color: 'text-amber-600 dark:text-amber-400' },
                { label: 'Investigation Reports & Certificates', page: 'reports', icon: FileText, color: 'text-blue-600 dark:text-blue-400' }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentPage(item.page);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#122045] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-xs text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-white font-medium">{item.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Search Results */}
        {query.trim() && (
          <div className="p-3 max-h-80 overflow-y-auto space-y-1">
            {filteredResults.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
                No matching cases, wallets, or VASPs found for "{query}".
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setCurrentPage('wallet-search');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Scan as raw address in Wallet Search →
                  </button>
                </div>
              </div>
            ) : (
              filteredResults.map((res) => {
                const Icon = res.icon;
                return (
                  <div
                    key={res.id}
                    onClick={() => {
                      res.action();
                      setIsCommandPaletteOpen(false);
                      showToast(`Navigated to ${res.title}`, 'info');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#122045] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-[#0e1b3d] flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{res.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{res.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
                      {res.type}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
