
import React, { useState } from 'react';
import { 
  History, Search, Filter, Download, 
  CreditCard, Banknote, Smartphone,
  ExternalLink, Calendar, Calculator
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_PAYMENTS = [
  { id: 'TXN-9021', amount: 1240, method: 'UPI', status: 'success', time: '14:20', table: 'Table 4', cashier: 'C. Jeevanani' },
  { id: 'TXN-9020', amount: 450, method: 'Cash', status: 'success', time: '14:15', table: 'Table 1', cashier: 'C. Jeevanani' },
  { id: 'TXN-9019', amount: 2800, method: 'Card', status: 'success', time: '13:50', table: 'Table 9', cashier: 'C. Jeevanani' },
  { id: 'TXN-9018', amount: 720, method: 'UPI', status: 'success', time: '13:30', table: 'Table 5', cashier: 'S. Rawat' },
  { id: 'TXN-9017', amount: 110, method: 'Cash', status: 'success', time: '13:10', table: 'Takeaway', cashier: 'S. Rawat' },
];

export default function PaymentHistory() {
  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500 overflow-hidden">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Payment History & Transaction Logs</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review All Completed Payments & Transaction Modes</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-50 p-1 border border-slate-100 rounded">
                <button className="px-4 py-1.5 bg-white text-slate-900 shadow-sm rounded text-[9px] font-black uppercase tracking-widest">LIVE FEED</button>
                <button className="px-4 py-1.5 text-slate-400 hover:text-slate-900 rounded text-[9px] font-black uppercase tracking-widest">HISTORICAL</button>
             </div>
             <button className="h-9 px-4 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 outline-none">
                <Download size={14} />
                Audit Export
             </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-2">
           {[
             { label: 'UPI Revenue', value: '₹42,850', color: 'text-blue-500', icon: Smartphone },
             { label: 'Cash Flow', value: '₹12,400', color: 'text-emerald-500', icon: Banknote },
             { label: 'Card Volume', value: '₹8,920', color: 'text-amber-500', icon: CreditCard },
           ].map((stat, idx) => (
             <div key={idx} className="bg-slate-50/50 border border-slate-100 p-4 rounded-lg flex items-center justify-between">
                <div>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                   <h3 className={`text-lg font-extrabold tracking-tighter ${stat.color}`}>{stat.value}</h3>
                </div>
                <div className={`w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center ${stat.color} opacity-70`}>
                   <stat.icon size={14} />
                </div>
             </div>
           ))}
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
         <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                     <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                     <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest uppercase">Source</th>
                     <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest uppercase">Time</th>
                     <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest uppercase">Cashier</th>
                     <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {MOCK_PAYMENTS.map(payment => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center ${
                               payment.method === 'UPI' ? 'text-blue-500 bg-blue-50' : 
                               payment.method === 'Cash' ? 'text-emerald-500 bg-emerald-50' : 
                               'text-amber-500 bg-amber-50'
                             }`}>
                                {payment.method === 'UPI' ? <Smartphone size={14} /> : 
                                 payment.method === 'Cash' ? <Banknote size={14} /> : 
                                 <CreditCard size={14} />}
                             </div>
                             <div>
                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{payment.id}</span>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{payment.method} PAYMENT</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{payment.table}</span>
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{payment.time} HOURS</span>
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{payment.cashier}</span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                             <span className="text-[13px] font-black text-slate-950 tracking-tighter">₹{payment.amount}</span>
                             <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Success</span>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         
         <div className="mt-8 flex justify-center">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm transition-all hover:shadow-md">
               <History size={14} />
               Load Previous Transactions
            </button>
         </div>
      </div>
    </div>
  );
}
