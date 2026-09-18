import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import Toast from './components/Toast';

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
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'new-investigation':
        return <NewInvestigationPage />;
      case 'wallet-search':
        return <WalletSearchPage />;
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
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Global Top Header */}
      <Header />

      {/* Main App Workspace */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Left Cyber Sidebar */}
        <Sidebar />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 overflow-y-auto max-h-[calc(100vh-4rem)] pb-12 bg-[#060b17]">
          {renderPage()}
        </main>
      </div>

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Global Toast System */}
      <Toast />
    </div>
  );
}
