import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Globe, 
  ShieldCheck, 
  RotateCcw,
  X,
  FileCheck
} from 'lucide-react';

export default function VaspDirectoryPage() {
  const { vasps, selectedVasp, setSelectedVasp, showToast, stats, setStats, setVasps } = useApp();

  const [activeCategory, setActiveCategory] = useState('All VASPs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('All Risk Levels');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  const [newVaspForm, setNewVaspForm] = useState({
    name: '',
    type: 'Exchange',
    country: 'USA',
    website: '',
    regStatus: 'Registered',
    riskLevel: 'Low'
  });

  const categoryTabs = [
    { label: 'All VASPs', count: 256 },
    { label: 'Exchanges', count: 142 },
    { label: 'Wallet Providers', count: 46 },
    { label: 'Payment Processors', count: 38 },
    { label: 'Other', count: 30 }
  ];

  const filteredVasps = useMemo(() => {
    return vasps.filter(v => {
      const matchCat = activeCategory === 'All VASPs' || 
        (activeCategory === 'Exchanges' && v.type === 'Exchange') ||
        (activeCategory === 'Wallet Providers' && v.type === 'Wallet Provider') ||
        (activeCategory === 'Payment Processors' && v.type === 'Payment Processor') ||
        (activeCategory === 'Other' && v.type !== 'Exchange' && v.type !== 'Wallet Provider');

      const matchRisk = selectedRiskFilter === 'All Risk Levels' || v.riskLevel === selectedRiskFilter;

      const matchSearch = !searchQuery.trim() ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.regStatus.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchRisk && matchSearch;
    });
  }, [vasps, activeCategory, selectedRiskFilter, searchQuery]);

  const handleAddVasp = (e) => {
    e.preventDefault();
    if (!newVaspForm.name.trim()) {
      showToast("Please provide VASP name", "error");
      return;
    }

    const created = {
      id: vasps.length + 1,
      name: newVaspForm.name,
      logoText: newVaspForm.name.substring(0, 2).toUpperCase(),
      type: newVaspForm.type,
      country: newVaspForm.country,
      regStatus: newVaspForm.regStatus,
      riskLevel: newVaspForm.riskLevel,
      status: "Verified",
      website: newVaspForm.website || "https://" + newVaspForm.name.toLowerCase() + ".com",
      hq: newVaspForm.country,
      founded: "2021",
      regDetail: "FIU Registered Provider",
      kycRequired: "Yes",
      supportedAssets: "100+",
      userBase: "5M+",
      compliance: {
        kycAml: true,
        sanctionsScreening: true,
        regRegistration: true,
        adverseMediaWarning: false,
        pastEnforcement: false
      }
    };

    setVasps(prev => [created, ...prev]);
    setSelectedVasp(created);
    setStats(prev => ({ ...prev, totalVASPs: prev.totalVASPs + 1, verifiedVASPs: prev.verifiedVASPs + 1 }));
    setIsAddModalOpen(false);
    showToast(`VASP ${created.name} registered into directory!`, 'success');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header Bar with Regional Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 block mb-0.5">
            VASP DIRECTORY
          </span>
          <h1 className="text-xl font-extrabold text-white tracking-wide">
            Virtual Asset Service Providers
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, verify and explore global VASPs (exchanges, wallets, and crypto service providers)
          </p>
        </div>

        {/* Regional Counts Badges */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="px-2.5 py-1 rounded bg-[#0b142d] border border-[#1b2b52] text-slate-300">
            North America: <strong className="text-white">88 VASPs</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-[#0b142d] border border-[#1b2b52] text-slate-300">
            Europe: <strong className="text-white">78 VASPs</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-[#0b142d] border border-[#1b2b52] text-slate-300">
            Asia: <strong className="text-white">62 VASPs</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-[#0b142d] border border-[#1b2b52] text-slate-300">
            Other: <strong className="text-white">33 VASPs</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-white">{stats.totalVASPs}</div>
            <div className="text-xs text-slate-400 font-medium">Total VASPs</div>
          </div>
          <span className="text-xs font-bold text-emerald-400">↑ 12%</span>
        </div>

        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-emerald-400">{stats.verifiedVASPs}</div>
            <div className="text-xs text-slate-400 font-medium">Verified</div>
          </div>
          <span className="text-xs font-bold text-emerald-400">↑ 8%</span>
        </div>

        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-red-400">{stats.highRiskVASPs}</div>
            <div className="text-xs text-slate-400 font-medium">High Risk</div>
          </div>
          <span className="text-xs font-bold text-red-400">↑ 20%</span>
        </div>

        <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-amber-400">{stats.underReviewVASPs}</div>
            <div className="text-xs text-slate-400 font-medium">Under Review</div>
          </div>
          <span className="text-xs font-bold text-amber-400">↓ 5%</span>
        </div>
      </div>

      {/* Category Tabs & Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categoryTabs.map((t) => (
            <button
              key={t.label}
              onClick={() => setActiveCategory(t.label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === t.label
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-[#0b142d] border border-[#1b2b52] text-slate-400 hover:text-white hover:bg-[#101e40]'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add / Request VASP</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-3 shadow-md flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, domain, country or registration number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#070d1e] border border-[#162548] focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none"
          />
        </div>

        <select
          value={selectedRiskFilter}
          onChange={(e) => setSelectedRiskFilter(e.target.value)}
          className="bg-[#070d1e] border border-[#162548] rounded-lg px-3 py-2 text-xs text-white outline-none"
        >
          <option value="All Risk Levels">All Risk Levels</option>
          <option value="Low">Low Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="High">High Risk</option>
        </select>

        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedRiskFilter('All Risk Levels');
            setActiveCategory('All VASPs');
          }}
          className="px-3 py-2 bg-[#070d1e] hover:bg-[#122045] border border-[#162548] text-slate-400 hover:text-white rounded-lg text-xs flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Grid: VASP Table (Left 2 cols) & VASP Detail Profile (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Container */}
        <div className="lg:col-span-2 bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070d1e] text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Logo</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Country</th>
                <th className="py-2.5 px-3">Regulatory Status</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#152345]">
              {filteredVasps.map((v, idx) => {
                const isSelected = selectedVasp?.id === v.id;
                return (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedVasp(v)}
                    className={`hover:bg-[#0e1b3d] cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#11214a] border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-white">{v.name}</td>
                    <td className="py-3 px-3">
                      <span className="w-6 h-6 rounded bg-[#162752] text-cyan-400 text-[10px] font-bold flex items-center justify-center">
                        {v.logoText}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{v.type}</td>
                    <td className="py-3 px-3 text-slate-400">{v.country}</td>
                    <td className="py-3 px-3 text-slate-300 text-[11px]">{v.regStatus}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold ${
                        v.riskLevel === 'High' ? 'text-red-400' :
                        v.riskLevel === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {v.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.status === 'Verified' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        v.status === 'Review' ? 'bg-red-950 text-red-400 border border-red-800' :
                        'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVasp(v);
                        }}
                        className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded text-[10px] font-semibold"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Detail Card for Selected VASP */}
        {selectedVasp && (
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#162548]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#162752] border border-[#233d80] text-cyan-400 text-sm font-bold flex items-center justify-center">
                  {selectedVasp.logoText}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedVasp.name}</h3>
                  <p className="text-[10px] text-slate-400">World's leading cryptocurrency service</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="text-[11px] text-blue-400 hover:underline"
              >
                + Edit
              </button>
            </div>

            {/* VASP Profile Tabs */}
            <div className="flex items-center gap-2 border-b border-[#162548] pb-1">
              {['Overview', 'Regulatory', 'Services', 'Contact'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`text-[11px] font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* VASP Attributes Grid */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#142347]">
                <span className="text-slate-400">Type</span>
                <span className="text-white font-medium">{selectedVasp.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142347]">
                <span className="text-slate-400">Website</span>
                <a href={selectedVasp.website} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]">
                  {selectedVasp.website.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142347]">
                <span className="text-slate-400">Headquarters</span>
                <span className="text-white font-medium">{selectedVasp.hq}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142347]">
                <span className="text-slate-400">Founded</span>
                <span className="text-white font-medium">{selectedVasp.founded}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142347]">
                <span className="text-slate-400">Regulatory Status</span>
                <span className="text-slate-200 text-right">{selectedVasp.regDetail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142347]">
                <span className="text-slate-400">KYC Required</span>
                <span className="text-white font-bold">{selectedVasp.kycRequired}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142347]">
                <span className="text-slate-400">Supported Assets</span>
                <span className="text-white font-mono">{selectedVasp.supportedAssets}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142347]">
                <span className="text-slate-400">User Base</span>
                <span className="text-white font-mono">{selectedVasp.userBase}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142347]">
                <span className="text-slate-400">Risk Level</span>
                <span className={`font-bold ${
                  selectedVasp.riskLevel === 'High' ? 'text-red-400' :
                  selectedVasp.riskLevel === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                }`}>{selectedVasp.riskLevel}</span>
              </div>
            </div>

            <button
              onClick={() => showToast(`Full intelligence profile generated for ${selectedVasp.name}`, 'info')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
            >
              <span>View Full Profile</span>
              <span>→</span>
            </button>

            {/* Compliance & Risk Indicators */}
            <div className="pt-2 border-t border-[#162548]">
              <span className="text-xs font-bold text-white block mb-2">
                Compliance & Risk Indicators
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>KYC / AML Compliance</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sanctions Screening Integration</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Regulatory Registration</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Adverse Media Check</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Past Enforcement Actions</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Request VASP Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b142d] border border-[#1e3468] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Add / Request New VASP</h3>
            <p className="text-xs text-slate-400 mb-4">Register a Virtual Asset Service Provider for regulatory tracking</p>

            <form onSubmit={handleAddVasp} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">VASP Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Bitpanda, CoinDCX, WazirX"
                  value={newVaspForm.name}
                  onChange={(e) => setNewVaspForm({ ...newVaspForm, name: e.target.value })}
                  className="w-full bg-[#070d1e] border border-[#162548] focus:border-blue-500 rounded-lg p-2.5 text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Type</label>
                  <select
                    value={newVaspForm.type}
                    onChange={(e) => setNewVaspForm({ ...newVaspForm, type: e.target.value })}
                    className="w-full bg-[#070d1e] border border-[#162548] rounded-lg p-2 text-white outline-none"
                  >
                    <option value="Exchange">Exchange</option>
                    <option value="Wallet Provider">Wallet Provider</option>
                    <option value="Payment Processor">Payment Processor</option>
                    <option value="Custodian">Custodian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Country / Jurisdiction</label>
                  <input
                    type="text"
                    placeholder="e.g. India, USA, Singapore"
                    value={newVaspForm.country}
                    onChange={(e) => setNewVaspForm({ ...newVaspForm, country: e.target.value })}
                    className="w-full bg-[#070d1e] border border-[#162548] rounded-lg p-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Website URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={newVaspForm.website}
                  onChange={(e) => setNewVaspForm({ ...newVaspForm, website: e.target.value })}
                  className="w-full bg-[#070d1e] border border-[#162548] rounded-lg p-2 text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#162548]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#1c2e56] text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow"
                >
                  Save VASP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
