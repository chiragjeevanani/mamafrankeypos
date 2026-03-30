
import React, { useState } from 'react';
import { 
  XCircle, Search, Filter, AlertTriangle, 
  Trash2, RefreshCcw, Eye, ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_CANCELLED = [
  { id: 'ORD-875', table: 'Table 3', total: 640, date: '2024-03-16 11:20', reason: 'Customer Changed Mind', status: 'refunded' },
  { id: 'ORD-870', table: 'Table 8', total: 1120, date: '2024-03-16 10:45', reason: 'Kitchen Error / Out of Stock', status: 'pending_refund' },
  { id: 'ORD-862', table: 'Table 1', total: 450, date: '2024-03-15 21:30', reason: 'Order Mistake by Server', status: 'no_payment' },
];

export default function CancelledOrders() {
  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Cancelled Orders Management</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review Cancelled Transactions & Refund Status</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded border border-rose-100 shadow-sm animate-pulse">
            <ShieldAlert size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Audit Tracking Active</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH CANCELLED ORDERS..."
              className="w-full bg-slate-50 border border-slate-100 rounded py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-rose-600 focus:bg-white transition-all underline decoration-transparent"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <div className="space-y-4">
          {MOCK_CANCELLED.map((order) => (
            <motion.div 
              key={order.id}
              whileHover={{ x: 4 }}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex items-center justify-between hover:border-rose-200 transition-all group relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 opacity-20 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                  <XCircle size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{order.id}</h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded">{order.table}</span>
                  </div>
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1">REASON: {order.reason}</p>
                  <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">TIMESTAMP: {order.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiscal Impact</p>
                  <h4 className="text-lg font-black text-slate-950 tracking-tighter">₹{order.total}</h4>
                </div>
                
                <div className="text-right min-w-[120px]">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Protocol</p>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded inline-block ${
                    order.status === 'refunded' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                    order.status === 'pending_refund' ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse' : 
                    'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pl-4 border-l border-slate-50">
                  <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded transition-all outline-none"><Eye size={16} /></button>
                  <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-500 rounded transition-all outline-none"><RefreshCcw size={16} /></button>
                  <button className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-all outline-none"><Trash2 size={16} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-4 shadow-sm">
          <AlertTriangle size={20} className="text-amber-600 shrink-0" />
          <div>
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-tight mb-1">Operational Protocol Advisory</h4>
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed">
              All void operations are recorded in the security ledger and require manager authorization overrides. Persistent void patterns may trigger system-wide security audits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
