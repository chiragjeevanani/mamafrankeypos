
import React from 'react';
import { 
  Star, Search, Filter, History, 
  ArrowUpRight, ArrowDownLeft, Gift,
  ShieldCheck, Calculator
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_LOYALTY = [
  { id: 'L-982', name: 'Rahul Khanna', action: 'Dine-in Credit', points: '+150', date: 'TODAY 14:20', balance: 5120 },
  { id: 'L-981', name: 'Chirag Jeevanani', action: 'Reward Redemption', points: '-500', date: 'TODAY 13:45', balance: 2450 },
  { id: 'L-980', name: 'Ananya Mishra', action: 'Birthday Bonus', points: '+200', date: 'YESTERDAY 18:00', balance: 840 },
  { id: 'L-979', name: 'Rahul Khanna', action: 'Dine-in Credit', points: '+85', date: 'YESTERDAY 12:30', balance: 4970 },
];

export default function LoyaltyPoints() {
  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500 overflow-hidden">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Loyalty Point Management</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review Point Earnings, Redemptions & Program Performance</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded border border-blue-100 shadow-sm">
             <Calculator size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Ratio: 1 Point = ₹1.00</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH LEDGER BY CUSTOMER NAME OR TRANSACTION ID..."
              className="w-full bg-slate-50 border border-slate-100 rounded py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all underline decoration-transparent"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           {[
             { label: 'Total Points Issued', value: '1.2M', icon: ArrowUpRight, color: 'text-emerald-500' },
             { label: 'Total Points Redeemed', value: '420K', icon: Gift, color: 'text-blue-500' },
             { label: 'Net Liability', value: '780K', icon: ShieldCheck, color: 'text-slate-900' },
             { label: 'Redemption Rate', value: '35%', icon: History, color: 'text-amber-500' }
           ].map((stat, idx) => (
             <div key={idx} className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                   <stat.icon size={18} className={stat.color} />
                </div>
             </div>
           ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer Name</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Action Performed</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Points Value</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Balance</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {MOCK_LOYALTY.map(tx => (
                   <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                         <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{tx.name}</span>
                         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{tx.id}</p>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{tx.action}</span>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{tx.date}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <span className={`text-[11px] font-black ${tx.points.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {tx.points} POINTS
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-1.5">
                            <Star size={12} className="text-blue-500 fill-blue-500/10" />
                            <span className="text-[11px] font-black text-slate-950 tracking-tighter">{tx.balance.toLocaleString()}</span>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      <footer className="h-16 bg-white border-t border-slate-200 px-8 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Synced: Just now</span>
        <button className="h-9 px-6 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 outline-none">
          Manual Adjust Points
        </button>
      </footer>
    </div>
  );
}
