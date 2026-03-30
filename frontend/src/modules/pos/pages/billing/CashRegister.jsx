
import React, { useState } from 'react';
import { 
  Banknote, Calculator, History, CheckCircle2,
  AlertTriangle, ArrowUpRight, ArrowDownLeft,
  ShieldCheck, Lock, Unlock, Printer
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CashRegister() {
  const [isLocked, setIsLocked] = useState(false);
  
  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500 overflow-hidden">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Cash Drawer & EOD Management</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Drawer Reconciliation, Balance Verification & Session Closure</p>
          </div>
          <button 
            onClick={() => setIsLocked(!isLocked)}
            className={`h-10 px-6 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${
              isLocked ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-slate-900 text-white shadow-slate-900/20'
            }`}
          >
            {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
            {isLocked ? 'SESSION LOCKED' : 'LOCK SESSION [F12]'}
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Current Session Summary */}
           <div className="space-y-6">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Current Drawer Summary</h2>
              
              <div className="bg-slate-900 rounded-lg p-8 text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Banknote size={80} />
                 </div>
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Net Cash Inventory</p>
                 <h3 className="text-4xl font-black tracking-tighter mb-8">₹14,580.00</h3>
                 
                 <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                    <div>
                       <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Starting Cash</p>
                       <p className="text-sm font-black tracking-tight text-white/80">₹2,000.00</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Cash Inflow</p>
                       <p className="text-sm font-black tracking-tight text-emerald-400">+₹12,580.00</p>
                    </div>
                 </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-rose-50 text-rose-500 flex items-center justify-center">
                          <ArrowDownLeft size={16} />
                       </div>
                       <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Total Cash Out</span>
                    </div>
                    <span className="text-sm font-black text-rose-500">-₹0.00</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-500 flex items-center justify-center">
                          <ArrowUpRight size={16} />
                       </div>
                       <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Total Cash In</span>
                    </div>
                    <span className="text-sm font-black text-emerald-500">+₹12,580.00</span>
                 </div>
                 <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Closing Balance</span>
                    <span className="text-[13px] font-black text-slate-900">₹14,580.00</span>
                 </div>
              </div>
           </div>

           {/* Manual Reconciliation Form */}
           <div className="space-y-6">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">End of Day Reconciliation</h2>
              <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm space-y-6">
                 <div className="flex items-start gap-4 p-4 bg-blue-50 rounded border border-blue-100 mb-6">
                    <Calculator size={20} className="text-blue-500 shrink-0" />
                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest leading-relaxed">
                       Please enter the total physical cash count in the drawer to reconcile with the system balance.
                    </p>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual Physical Count</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">₹</span>
                       <input 
                         type="number" 
                         placeholder="0.00"
                         className="w-full bg-slate-50 border border-slate-200 p-4 pl-10 text-2xl font-black tracking-tighter text-slate-900 outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white rounded transition-all"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reconciliation Note</label>
                    <textarea 
                      placeholder="ENTER REASON FOR VARIANCE (IF ANY)"
                      className="w-full bg-slate-50 border border-slate-200 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white rounded h-24 transition-all"
                    ></textarea>
                 </div>

                 <button className="w-full py-4 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                    <ShieldCheck size={18} />
                    Finalize EOD Reconciliation
                 </button>
              </div>
           </div>
        </div>

        {/* Audit Advice */}
        <div className="max-w-4xl mx-auto mt-12 p-6 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-4">
           <AlertTriangle size={24} className="text-amber-600 shrink-0" />
           <div>
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-tight mb-1">Drawer Compliance Policy</h4>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed">
                 Unreconciled cash variances exceeding 2% of total volume will be flagged for review. Ensure all physical cash is counted accurately.
              </p>
           </div>
           <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-white border border-amber-200 text-amber-900 rounded text-[9px] font-black uppercase tracking-widest shadow-sm">
              <Printer size={14} />
              Print Audit Log
           </button>
        </div>
      </div>
    </div>
  );
}
