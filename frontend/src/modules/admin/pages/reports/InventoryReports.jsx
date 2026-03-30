
import React from 'react';
import { Box, PieChart, Download, ArrowUpRight, ArrowDownLeft, RefreshCcw, Layers } from 'lucide-react';

export default function InventoryReports() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Supply Analytics</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Stock Flow & Procurement Efficiency</p>
        </div>
        <button className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none">
          <Download size={14} />
          Inventory Audit Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-sm">
          <Layers size={20} className="text-blue-500 mb-4" />
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Inventory Asset Value</div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter">₹8,45,000</div>
          <div className="mt-4 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 w-[65%]" />
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-sm">
          <RefreshCcw size={20} className="text-emerald-500 mb-4" />
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 underline decoration-transparent">Annual Turnover Rate</div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter">14.2x</div>
          <div className="mt-4 flex items-center gap-2 text-[8px] font-black text-emerald-500 uppercase tracking-widest underline decoration-transparent">
             <ArrowUpRight size={12} />
             Operational Velocity Increasing
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-sm">
          <Box size={20} className="text-amber-500 mb-4" />
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 underline decoration-transparent">Holding Cost Analysis</div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter">₹12,400 <span className="text-xs text-slate-400">/mo</span></div>
          <div className="mt-4 flex items-center gap-2 text-[8px] font-black text-amber-500 uppercase tracking-widest underline decoration-transparent">
             Optimizing Storage Thresholds
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-8">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Inventory Distribution by Category</h3>
            <PieChart size={16} className="text-slate-400" />
         </div>
         <div className="space-y-6 underline decoration-transparent">
            {[
              { label: 'Meat & Poultry', value: 45, color: 'bg-blue-600' },
              { label: 'Dairy & Produce', value: 25, color: 'bg-emerald-600' },
              { label: 'Dry Grocery', value: 20, color: 'bg-slate-900' },
              { label: 'Oils & Fats', value: 10, color: 'bg-amber-500' },
            ].map((cat) => (
              <div key={cat.label} className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-900">{cat.label}</span>
                  <span className="text-slate-400">{cat.value}%</span>
                </div>
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color} transition-all duration-1000`} style={{ width: `${cat.value}%` }} />
                </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
