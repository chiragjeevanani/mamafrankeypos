
import React, { useState } from 'react';
import { 
  CheckCircle2, Search, Filter, Download, 
  Eye, Receipt, ArrowUpDown, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_COMPLETED = [
  { id: 'ORD-892', table: 'Table 1', items: 4, total: 1150, date: '2024-03-16 13:45', payment: 'UPI', status: 'paid' },
  { id: 'ORD-891', table: 'Takeaway', items: 2, total: 420, date: '2024-03-16 13:30', payment: 'Cash', status: 'paid' },
  { id: 'ORD-890', table: 'Table 5', items: 6, total: 2450, date: '2024-03-16 13:15', payment: 'Card', status: 'paid' },
  { id: 'ORD-889', table: 'Table 2', items: 3, total: 780, date: '2024-03-16 13:00', payment: 'UPI', status: 'paid' },
  { id: 'ORD-888', table: 'Table 9', items: 1, total: 120, date: '2024-03-16 12:45', payment: 'Cash', status: 'paid' },
];

export default function CompletedOrders() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">Completed Order History</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review Past Transactions & Payment Records</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-10 px-4 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-100 flex items-center gap-2 outline-none">
              <Calendar size={14} />
              Set Date Range
            </button>
            <button className="h-10 px-4 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 outline-none">
              <Download size={14} />
              Export History
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH BY ORDER ID, TABLE, OR TOTAL AMOUNT..."
              className="w-full bg-slate-50 border border-slate-100 rounded py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all underline decoration-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="h-10 px-4 bg-white border border-slate-200 text-slate-400 rounded text-[10px] font-black uppercase tracking-widest hover:text-slate-900 flex items-center gap-2 transition-all outline-none">
            <Filter size={14} />
            More Filters
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/6">Order ID</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/6 text-center">Table / Type</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/6 text-center">Items Count</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/6 text-center">Payment Status</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/6 text-right">Total Amount</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/6 text-right underline decoration-transparent">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_COMPLETED.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{order.id}</span>
                    <p className="text-[9px] font-bold text-slate-400 leading-none mt-1">{order.date}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{order.table}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.items} ITEMS</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">Paid</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em]">{order.payment}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-slate-950 tracking-tighter">₹{order.total}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-500 rounded transition-all outline-none border border-transparent hover:border-slate-100"><Eye size={14} /></button>
                      <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded transition-all outline-none border border-transparent hover:border-slate-100"><Receipt size={14} /></button>
                      <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-rose-500 rounded transition-all outline-none border border-transparent hover:border-slate-100"><Download size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Showing [01-50 of 429] Orders</span>
            <div className="flex items-center gap-1">
               <button className="w-8 h-8 rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center outline-none">1</button>
               <button className="w-8 h-8 rounded bg-white border border-slate-100 text-slate-900 font-black text-[10px] flex items-center justify-center outline-none">2</button>
               <button className="w-8 h-8 rounded bg-white border border-slate-200 text-slate-400 transition-all flex items-center justify-center outline-none">3</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
