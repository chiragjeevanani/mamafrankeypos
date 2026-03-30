
import React from 'react';
import { Users, Search, Filter, Download, UserPlus, Heart, Zap } from 'lucide-react';

export default function CustomerReports() {
  const topCustomers = [
    { id: 1, name: 'Aniket Sharma', orders: 42, value: 52000, loyalty: 'Platinum' },
    { id: 2, name: 'Megha Kapoor', orders: 38, value: 48500, loyalty: 'Gold' },
    { id: 3, name: 'Vikram Seth', orders: 25, value: 31000, loyalty: 'Gold' },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Identity Intelligence</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Consumer Behavior & Retention Metrics</p>
        </div>
        <button className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none">
          <Download size={14} />
          Cohort Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-sm flex items-center gap-4 group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-sm flex items-center justify-center transition-colors group-hover:bg-blue-600 group-hover:text-white underline decoration-transparent">
            <UserPlus size={24} />
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 underline decoration-transparent">New Acquisitions (MoM)</div>
            <div className="text-2xl font-black text-slate-900 tracking-tighter">+424 Entities</div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-sm flex items-center gap-4 group">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-sm flex items-center justify-center transition-colors group-hover:bg-rose-600 group-hover:text-white underline decoration-transparent">
            <Heart size={24} />
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 underline decoration-transparent">Retention Ratio</div>
            <div className="text-2xl font-black text-slate-900 tracking-tighter">68.4%</div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-sm flex items-center gap-4 group">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-sm flex items-center justify-center transition-colors group-hover:bg-amber-600 group-hover:text-white underline decoration-transparent">
            <Zap size={24} />
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 underline decoration-transparent">LTV Prediction</div>
            <div className="text-2xl font-black text-slate-900 tracking-tighter">₹4,200 <span className="text-xs text-slate-400 text-slate-400">/avg</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm overflow-hidden underline decoration-transparent">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between underline decoration-transparent">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">High-Velocity Consumer Cohort</h3>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] underline decoration-transparent">Top 1% Analysis</span>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Customer Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Engagement Pulse</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Lifetime Commitment</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Loyalty Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {topCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{customer.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-500 tracking-tighter">{customer.orders} Interactions</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs font-black text-slate-900">₹{customer.value.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest ${customer.loyalty === 'Platinum' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {customer.loyalty}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
