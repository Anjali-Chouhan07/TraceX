import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_STATS, 
  INITIAL_ACTIVE_CASE, 
  INITIAL_CASES, 
  INITIAL_VASPS, 
  INITIAL_REPORTS, 
  INITIAL_USER_PROFILE 
} from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Data States
  const [stats, setStats] = useState(INITIAL_STATS);
  const [activeCase, setActiveCase] = useState(INITIAL_ACTIVE_CASE);
  const [cases, setCases] = useState(INITIAL_CASES);
  const [vasps, setVasps] = useState(INITIAL_VASPS);
  const [selectedVasp, setSelectedVasp] = useState(INITIAL_VASPS[0]);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [userProfile, setUserProfile] = useState(INITIAL_USER_PROFILE);
  
  // Global Search / Command Palette
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  // Notification Modal
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(3);
  
  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsNotificationOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handler to add a new case
  const addNewCase = (newCaseData) => {
    const nextId = cases.length + 1;
    const caseId = `CN-${1024 + nextId}`;
    const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const createdCase = {
      id: nextId,
      caseId: caseId,
      title: newCaseData.title || "Untitled Investigation",
      caseType: newCaseData.caseType || "Money Laundering",
      status: "Active",
      priority: newCaseData.priority || "High",
      assignedTo: newCaseData.assignedTo || userProfile.fullName,
      dateCreated: formattedDate,
      suspectWallet: newCaseData.suspectWallet || "0x" + Math.random().toString(16).substring(2, 42),
      evidenceCount: newCaseData.evidenceCount || 1,
      description: newCaseData.description || ""
    };

    setCases(prev => [createdCase, ...prev]);
    setStats(prev => ({
      ...prev,
      totalCases: prev.totalCases + 1,
      activeCases: prev.activeCases + 1
    }));
    showToast(`Case #${caseId} successfully registered!`, 'success');
    return createdCase;
  };

  // Handler to generate a new report
  const generateNewReport = (reportConfig) => {
    const nextId = reports.length + 1;
    const reportId = `RP-2025-01${48 + nextId}`;
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + " " +
      new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const newReport = {
      id: nextId,
      reportId: reportId,
      title: reportConfig.title || "Cryptocurrency Flow Analysis",
      type: reportConfig.type || "Transaction",
      relatedCase: reportConfig.relatedCase || activeCase.caseId,
      generatedBy: userProfile.fullName,
      dateGenerated: dateStr,
      status: "Completed",
      size: `${(Math.random() * 5 + 2).toFixed(1)} MB`,
      format: reportConfig.format || "PDF"
    };

    setReports(prev => [newReport, ...prev]);
    setStats(prev => ({
      ...prev,
      totalReports: prev.totalReports + 1,
      completedReports: prev.completedReports + 1
    }));
    showToast(`Intelligence Report ${reportId} generated!`, 'success');
    return newReport;
  };

  return (
    <AppContext.Provider value={{
      currentPage,
      setCurrentPage,
      stats,
      setStats,
      activeCase,
      setActiveCase,
      cases,
      setCases,
      addNewCase,
      vasps,
      setVasps,
      selectedVasp,
      setSelectedVasp,
      reports,
      setReports,
      generateNewReport,
      userProfile,
      setUserProfile,
      isCommandPaletteOpen,
      setIsCommandPaletteOpen,
      globalSearchQuery,
      setGlobalSearchQuery,
      isNotificationOpen,
      setIsNotificationOpen,
      unreadAlertsCount,
      setUnreadAlertsCount,
      toast,
      showToast
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
