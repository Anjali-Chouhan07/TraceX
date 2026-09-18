import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Bell, 
  Shield, 
  ChevronDown, 
  User, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Lock,
  LogOut
} from 'lucide-react';

export default function Header() {
  const { 
    currentPage, 
    setCurrentPage, 
    userProfile, 
    setIsCommandPaletteOpen,
    isNotificationOpen,
    setIsNotificationOpen,
    unreadAlertsCount,
    setUnreadAlertsCount,
    showToast
  } = useApp();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const notifications = [
    { id: 1, title: "High Risk Transaction Flagged", detail: "12.5 BTC sent to unverified mixer pool", time: "2 min ago", type: "critical" },
    { id: 2, title: "OFAC Sanction Match", detail: "Wallet linked to Lazarus cluster active", time: "14 min ago", type: "warning" },
    { id: 3, title: "VASP Compliance Verified", detail: "Coinbase API data refreshed successfully", time: "1 hour ago", type: "success" },
  ];

  return (
    <header className="h-16 bg-[#070d1e] border-b border-[#182649] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand Logo & Tagline */}
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setCurrentPage('dashboard')}
      >
        <div className="relative w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 flex items-center justify-center p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-[#070d1e] rounded-[7px] flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              TraceX
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide">
            Trace • Analyze • Identify • Preserve
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-xl mx-6 hidden md:block">
        <div 
          onClick={() => setIsCommandPaletteOpen(true)}
          className="relative flex items-center bg-[#091126] border border-[#1d2f5a] hover:border-blue-500/60 rounded-lg px-3.5 py-2 cursor-pointer transition-colors group shadow-inner"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-400 mr-2.5 transition-colors" />
          <span className="text-sm text-slate-400 flex-1">
            Search wallet address, transaction hash or case ID...
          </span>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-[#0d1838] border border-[#23386b] rounded shadow">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-3 relative">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              if (unreadAlertsCount > 0) setUnreadAlertsCount(0);
            }}
            className="p-2 rounded-lg bg-[#0c1630] border border-[#1c2c54] text-slate-300 hover:text-white hover:border-blue-500 transition-colors relative"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0b142d] border border-[#203362] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b2b52] mb-2">
                <span className="text-xs font-semibold text-white">Live Intelligence Alerts</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  Real-time
                </span>
              </div>
              <div className="space-y-2">
                {notifications.map(item => (
                  <div key={item.id} className="p-2 rounded-lg bg-[#0e1938] hover:bg-[#122045] transition-colors cursor-pointer text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-200">{item.title}</span>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-[#1b2b52] text-center">
                <button 
                  onClick={() => {
                    setCurrentPage('transaction-monitor');
                    setIsNotificationOpen(false);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  View All in Transaction Monitor →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Badge / Profile */}
        <div className="relative">
          <div 
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg bg-[#0c1630] border border-[#1c2c54] hover:border-blue-500 cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow">
              {userProfile.fullName.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-medium text-slate-100 flex items-center gap-1.5">
                <span>{userProfile.fullName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {userProfile.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0b142d] border border-[#203362] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-[#1b2b52] mb-1">
                <p className="text-xs font-semibold text-white">{userProfile.fullName}</p>
                <p className="text-[10px] text-slate-400 truncate">{userProfile.email}</p>
                <span className="inline-block mt-1 text-[9px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded">
                  {userProfile.department}
                </span>
              </div>
              <button 
                onClick={() => {
                  setCurrentPage('settings');
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-[#122045] rounded-lg transition-colors text-left"
              >
                <User className="w-3.5 h-3.5 text-blue-400" />
                Account Settings
              </button>
              <button 
                onClick={() => {
                  setCurrentPage('cases');
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-[#122045] rounded-lg transition-colors text-left"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                My Active Cases
              </button>
              <div className="my-1 border-t border-[#1b2b52]"></div>
              <button 
                onClick={() => {
                  showToast("Session secured. You are in read-write officer mode.", "info");
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-[#122045] rounded-lg transition-colors text-left"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Audit Logs & Session
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
