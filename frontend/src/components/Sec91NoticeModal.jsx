import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  X, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  ShieldAlert, 
  Building2,
  Mail
} from 'lucide-react';

export default function Sec91NoticeModal({ isOpen, onClose, entityName, walletAddress }) {
  const { activeCase, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetEntity = entityName || "Binance Legal & Compliance";
  const targetWallet = walletAddress || activeCase?.suspectWallet || "0x3a7f5c9e4d2b8f1a6c0e9d3f2a7b4c1e9d5e6f3a2";
  const caseId = activeCase?.caseId || "CN-1024";
  const ncrpRef = activeCase?.ncrpRef || "NCRP-2025-IN-98124";
  const firNo = activeCase?.firNo || "FIR No. 442/2025 PS Cyber Crime / IFSO";
  const issueDate = new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
  const issueTime = new Date().toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

  const noticeText = `================================================================================
GOVERNMENT OF INDIA | MINISTRY OF HOME AFFAIRS
INDIAN CYBER CRIME COORDINATION CENTRE (I4C)
LEGAL NOTICE & STATUTORY PRESERVATION REQUISITION
ISSUED UNDER SECTION 91 & SECTION 107 OF BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 (BNSS)
[READ WITH SECTION 63 OF BHARATIYA SAKSHYA ADHINIYAM, 2023 (BSA)]
================================================================================

DIRECTIVE REF NO: I4C/LEA/BNSS-91/${caseId}/${Date.now().toString().slice(-6)}
NCRP COMPLAINT ACKNOWLEDGEMENT: ${ncrpRef}
POLICE STATION / CRIME CASE: ${firNo}
DATE & TIME OF DISPATCH: ${issueDate}, ${issueTime}
SECURITY CLASSIFICATION: RESTRICTED // LAW ENFORCEMENT STATUTORY ORDER

TO:
THE NODAL OFFICER / LEGAL COMPLIANCE OFFICER
VIRTUAL ASSET SERVICE PROVIDER (VASP): ${targetEntity}
DESIGNATION: CUSTODIAL VIRTUAL ASSET PLATFORM / EXCHANGE

SUBJECT: MANDATORY 24-HOUR STATUTORY REQUISITION FOR IMMEDIATE ASSET FREEZE, 
         KYC IDENTIFICATION & TRANSACTION AUDIT LOG PRESERVATION

Sir / Madam,

WHEREAS, a criminal investigation into cryptocurrency-enabled cyber fraud, illicit multi-hop fund peeling, and offenses under the Bharatiya Nyaya Sanhita, 2023 (BNS) and Information Technology Act, 2000 is being conducted by the authorized investigating agency through the TraceX Forensic Intelligence System.

WHEREAS, cryptographic tracing has established that proceeds of crime originating from victims have been transferred into deposit accounts, cold/hot wallet infrastructure, and orderbooks maintained and controlled by your institution:

TARGET SUSPECT CRYPTOCURRENCY IDENTIFIER:
--------------------------------------------------------------------------------
WALLET ADDRESS : ${targetWallet}
ATTRIBUTED VASP: ${targetEntity}
FORENSIC ROLE  : Primary Suspect Deposit / Peeling Exit Point
CASE IDENTIFIER: #${caseId}
--------------------------------------------------------------------------------

NOW THEREFORE, under the powers conferred by Section 91 and Section 107 of the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS), you are hereby legally required and directed to:

1. IMMEDIATE ASSET RESTRAINT (WITHIN 2 HOURS OF RECEIPT):
   Freeze and restrain all virtual digital assets (VDA), fiat balances, margin positions, and pending withdrawal requests tied to the target wallet address or any related internal UID / sub-accounts.

2. PRODUCTION OF SUBSCRIBER & KYC RECORDS (WITHIN 24 HOURS):
   Furnish complete unredacted KYC documents including:
   - Full legal name, date of birth, nationality, registered residential address.
   - Government ID documents (Aadhaar, PAN, Passport, Driving License, etc.).
   - Linked bank account numbers, IFSC codes, UPI handles, and credit/debit card details.
   - Verified mobile number, email address, and secondary security contact methods.

3. FORENSIC DIGITAL LOGS & AUDIT TRAIL:
   In accordance with Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA), produce:
   - Complete deposit and withdrawal history with internal transfer hashes.
   - P2P chat transcripts, counterparty buyer/seller details, and bank payment screenshots.
   - Comprehensive IP access logs with timestamps (UTC), port numbers, and device IMEI/MAC/User-Agent telemetry.

PLEASE TAKE NOTE that failure to comply with this statutory requisition within the stipulated time frame shall render your institution and its designated officers liable for legal prosecution under Section 223 and Section 238 of the Bharatiya Nyaya Sanhita, 2023 (BNS) for intentional disobedience of lawful orders issued by a public servant.

ISSUED UNDER THE OFFICIAL AUTHORITY OF:
Investigating Officer / Superintendent of Police
Cyber Crime Investigation Division
Indian Cyber Crime Coordination Centre (I4C) / MHA
Digital Signature: [VERIFIED LEA DSC TOKEN: IN-GOV-I4C-${caseId}]
================================================================================`;

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(noticeText);
    setCopied(true);
    showToast("Section 91 BNSS Notice copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadNotice = () => {
    const blob = new Blob([noticeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SEC_91_BNSS_NOTICE_${targetEntity.replace(/\s+/g, '_')}_${caseId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Notice downloaded: SEC_91_BNSS_NOTICE_${targetEntity}_${caseId}.txt`, "success");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs select-none animate-in fade-in">
      <div className="bg-white dark:bg-[#0b142d] border border-slate-300 dark:border-[#1e3468] rounded-lg shadow-2xl max-w-3xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-wide">
                  Statutory Preservation Directive (Sec 91 BNSS)
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white font-bold uppercase">
                  Official Requisition
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Bharatiya Nagarik Suraksha Sanhita, 2023 • Target VASP: {targetEntity}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="px-5 py-2.5 bg-slate-100 dark:bg-[#070e24] border-b border-slate-200 dark:border-[#15254d] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Addressed to:</span>
            <span className="font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-white dark:bg-[#0c1838] border border-slate-300 dark:border-[#1d2f5a]">
              {targetEntity}
            </span>
            <span className="text-slate-500 text-[11px] hidden sm:inline">Ref: #{caseId}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyNotice}
              className="px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0c1838] border border-slate-300 dark:border-[#1d2f5a] hover:bg-slate-50 dark:hover:bg-[#12224d] text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Copy text to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleDownloadNotice}
              className="px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-600 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Download text file notice"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Notice</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 rounded-md bg-white dark:bg-[#0c1838] border border-slate-300 dark:border-[#1d2f5a] text-slate-700 dark:text-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
              title="Print Requisition"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Legal Text Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-[#050a18]">
          <div className="bg-white dark:bg-[#070d1e] border border-slate-300 dark:border-[#162548] rounded-md p-5 font-mono text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap select-text shadow-inner">
            {noticeText}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white dark:bg-[#0b142d] border-t border-slate-200 dark:border-[#15254d] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Statutory Format Verified under Bharatiya Nagarik Suraksha Sanhita, 2023</span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-[#1c2c54] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#122045] font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
