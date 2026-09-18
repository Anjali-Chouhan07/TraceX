import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  ArrowRight, 
  HelpCircle, 
  Shield, 
  Upload, 
  Plus, 
  X, 
  FileCheck, 
  ExternalLink,
  Coins
} from 'lucide-react';

export default function NewInvestigationPage() {
  const { addNewCase, setCurrentPage, cases, showToast, userProfile } = useApp();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    caseType: 'Money Laundering',
    description: '',
    priority: 'High',
    assignedTo: userProfile.fullName,
    suspectWallet: '',
    tags: ['Scam', 'Money Laundering'],
    evidenceFiles: []
  });

  const [tagInput, setTagInput] = useState('');

  const quickPillTags = ['Scam', 'Money Laundering', 'Dark Web', 'Ransomware', 'Fraud', 'Mixer', 'Phishing'];

  const toggleTag = (tag) => {
    if (formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    } else {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const handleAddCustomTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Please enter a case title to proceed.", "error");
      return;
    }

    const created = addNewCase({
      title: formData.title,
      caseType: formData.caseType,
      priority: formData.priority,
      assignedTo: formData.assignedTo,
      suspectWallet: formData.suspectWallet || "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2",
      description: formData.description,
      evidenceCount: 1
    });

    setCurrentPage('cases');
  };

  const blockchains = [
    { name: "Bitcoin", icon: "₿", color: "text-amber-400 bg-amber-950/40 border-amber-800" },
    { name: "Ethereum", icon: "Ξ", color: "text-blue-400 bg-blue-950/40 border-blue-800" },
    { name: "Binance Smart Chain", icon: "BNB", color: "text-yellow-400 bg-yellow-950/40 border-yellow-800" },
    { name: "Polygon", icon: "MATIC", color: "text-purple-400 bg-purple-950/40 border-purple-800" },
    { name: "Solana", icon: "SOL", color: "text-emerald-400 bg-emerald-950/40 border-emerald-800" },
    { name: "Avalanche", icon: "AVAX", color: "text-red-400 bg-red-950/40 border-red-800" },
    { name: "Arbitrum", icon: "ARB", color: "text-cyan-400 bg-cyan-950/40 border-cyan-800" },
    { name: "Optimism", icon: "OP", color: "text-rose-400 bg-rose-950/40 border-rose-800" },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 block mb-0.5">
            INVESTIGATION
          </span>
          <h1 className="text-xl font-extrabold text-white tracking-wide">
            New Investigation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Start a new blockchain investigation case
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-400 italic">"Follow the flow. Find the truth."</p>
        </div>
      </div>

      {/* 4-Step Stepper Bar */}
      <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-3 shadow-md">
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, label: "Basic Info" },
            { num: 2, label: "Add Evidence" },
            { num: 3, label: "Configure" },
            { num: 4, label: "Review & Create" }
          ].map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <button
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : isCompleted
                      ? 'bg-[#101e40] text-emerald-400 border border-emerald-800/40'
                      : 'text-slate-400 hover:text-white hover:bg-[#0e1938]'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-white text-blue-600' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-[#162548] text-slate-300'
                }`}>
                  {isCompleted ? '✓' : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Card (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-[#0b142d] border border-[#1b2b52] rounded-xl p-5 shadow-lg space-y-4">
          {step === 1 && (
            <>
              <div className="pb-3 border-b border-[#162548]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Basic Information</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Provide the initial details about the investigation
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Case Title */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Case Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a descriptive title (e.g., Suspected money laundering via Binance)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#070d1e] border border-[#1d2f5a] focus:border-blue-500 rounded-lg p-2.5 text-white placeholder-slate-500 outline-none text-xs"
                  />
                </div>

                {/* Case Type & Suspect Wallet */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Case Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.caseType}
                      onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
                      className="w-full bg-[#070d1e] border border-[#1d2f5a] focus:border-blue-500 rounded-lg p-2.5 text-white outline-none text-xs cursor-pointer"
                    >
                      <option value="Money Laundering">Money Laundering</option>
                      <option value="Mixer Investigation">Mixer Investigation</option>
                      <option value="Cybercrime">Cybercrime</option>
                      <option value="VASP Violation">VASP Violation</option>
                      <option value="Fraud">Fraud / Rug Pull</option>
                      <option value="Scam">Phishing Scam</option>
                      <option value="Sanctions">Sanctions Evasion</option>
                      <option value="Dark Web">Dark Web Payment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Initial Suspect Wallet Address
                    </label>
                    <input
                      type="text"
                      placeholder="0x... or bc1..."
                      value={formData.suspectWallet}
                      onChange={(e) => setFormData({ ...formData, suspectWallet: e.target.value })}
                      className="w-full bg-[#070d1e] border border-[#1d2f5a] focus:border-blue-500 rounded-lg p-2.5 text-white placeholder-slate-500 outline-none text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-300 font-semibold">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500">
                      {formData.description.length}/1000
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={1000}
                    placeholder="Provide a detailed description of the investigation, its objectives, and background..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#070d1e] border border-[#1d2f5a] focus:border-blue-500 rounded-lg p-2.5 text-white placeholder-slate-500 outline-none text-xs resize-none"
                  />
                </div>

                {/* Priority & Assigned To */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full bg-[#070d1e] border border-[#1d2f5a] focus:border-blue-500 rounded-lg p-2.5 text-white outline-none text-xs cursor-pointer"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Assigned To</label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className="w-full bg-[#070d1e] border border-[#1d2f5a] focus:border-blue-500 rounded-lg p-2.5 text-white outline-none text-xs cursor-pointer"
                    >
                      <option value={userProfile.fullName}>{userProfile.fullName} (You)</option>
                      <option value="A. Sharma">A. Sharma (Senior Sleuth)</option>
                      <option value="R. Verma">R. Verma (Cryptanalyst)</option>
                      <option value="P. Singh">P. Singh (Cyber Forensics)</option>
                      <option value="K. Mehta">K. Mehta (VASP Liaison)</option>
                      <option value="S. Khan">S. Khan (Financial Intel)</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tags (Optional)</label>
                  <p className="text-[11px] text-slate-400 mb-2">Add relevant tags to categorize this investigation</p>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {quickPillTags.map((tag) => {
                      const isSelected = formData.tags.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                              : 'bg-[#070d1e] text-slate-400 border-[#1d2f5a] hover:border-slate-500'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '} {tag}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    placeholder="Type a custom tag and press Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddCustomTag}
                    className="w-full bg-[#070d1e] border border-[#1d2f5a] focus:border-blue-500 rounded-lg p-2 text-white placeholder-slate-500 outline-none text-xs"
                  />
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#162548]">
                <button
                  type="button"
                  onClick={() => setCurrentPage('cases')}
                  className="px-4 py-2 border border-[#1c2e56] hover:bg-[#122045] text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <span>Next: Add Evidence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div className="pb-3 border-b border-[#162548]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Step 2: Add Blockchain Evidence</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Attach known transaction hashes, wallet clusters, or audit logs</p>
              </div>

              <div className="p-6 border-2 border-dashed border-[#1e3468] rounded-xl text-center hover:border-blue-500/60 bg-[#070d1e]/50 cursor-pointer">
                <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="font-semibold text-white">Drop transaction CSV or forensic exports here</p>
                <p className="text-slate-500 text-[11px] mt-1">Supports Etherscan CSV, Bitcoin raw mempool dump, PDF warrants</p>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#162548]">
                <button onClick={() => setStep(1)} className="px-4 py-2 border border-[#1c2e56] text-slate-300 rounded-lg">Back</button>
                <button onClick={() => setStep(3)} className="px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-1.5">
                  <span>Next: Configure</span> <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div className="pb-3 border-b border-[#162548]">
                <h3 className="text-sm font-bold text-white">Step 3: Alert & Surveillance Configuration</h3>
                <p className="text-slate-400">Set automatic triggers for honeypot and mixer movements</p>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Continuous 24/7 mempool tracking", checked: true },
                  { label: "Trigger automated freeze notification to compliant VASPs", checked: true },
                  { label: "Calculate topological Graph Neural Network (GNN) embeddings", checked: true },
                ].map((cfg, idx) => (
                  <label key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#070d1e] border border-[#162548] cursor-pointer">
                    <input type="checkbox" defaultChecked={cfg.checked} className="accent-blue-500 rounded" />
                    <span className="text-slate-200">{cfg.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-[#162548]">
                <button onClick={() => setStep(2)} className="px-4 py-2 border border-[#1c2e56] text-slate-300 rounded-lg">Back</button>
                <button onClick={() => setStep(4)} className="px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-1.5">
                  <span>Next: Review & Create</span> <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div className="pb-3 border-b border-[#162548]">
                <h3 className="text-sm font-bold text-white">Step 4: Review & Initialize Investigation</h3>
                <p className="text-slate-400">Confirm parameters before generating cryptographic case hash</p>
              </div>

              <div className="p-3 bg-[#070d1e] rounded-lg border border-[#162548] space-y-2">
                <p><span className="text-slate-400">Title:</span> <strong className="text-white">{formData.title || "Dark Web Laundering Analysis"}</strong></p>
                <p><span className="text-slate-400">Type:</span> <span className="text-cyan-400">{formData.caseType}</span></p>
                <p><span className="text-slate-400">Priority:</span> <span className="text-red-400 font-bold">{formData.priority}</span></p>
                <p><span className="text-slate-400">Lead Investigator:</span> <span className="text-slate-200">{formData.assignedTo}</span></p>
                <p><span className="text-slate-400">Tags:</span> {formData.tags.join(', ')}</p>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#162548]">
                <button onClick={() => setStep(3)} className="px-4 py-2 border border-[#1c2e56] text-slate-300 rounded-lg">Back</button>
                <button onClick={handleSubmit} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-600/30">
                  <FileCheck className="w-4 h-4" />
                  <span>Create Investigation Case</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Cards */}
        <div className="space-y-4">
          {/* Quick Tips */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg">
            <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>Quick Tips</span>
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">For a better investigation</p>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Use a clear and specific case title</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Provide as much background information as possible</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Select the appropriate case type</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Add relevant tags for easy categorization</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>You can add evidence (wallets, transactions, files) in the next step</span>
              </li>
            </ul>
          </div>

          {/* Recent Investigations */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-[#162548] mb-2.5">
              <h4 className="text-xs font-bold text-white">Recent Investigations</h4>
              <button 
                onClick={() => setCurrentPage('cases')}
                className="text-[11px] text-blue-400 hover:text-blue-300"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {cases.slice(0, 5).map((c) => (
                <div key={c.id} className="p-2 rounded-lg bg-[#070d1e] border border-[#162548] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">{c.caseId}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{c.title}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {c.status}
                    </span>
                    <span className="block text-[9px] text-slate-500 mt-0.5">{c.dateCreated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Blockchains */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-[#162548] mb-2.5">
              <h4 className="text-xs font-bold text-white">Supported Blockchains</h4>
              <span className="text-[11px] text-slate-400">8 Networks</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {blockchains.map((bc, idx) => (
                <div key={idx} className={`p-2 rounded-lg border flex items-center gap-2 ${bc.color}`}>
                  <span className="font-bold text-xs">{bc.icon}</span>
                  <span className="text-xs font-medium text-slate-200 truncate">{bc.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
