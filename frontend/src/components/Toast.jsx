import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/40 bg-[#062018]',
    error: 'border-red-500/40 bg-[#250d12]',
    info: 'border-blue-500/40 bg-[#0c1630]'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${borders[toast.type || 'info']} shadow-2xl backdrop-blur-md max-w-md`}>
        {icons[toast.type || 'info']}
        <span className="text-xs font-medium text-slate-100">{toast.message}</span>
      </div>
    </div>
  );
}
