import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import Toast from './components/Toast';
import SahyogModal from './components/SahyogModal';

// 8 Pages
import DashboardPage from './pages/DashboardPage';
import NewInvestigationPage from './pages/NewInvestigationPage';
import WalletSearchPage from './pages/WalletSearchPage';
import CasesPage from './pages/CasesPage';
import TransactionMonitorPage from './pages/TransactionMonitorPage';
import VaspDirectoryPage from './pages/VaspDirectoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { currentPage, activeCase } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage key={activeCase?.caseId || 'default'} />;
      case 'new-investigation':
        return <NewInvestigationPage />;
      case 'cases':
        return <CasesPage />;
      case 'transaction-monitor':
        return <TransactionMonitorPage />;
      case 'vasp-directory':
        return <VaspDirectoryPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'wallet-search':
        return <WalletSearchPage />;
      default:
        return <DashboardPage key={activeCase?.caseId || 'default'} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#050914] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-700 selection:text-white transition-colors">
      {/* Global Top Header with MHA / I4C Branding & Day/Night Mode Switch */}
      <Header />

      {/* Main App Workspace */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Left Cyber Sidebar */}
        <Sidebar />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 overflow-y-auto max-h-[calc(100vh-4rem)] pb-8 bg-[#F8F9FA] dark:bg-[#060b17] transition-colors">
          {renderPage()}

          {/* Official Indian Government GIGW Footer */}
          <footer className="mt-8 border-t border-slate-200 dark:border-[#152345] bg-white dark:bg-[#070d1e] px-6 py-4 text-center select-none">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Government of India • Ministry of Home Affairs (MHA)
                </span>
                <span>•</span>
                <span className="font-semibold text-blue-700 dark:text-cyan-400">
                  Indian Cyber Crime Coordination Centre (I4C)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 font-bold uppercase text-[9px] border border-red-200 dark:border-red-900">
                  RESTRICTED — LEA USE ONLY
                </span>
                <span>GIGW 3.0 Standard • BNSS & BSA 2023 Compliant</span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* SAHYOG / NCRP Portal Integration Modal */}
      <SahyogModal />

      {/* Global Toast System */}
      <Toast />
    </div>
  );
}
