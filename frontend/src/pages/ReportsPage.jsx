import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  X,
  FileCheck
} from 'lucide-react';

export default function ReportsPage() {
  const { reports, setReports, generateNewReport, stats, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('All Reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [exportFormats, setExportFormats] = useState({
    pdf: true,
    csv: false,
    json: false,
    xlsx: false
  });

  const [newReportConfig, setNewReportConfig] = useState({
    title: '',
    type: 'Case Summary',
    relatedCase: 'CN-1024',
    format: 'PDF'
  });

  const categoryTabs = [
    { label: 'All Reports', count: 128 },
    { label: 'Case Reports', count: 41 },
    { label: 'Transaction Reports', count: 32 },
    { label: 'Wallet Reports', count: 24 },
    { label: 'VASP Reports', count: 18 },
    { label: 'Custom Reports', count: 13 },
  ];

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchCat = activeTab === 'All Reports' ||
        (activeTab === 'Case Reports' && r.type === 'Case Summary') ||
        (activeTab === 'Transaction Reports' && r.type === 'Transaction') ||
        (activeTab === 'Wallet Reports' && r.type === 'Wallet') ||
        (activeTab === 'VASP Reports' && r.type === 'VASP') ||
        (activeTab === 'Custom Reports' && (r.type === 'Custom' || r.type === 'Network'));

      const matchSearch = !searchQuery.trim() ||
        r.reportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.relatedCase.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [reports, activeTab, searchQuery]);

  const handleCreateReport = (e) => {
    e.preventDefault();
    if (!newReportConfig.title.trim()) {
      showToast("Please enter a report title.", "error");
      return;
    }
    generateNewReport(newReportConfig);
    setIsGenerateModalOpen(false);
  };

  const handleDownload = (report) => {
    // Generate simulated download file
    const content = `CRYPTO NEXUS FORENSIC AUDIT REPORT\n` +
      `Report ID: ${report.reportId}\n` +
      `Title: ${report.title}\n` +
      `Case Ref: ${report.relatedCase}\n` +
      `Officer: ${report.generatedBy}\n` +
      `Generated: ${report.dateGenerated}\n` +
      `Classification: Court-Admissible Law Enforcement Intelligence\n` +
      `SHA-256 Checksum: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.reportId}_Forensics.txt`;
    a.click();
    showToast(`Report ${report.reportId} downloaded!`, 'success');
  };

  const handleDelete = (id) => {
    setReports(prev => prev.filter(r => r.id !== id));
    showToast("Report removed from local archive.", "info");
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 block mb-0.5">
            REPORTS
          </span>
          <h1 className="text-xl font-extrabold text-white tracking-wide">
            Investigation Reports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate, view and manage blockchain intelligence reports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-400 italic hidden sm:block">"From data to evidence, turn insights into action."</p>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-white">{stats.totalReports}</div>
            <div className="text-xs text-slate-400 font-medium">Total Reports</div>
          </div>
          <span className="text-xs font-bold text-emerald-400">↑ 14%</span>
        </div>

        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-emerald-400">{stats.completedReports}</div>
            <div className="text-xs text-slate-400 font-medium">Completed</div>
          </div>
          <span className="text-xs font-bold text-emerald-400">↑ 18%</span>
        </div>

        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-amber-400">{stats.inProgressReports}</div>
            <div className="text-xs text-slate-400 font-medium">In Progress</div>
          </div>
          <span className="text-xs font-bold text-amber-400">↓ 10%</span>
        </div>

        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-red-400">{stats.failedReports}</div>
            <div className="text-xs text-slate-400 font-medium">Failed</div>
          </div>
          <span className="text-xs font-bold text-red-400">↑ 22%</span>
        </div>
      </div>

      {/* Charts & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Reports Generated Bar Chart */}
        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-[#162548]">
            <span className="text-xs font-bold text-white">Reports Generated</span>
            <span className="text-[10px] text-slate-400">Last 7 Days ▾</span>
          </div>

          <div className="h-40 pt-4 flex items-end justify-between px-2 gap-2">
            {[
              { day: '7 Apr', val: 32 },
              { day: '8 Apr', val: 48 },
              { day: '9 Apr', val: 24 },
              { day: '10 Apr', val: 78 },
              { day: '11 Apr', val: 56 },
              { day: '12 Apr', val: 92 },
              { day: '13 Apr', val: 64 },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div 
                  className="w-full bg-blue-600 hover:bg-cyan-400 transition-colors rounded-t"
                  style={{ height: `${(bar.val / 100) * 100}%` }}
                ></div>
                <span className="text-[9px] text-slate-500 whitespace-nowrap">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Report Types Distribution Donut */}
        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg">
          <span className="text-xs font-bold text-white block pb-2 border-b border-[#162548]">
            Report Types Distribution
          </span>

          <div className="flex items-center justify-center gap-3 py-2">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="16" strokeDasharray="76 238" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#00d2ff" strokeWidth="16" strokeDasharray="57 238" strokeDashoffset="-76" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="16" strokeDasharray="42 238" strokeDashoffset="-133" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray="28 238" strokeDashoffset="-175" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-extrabold text-white">128</span>
                <span className="text-[8px] text-slate-400">Total Reports</span>
              </div>
            </div>

            <div className="space-y-0.5 text-[10px]">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-slate-300">Case Summary</span><span className="text-slate-400">32%</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span><span className="text-slate-300">Tx Analysis</span><span className="text-slate-400">24%</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span><span className="text-slate-300">Wallet Intel</span><span className="text-slate-400">18%</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-slate-300">VASP Compliance</span><span className="text-slate-400">12%</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span><span className="text-slate-300">Custom</span><span className="text-slate-400">14%</span></div>
            </div>
          </div>
        </div>

        {/* Quick Report Actions */}
        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg space-y-2 text-xs">
          <span className="text-xs font-bold text-white block pb-2 border-b border-[#162548]">
            Quick Report Actions
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => generateNewReport({ title: "Case Summary Overview", type: "Case Summary" })}
              className="p-2.5 rounded-lg bg-[#070d1e] hover:bg-[#122045] border border-[#162548] text-left transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-400 mb-1" />
              <span className="font-semibold text-white block">Case Summary</span>
              <span className="text-[10px] text-slate-400">Generate overview</span>
            </button>
            <button
              onClick={() => generateNewReport({ title: "Transaction Forensics Export", type: "Transaction" })}
              className="p-2.5 rounded-lg bg-[#070d1e] hover:bg-[#122045] border border-[#162548] text-left transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-400 mb-1" />
              <span className="font-semibold text-white block">Tx Report</span>
              <span className="text-[10px] text-slate-400">Detailed analysis</span>
            </button>
            <button
              onClick={() => generateNewReport({ title: "Wallet Cluster Intelligence", type: "Wallet" })}
              className="p-2.5 rounded-lg bg-[#070d1e] hover:bg-[#122045] border border-[#162548] text-left transition-colors"
            >
              <Clock className="w-4 h-4 text-amber-400 mb-1" />
              <span className="font-semibold text-white block">Wallet Report</span>
              <span className="text-[10px] text-slate-400">Address intelligence</span>
            </button>
            <button
              onClick={() => generateNewReport({ title: "VASP Compliance Verification", type: "VASP" })}
              className="p-2.5 rounded-lg bg-[#070d1e] hover:bg-[#122045] border border-[#162548] text-left transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="font-semibold text-white block">VASP Report</span>
              <span className="text-[10px] text-slate-400">Compliance check</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Reports Table (Left 2 cols) & Scheduled/Export panel (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Container */}
        <div className="lg:col-span-2 bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg space-y-3">
          {/* Category Tabs & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#162548]">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categoryTabs.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setActiveTab(t.label)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === t.label
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-[#101e40]'
                  }`}
                >
                  {t.label} ({t.count})
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#070d1e] border border-[#162548] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white outline-none w-44"
              />
            </div>
          </div>

          {/* Reports Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070d1e] text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Report ID</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Related Case</th>
                  <th className="py-2.5 px-3">Generated By</th>
                  <th className="py-2.5 px-3">Date Generated</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#152345]">
                {filteredReports.map((rep, idx) => (
                  <tr key={rep.id} className="hover:bg-[#0e1b3d] transition-colors">
                    <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400">{rep.reportId}</td>
                    <td className="py-3 px-3 font-semibold text-white">{rep.title}</td>
                    <td className="py-3 px-3 text-slate-400">{rep.type}</td>
                    <td className="py-3 px-3 font-mono text-blue-400">{rep.relatedCase}</td>
                    <td className="py-3 px-3 text-slate-300">{rep.generatedBy}</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">{rep.dateGenerated}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        rep.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                        rep.status === 'In Progress' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                        'bg-red-950 text-red-400 border-red-800'
                      }`}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownload(rep)}
                          className="p-1 hover:bg-[#1b2b52] rounded text-slate-300 hover:text-emerald-400"
                          title="Download Report"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => showToast(`Inspecting report ${rep.reportId}`, 'info')}
                          className="p-1 hover:bg-[#1b2b52] rounded text-slate-300 hover:text-cyan-400"
                          title="View Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rep.id)}
                          className="p-1 hover:bg-[#1b2b52] rounded text-slate-400 hover:text-red-400"
                          title="Delete Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: Scheduled Reports & Report Export Formats */}
        <div className="space-y-4">
          {/* Scheduled Reports */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg text-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#162548]">
              <span className="text-xs font-bold text-white">Scheduled Reports</span>
              <span className="text-[10px] text-blue-400 hover:underline cursor-pointer">View All</span>
            </div>
            <div className="space-y-2">
              {[
                { title: 'Weekly Case Summary', sched: 'Every Monday 09:00' },
                { title: 'High Risk Transactions', sched: 'Daily 00:00' },
                { title: 'VASP Compliance Report', sched: 'Monthly 1st' },
                { title: 'Network Activity Report', sched: 'Weekly Friday' },
              ].map((sch, idx) => (
                <div key={idx} className="p-2 rounded bg-[#070d1e] border border-[#162548] flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-200 block">{sch.title}</span>
                    <span className="text-[10px] text-slate-400">{sch.sched}</span>
                  </div>
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Report Export Formats */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg text-xs space-y-3">
            <span className="text-xs font-bold text-white block pb-2 border-b border-[#162548]">
              Report Export Formats
            </span>
            <div className="space-y-2">
              {[
                { key: 'pdf', label: 'PDF (Official Report)' },
                { key: 'csv', label: 'CSV (Transaction Data)' },
                { key: 'json', label: 'JSON (Raw Data)' },
                { key: 'xlsx', label: 'XLSX (Analysis Data)' },
              ].map((fmt) => (
                <label key={fmt.key} className="flex items-center justify-between py-1 cursor-pointer">
                  <span className="text-slate-300">{fmt.label}</span>
                  <input
                    type="checkbox"
                    checked={exportFormats[fmt.key]}
                    onChange={() => setExportFormats(prev => ({ ...prev, [fmt.key]: !prev[fmt.key] }))}
                    className="accent-blue-500 rounded"
                  />
                </label>
              ))}
            </div>

            <button
              onClick={() => {
                showToast("Generating consolidated forensic export package...", "info");
                setTimeout(() => showToast("Export bundle downloaded!", "success"), 1500);
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generate & Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generate New Report Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b142d] border border-[#1e3468] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsGenerateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Generate Intelligence Report</h3>
            <p className="text-xs text-slate-400 mb-4">Create court-admissible forensic document</p>

            <form onSubmit={handleCreateReport} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Report Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Tornado Cash Peeling Chain Trace"
                  value={newReportConfig.title}
                  onChange={(e) => setNewReportConfig({ ...newReportConfig, title: e.target.value })}
                  className="w-full bg-[#070d1e] border border-[#162548] focus:border-blue-500 rounded-lg p-2.5 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Report Type</label>
                <select
                  value={newReportConfig.type}
                  onChange={(e) => setNewReportConfig({ ...newReportConfig, type: e.target.value })}
                  className="w-full bg-[#070d1e] border border-[#162548] rounded-lg p-2 text-white outline-none"
                >
                  <option value="Case Summary">Case Summary</option>
                  <option value="Transaction">Transaction Analysis</option>
                  <option value="Wallet">Wallet Intelligence</option>
                  <option value="VASP">VASP Compliance</option>
                  <option value="Custom">Custom Investigation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Related Case ID</label>
                <input
                  type="text"
                  placeholder="CN-1024"
                  value={newReportConfig.relatedCase}
                  onChange={(e) => setNewReportConfig({ ...newReportConfig, relatedCase: e.target.value })}
                  className="w-full bg-[#070d1e] border border-[#162548] rounded-lg p-2 text-white outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#162548]">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 border border-[#1c2e56] text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow"
                >
                  Generate Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
