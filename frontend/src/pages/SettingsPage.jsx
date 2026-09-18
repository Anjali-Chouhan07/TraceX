import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Sliders, 
  Share2, 
  ShieldCheck, 
  Users, 
  Bell, 
  FileCode, 
  Camera, 
  Lock, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Moon, 
  Sun, 
  Monitor,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

export default function SettingsPage() {
  const { userProfile, setUserProfile, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('Account');
  const [profileForm, setProfileForm] = useState({ ...userProfile });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(userProfile.twoFactorEnabled);
  const [twoFactorMethod, setTwoFactorMethod] = useState('app');
  const [themeMode, setThemeMode] = useState(userProfile.theme || 'dark');
  const [cacheSize, setCacheSize] = useState(userProfile.cacheUsageGB);
  const [isBackupCodesModalOpen, setIsBackupCodesModalOpen] = useState(false);

  // Password fields
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState(false);

  const navTabs = ['Account', 'Preferences', 'Integrations', 'Security', 'Team & Access', 'Notifications', 'Audit Logs'];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUserProfile({ ...profileForm, theme: themeMode, twoFactorEnabled });
    showToast("Profile information updated successfully!", "success");
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!passwords.new || passwords.new !== passwords.confirm) {
      showToast("New passwords do not match or are blank.", "error");
      return;
    }
    setPasswords({ current: '', new: '', confirm: '' });
    showToast("Master credentials successfully updated!", "success");
  };

  const handleClearCache = () => {
    setCacheSize(0.1);
    showToast("Forensic local cache cleared. 2.3 GB freed.", "info");
  };

  const backupCodes = [
    "9812-4412-8871", "4412-0982-3311", "7718-2910-4491", 
    "6102-3918-5521", "1029-4829-1102", "8821-4910-7729"
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 block mb-0.5">
            SETTINGS
          </span>
          <h1 className="text-xl font-extrabold text-white tracking-wide">
            System Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your account, preferences, integrations and security
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-400 italic">"Secure tools for a safer tomorrow."</p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#162548]">
        {navTabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === t
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-[#101e40]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Main Settings Grid: Left Form Column (2 cols) & Right Meta Column (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile Information Card */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#162548]">
              <div>
                <h3 className="text-sm font-bold text-white">Profile Information</h3>
                <p className="text-xs text-slate-400">Update your personal information and profile details</p>
              </div>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
              >
                Save Changes
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Avatar + Change Photo */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {profileForm.fullName.charAt(0)}
                </div>
                <button
                  type="button"
                  onClick={() => showToast("Upload image feature opened.", "info")}
                  className="px-3 py-1.5 bg-[#070d1e] hover:bg-[#122045] border border-[#162548] text-slate-300 hover:text-white rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Photo</span>
                </button>
              </div>

              {/* Form Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full bg-[#070d1e] border border-[#162548] focus:border-blue-500 rounded-lg p-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role</label>
                  <input
                    type="text"
                    value={profileForm.role}
                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                    className="w-full bg-[#070d1e] border border-[#162548] focus:border-blue-500 rounded-lg p-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full bg-[#070d1e] border border-[#162548] focus:border-blue-500 rounded-lg p-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-[#070d1e] border border-[#162548] focus:border-blue-500 rounded-lg p-2 text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    className="w-full bg-[#070d1e] border border-[#162548] rounded-lg p-2 text-white outline-none"
                  >
                    <option value="Cyber Crime Unit">Cyber Crime Unit</option>
                    <option value="Financial Intelligence Unit (FIU)">Financial Intelligence Unit (FIU)</option>
                    <option value="Economic Offences Wing (EOW)">Economic Offences Wing (EOW)</option>
                    <option value="Internal Forensics">Internal Forensics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full bg-[#070d1e] border border-[#162548] focus:border-blue-500 rounded-lg p-2 text-white outline-none"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bio (Optional)</label>
                <textarea
                  rows={2}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full bg-[#070d1e] border border-[#162548] focus:border-blue-500 rounded-lg p-2 text-white outline-none resize-none text-xs"
                />
              </div>
            </form>
          </div>

          {/* Change Password & Two-Factor Authentication Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Change Password */}
            <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#162548]">
                <span className="font-bold text-white">Change Password</span>
                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold"
                >
                  Update Password
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Current Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full bg-[#070d1e] border border-[#162548] rounded p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">New Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full bg-[#070d1e] border border-[#162548] rounded p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Confirm New Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full bg-[#070d1e] border border-[#162548] rounded p-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Password Rules */}
              <div className="space-y-1 text-[10px] text-slate-400 pt-1 border-t border-[#142347]">
                <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> At least 8 characters</div>
                <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Include uppercase and lowercase letters</div>
                <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Include a number</div>
                <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Include a special character</div>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#162548]">
                <div>
                  <span className="font-bold text-white block">Two-Factor Authentication</span>
                  <span className="text-[10px] text-slate-400">Add an extra layer of security</span>
                </div>
                <button
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showToast(`2FA is now ${!twoFactorEnabled ? 'Enabled' : 'Disabled'}`, 'info');
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                    twoFactorEnabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {twoFactorEnabled ? 'Enabled (Disable)' : 'Disabled (Enable)'}
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 block font-semibold">Authentication Method</span>
                <label className="flex items-start gap-2 p-2 rounded bg-[#070d1e] border border-[#162548] cursor-pointer">
                  <input
                    type="radio"
                    name="2fa-method"
                    checked={twoFactorMethod === 'app'}
                    onChange={() => setTwoFactorMethod('app')}
                    className="accent-blue-500 mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-white block text-xs">Authenticator App</span>
                    <span className="text-[10px] text-slate-400">Google Authenticator, Authy, etc.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-2 rounded bg-[#070d1e] border border-[#162548] cursor-pointer">
                  <input
                    type="radio"
                    name="2fa-method"
                    checked={twoFactorMethod === 'sms'}
                    onChange={() => setTwoFactorMethod('sms')}
                    className="accent-blue-500 mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-white block text-xs">SMS Verification</span>
                    <span className="text-[10px] text-slate-400">Receive codes via SMS</span>
                  </div>
                </label>
              </div>

              <div className="pt-2 border-t border-[#142347]">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-white block text-xs">Backup Codes</span>
                    <span className="text-[10px] text-slate-400">Use if you lose device access</span>
                  </div>
                  <button
                    onClick={() => setIsBackupCodesModalOpen(true)}
                    className="px-3 py-1 bg-[#070d1e] hover:bg-[#122045] border border-[#162548] text-slate-300 hover:text-white rounded text-[11px]"
                  >
                    View Backup Codes
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Cards: Data & Storage + Privacy & Data Retention */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Data & Storage */}
            <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg space-y-2 text-xs">
              <span className="font-bold text-white block">Data & Storage</span>
              <p className="text-slate-400 text-[11px]">Manage local data, cache and export settings</p>
              
              <div className="pt-2">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Cache Usage</span>
                  <span className="text-white font-mono">{cacheSize.toFixed(1)} GB / 10 GB</span>
                </div>
                <div className="w-full h-2 bg-[#070d1e] rounded-full overflow-hidden border border-[#162548]">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(cacheSize / 10) * 100}%` }}></div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleClearCache}
                  className="px-3 py-1.5 bg-[#070d1e] hover:bg-red-950/60 border border-[#162548] hover:border-red-800 text-slate-300 hover:text-red-300 rounded text-xs transition-colors"
                >
                  Clear Cache
                </button>
              </div>
            </div>

            {/* Privacy & Data Retention */}
            <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg space-y-2 text-xs">
              <span className="font-bold text-white block">Privacy & Data Retention</span>
              <p className="text-slate-400 text-[11px]">Configure data retention and privacy options</p>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Data Retention Period</span>
                <select
                  value={profileForm.retentionPeriod}
                  onChange={(e) => setProfileForm({ ...profileForm, retentionPeriod: e.target.value })}
                  className="bg-[#070d1e] border border-[#162548] rounded px-2 py-1 text-white text-xs"
                >
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                  <option value="3 Years">3 Years</option>
                  <option value="Indefinite">Indefinite</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => showToast("Data retention policy updated.", "success")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
                >
                  Manage Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Overview, Appearance & Danger Zone */}
        <div className="space-y-4">
          {/* Account Overview */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg text-xs space-y-2.5">
            <span className="font-bold text-white block pb-2 border-b border-[#162548]">
              Account Overview
            </span>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-[#142347]">
                <span className="text-slate-400">User ID</span>
                <span className="font-mono text-cyan-400 font-bold">{profileForm.userId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142347]">
                <span className="text-slate-400">Role</span>
                <span className="text-white font-medium">{profileForm.role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142347]">
                <span className="text-slate-400">Department</span>
                <span className="text-white font-medium">{profileForm.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142347]">
                <span className="text-slate-400">Member Since</span>
                <span className="text-white font-medium">{profileForm.memberSince}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#142347]">
                <span className="text-slate-400">Last Login</span>
                <span className="text-white font-medium">{profileForm.lastLogin}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Account Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                </span>
              </div>
            </div>
          </div>

          {/* Appearance & Preferences */}
          <div className="bg-[#0b142d] border border-[#1b2b52] rounded-xl p-4 shadow-lg text-xs space-y-3">
            <span className="font-bold text-white block pb-2 border-b border-[#162548]">
              Appearance & Preferences
            </span>

            {/* Theme selector */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1.5">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'system', label: 'System', icon: Monitor },
                ].map((th) => {
                  const Icon = th.icon;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => {
                        setThemeMode(th.id);
                        showToast(`Theme changed to ${th.label}`, 'info');
                      }}
                      className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                        themeMode === th.id
                          ? 'bg-blue-600 text-white border-blue-500 shadow'
                          : 'bg-[#070d1e] border-[#162548] text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-semibold">{th.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Language</label>
              <select
                value={profileForm.language}
                onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                className="w-full bg-[#070d1e] border border-[#162548] rounded p-2 text-white text-xs"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Currency</label>
              <select
                value={profileForm.currency}
                onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })}
                className="w-full bg-[#070d1e] border border-[#162548] rounded p-2 text-white text-xs"
              >
                <option value="INR - Indian Rupee (₹)">INR - Indian Rupee (₹)</option>
                <option value="USD - US Dollar ($)">USD - US Dollar ($)</option>
                <option value="EUR - Euro (€)">EUR - Euro (€)</option>
                <option value="GBP - British Pound (£)">GBP - British Pound (£)</option>
              </select>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-950/20 border border-red-900/60 rounded-xl p-4 shadow-lg text-xs space-y-2">
            <span className="font-bold text-red-400 block pb-1 border-b border-red-900/40">
              Danger Zone
            </span>
            <p className="text-[11px] text-slate-400">
              Permanently delete officer account and purge encryption keyrings.
            </p>
            <button
              onClick={() => showToast("Account deletion is restricted by law enforcement policy.", "error")}
              className="w-full py-2 bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backup Codes Modal */}
      {isBackupCodesModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b142d] border border-[#1e3468] rounded-2xl max-w-sm w-full p-5 shadow-2xl relative">
            <button 
              onClick={() => setIsBackupCodesModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white mb-1">Two-Factor Backup Codes</h3>
            <p className="text-[11px] text-slate-400 mb-3">Store these one-time recovery codes in a secure offline safe.</p>

            <div className="grid grid-cols-2 gap-2 bg-[#070d1e] p-3 rounded-xl border border-[#162548] font-mono text-xs text-cyan-300 text-center mb-4">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="p-1 bg-[#0b142d] rounded border border-[#1a2c56]">{code}</div>
              ))}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(backupCodes.join('\n'));
                showToast("Backup codes copied to clipboard!", "success");
                setIsBackupCodesModalOpen(false);
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow"
            >
              Copy All Codes & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
