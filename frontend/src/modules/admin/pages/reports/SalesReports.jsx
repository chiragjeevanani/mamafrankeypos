
import React from 'react';
import { BarChart3, Download, Calendar, ArrowUpRight, ArrowDownLeft, TrendingUp, DollarSign } from 'lucide-react';

export default function SalesReports() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Sales Intelligence</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Fiscal Metrics & Revenue Performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 px-6 border border-slate-200 text-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all outline-none">
            <Calendar size={14} />
            Period Selection
          </button>
          <button className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none">
            <Download size={14} />
            Export Dataset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gross Revenue</span>
            <TrendingUp size={14} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter mb-2">₹1,24,500</div>
          <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-500 uppercase tracking-widest underline decoration-transparent">
            <ArrowUpRight size={10} />
            +12.5% vs Last Period
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Profit Matrix</span>
            <DollarSign size={14} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter mb-2">₹82,400</div>
          <div className="flex items-center gap-1 text-[8px] font-bold text-blue-500 uppercase tracking-widest underline decoration-transparent underline decoration-transparent">
            Stable Equilibrium
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Average Transaction</span>
            <BarChart3 size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter mb-2">₹842</div>
          <div className="flex items-center gap-1 text-[8px] font-bold text-rose-500 uppercase tracking-widest underline decoration-transparent">
            <ArrowDownLeft size={10} />
            -2.1% Drop Observed
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm">
          <div className="flex items-center justify-between mb-2 text-blue-600 underline decoration-transparent">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">VAT Compliance</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter mb-2">₹12,450</div>
          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Tax Provision Reserved</div>
        </div>
      </div>

      <div className="h-[400px] bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center relative overflow-hidden group">
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }} />
         <div className="text-center group-hover:scale-105 transition-transform duration-700">
            <BarChart3 size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Revenue Analytics Visualization</h3>
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1 underline decoration-transparent">Processing Data Streams...</p>
         </div>
      </div>
    </div>
  );
}
