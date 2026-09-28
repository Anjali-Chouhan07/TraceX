import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Bell, 
  Shield, 
  ChevronDown, 
  User, 
  Lock,
  Sun,
  Moon,
  Building2,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';

export default function Header() {
  const { 
    setCurrentPage, 
    userProfile, 
    setIsCommandPaletteOpen,
    isNotificationOpen,
    setIsNotificationOpen,
    unreadAlertsCount,
    setUnreadAlertsCount,
    showToast,
    theme,
    toggleTheme,
    setIsSahyogModalOpen
  } = useApp();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const notifications = [
    { id: 1, title: "High Risk Peeling Detected", detail: "Case #CN-1024: 12.5 ETH routed through non-compliant mixer", time: "2 min ago", type: "critical" },
    { id: 2, title: "NCRP Reference Match", detail: "NCRP-2025-IN-98124 linked to suspect wallet 0x3a7f...f3a2", time: "14 min ago", type: "warning" },
    { id: 3, title: "Section 91 BNSS Compliance", detail: "Binance legal nodal officer acknowledged directive", time: "1 hour ago", type: "success" },
  ];

  return (
    <header className="sticky top-0 z-30 select-none bg-white dark:bg-[#070d1e] border-b border-slate-200 dark:border-[#182649] transition-colors">
      {/* High-Contrast Official Security Classification Banner */}
      <div className="bg-[#991b1b] text-white text-[10px] font-bold tracking-widest uppercase px-4 py-0.5 text-center flex items-center justify-center gap-2 border-b border-red-900 shadow-sm">
        <ShieldAlert className="w-3 h-3 text-yellow-300" />
        <span>RESTRICTED — FOR AUTHORIZED INDIAN LAW ENFORCEMENT & INVESTIGATIVE AGENCIES ONLY (I4C / MHA)</span>
        <span className="hidden md:inline">• केवल अधिकृत विधि प्रवर्तन उपयोग हेतु</span>
      </div>

      <div className="h-16 px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left Side: Indian Government Institutional Branding (GIGW Compliant) */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentPage('dashboard')}
          title="Return to Main Investigation Dashboard"
        >
          {/* Ashok Stambh / National Emblem of India Vector Artwork */}
          <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-[#0c1838] border border-slate-300 dark:border-[#1c2e5c] flex items-center justify-center p-1 shrink-0 shadow-sm">
            <img 
  src="./satya.svg" 
  alt="logo" 
  style={{ height: '36px', width: 'auto', marginRight: '0px' }} 
/>
          </div>

          {/* Institutional Typography */} 
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[10px] font-extrabold uppercase text-slate-800 dark:text-slate-100 tracking-wider">
                Ministry of Home Affairs (MHA)
              </span>
              <span className="text-[9px] text-slate-400 font-hindi">| गृह मंत्रालय</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 leading-none">
              <span className="text-[11px] font-bold text-blue-700 dark:text-cyan-400">
                Indian Cyber Crime Coordination Centre (I4C)
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 leading-none">
              <span className="text-xs font-black tracking-wide text-slate-900 dark:text-white uppercase">
                TraceX
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#122450] text-slate-600 dark:text-cyan-300 border border-slate-300 dark:border-cyan-800 font-mono font-semibold">
                LEA-EDITION
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Forensic Search Bar */}
        <div className="flex-1 max-w-lg mx-4 hidden md:block">
          <div 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="relative flex items-center bg-slate-50 dark:bg-[#091126] border border-slate-200 dark:border-[#1d2f5a] hover:border-blue-500 rounded-md px-3.5 py-1.5 cursor-pointer transition-colors group shadow-sm"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 mr-2.5 transition-colors" />
            <span className="text-xs text-slate-500 dark:text-slate-400 flex-1 truncate">
              Search target wallet (0x...), Tx hash, FIR, or Case ID...
            </span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0d1838] border border-slate-200 dark:border-[#23386b] rounded shadow-sm">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Right Side: SAHYOG Sync, Theme Toggle, Alerts, and Officer Profile */}
        <div className="flex items-center gap-2.5 relative">
          {/* SAHYOG / NCRP Portal Integration Button */}
          <button
            onClick={() => setIsSahyogModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-50 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-700/80 text-blue-800 dark:text-blue-200 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm cursor-pointer"
            title="Fetch and synchronize cases from I4C SAHYOG / NCRP Portal"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>SAHYOG Sync</span>
          </button>

          {/* Light / Dark Mode Toggle Switch (GIGW Compliant Day Mode vs Operations Night Mode) */}
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-[#1c2c54] bg-slate-50 dark:bg-[#0c1630] text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#122045] transition-colors cursor-pointer shadow-sm"
            title={theme === 'dark' ? "Switch to GIGW Light Theme (Office Legibility)" : "Switch to Dark Theme (Continuous Ops Monitoring)"}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">Day Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-700" />
                <span className="hidden sm:inline text-[11px]">Night Mode</span>
              </>
            )}
          </button>

          {/* Intelligence Alerts Bell */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                if (unreadAlertsCount > 0) setUnreadAlertsCount(0);
              }}
              className="p-1.5 rounded-md bg-slate-50 dark:bg-[#0c1630] border border-slate-200 dark:border-[#1c2c54] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors relative shadow-sm"
              title="Notifications & Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0b142d] border border-slate-200 dark:border-[#203362] rounded-md shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1b2b52] mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Live Intelligence Alerts</span>
                  <span className="text-[10px] text-blue-700 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-cyan-800 font-semibold">
                    I4C Gateway
                  </span>
                </div>
                <div className="space-y-2">
                  {notifications.map(item => (
                    <div key={item.id} className="p-2 rounded bg-slate-50 dark:bg-[#0e1938] hover:bg-slate-100 dark:hover:bg-[#122045] transition-colors cursor-pointer text-left border border-slate-100 dark:border-transparent">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</span>
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-[#1b2b52] text-center">
                  <button 
                    onClick={() => {
                      setCurrentPage('transaction-monitor');
                      setIsNotificationOpen(false);
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Open Live Transaction Monitor →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Investigating Officer Profile Badge */}
          <div className="relative">
            <div 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-md bg-slate-50 dark:bg-[#0c1630] border border-slate-200 dark:border-[#1c2c54] hover:border-slate-300 dark:hover:border-blue-500 cursor-pointer transition-all shadow-sm"
            >
              <div className="w-7 h-7 rounded bg-blue-700 dark:bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {userProfile.fullName.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 leading-tight">
                  <span>{userProfile.fullName}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  I4C Nodal Officer
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </div>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#0b142d] border border-slate-200 dark:border-[#203362] rounded-md shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-200 dark:border-[#1b2b52] mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{userProfile.fullName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{userProfile.email}</p>
                  <span className="inline-block mt-1 text-[9px] bg-slate-100 dark:bg-blue-950 text-slate-700 dark:text-blue-300 border border-slate-200 dark:border-blue-800 px-1.5 py-0.5 rounded font-semibold">
                    {userProfile.department || "Cyber Crime Unit, MHA"}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setCurrentPage('settings');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#122045] rounded transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Officer Credentials & Token
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage('cases');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#122045] rounded transition-colors text-left"
                >
                  <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  Assigned Case Dossiers
                </button>
                <div className="my-1 border-t border-slate-200 dark:border-[#1b2b52]"></div>
                <button 
                  onClick={() => {
                    showToast("Session secured with DSC / Token authentication.", "info");
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#122045] rounded transition-colors text-left"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Digital Audit Trail Active
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
