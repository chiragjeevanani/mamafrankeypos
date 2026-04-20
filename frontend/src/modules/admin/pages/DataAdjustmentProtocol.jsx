
import React, { useState, useEffect } from 'react';
import { 
  Search, Save, X, Edit3, Trash2, 
  FileSpreadsheet, Monitor, LogOut, HardDrive, 
  ChevronDown, Calendar, Hash, CreditCard
} from 'lucide-react';
import { usePos } from '../../pos/context/PosContext';
import { maskQuantity, maskCurrency } from '../utils/dataMask';

export default function DataAdjustmentProtocol() {
  const { menuItems } = usePos();
  
  // --- States ---
  const [decreasePct, setDecreasePct] = useState(() => {
    return localStorage.getItem('rms_visibility_decrement') || '0';
  });
  const [isDecreaseQty, setIsDecreaseQty] = useState(false);
  const [selectedBills, setSelectedBills] = useState([]);
  
  // Mock Data for the table (Bill Details)
  const [bills, setBills] = useState([
    { id: '7581', date: '20-04-2026', amount: 680.00, mode: 'CASH', type: 'TABLE BILL', discount: 0.00, cashier: 'admin', table: '10', items: 5, year: '2026-2027' },
    { id: '7582', date: '20-04-2026', amount: 20.00, mode: 'CASH', type: 'TAKE WAY', discount: 0.00, cashier: 'admin', table: 'N/A', items: 1, year: '2026-2027' },
    { id: '7584', date: '20-04-2026', amount: 170.00, mode: 'CASH', type: 'TAKE WAY', discount: 0.00, cashier: 'admin', table: 'N/A', items: 2, year: '2026-2027' },
    { id: '7585', date: '20-04-2026', amount: 198.00, mode: 'CASH', type: 'TABLE BILL', discount: 0.00, cashier: 'admin', table: '13', items: 1, year: '2026-2027' },
    { id: '7587', date: '20-04-2026', amount: 90.00, mode: 'CASH', type: 'TAKE WAY', discount: 0.00, cashier: 'admin', table: 'N/A', items: 1, year: '2026-2027' },
    { id: '7589', date: '20-04-2026', amount: 99.00, mode: 'CASH', type: 'TAKE WAY', discount: 0.00, cashier: 'admin', table: 'N/A', items: 1, year: '2026-2027' },
    { id: '7590', date: '20-04-2026', amount: 0.00, mode: 'CASH', type: 'TAKE WAY', discount: 0.00, cashier: 'admin', table: 'N/A', items: 0, year: '2026-2027' },
    { id: '7591', date: '20-04-2026', amount: 420.00, mode: 'CASH', type: 'TAKE WAY', discount: 0.00, cashier: 'admin', table: 'N/A', items: 1, year: '2026-2027' },
    { id: '7592', date: '20-04-2026', amount: 510.00, mode: 'CASH', type: 'TAKE WAY', discount: 0.00, cashier: 'admin', table: 'N/A', items: 2, year: '2026-2027' },
    { id: '7594', date: '20-04-2026', amount: 290.00, mode: 'CASH', type: 'TABLE BILL', discount: 0.00, cashier: 'admin', table: '17', items: 3, year: '2026-2027' },
  ]);

  const handleApplyModify = () => {
    localStorage.setItem('rms_visibility_decrement', decreasePct);
    alert(`Protocol Modified: System visibility mask updated.`);
  };

  const toggleBillSelection = (id) => {
    setSelectedBills(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-full w-full bg-[#F4F4F7] text-slate-800 font-sans flex flex-col overflow-hidden border-2 border-slate-200 selection:bg-[#E1261C]/10">
      
      {/* Top Protocol Controls */}
      <div className="bg-white p-4 border-b border-slate-200">
         <div className="grid grid-cols-12 gap-x-6 gap-y-3 items-center">
            
            {/* Step 1 & 2 */}
            <div className="col-span-4 space-y-2">
               <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider min-w-[120px]">Search Item</span>
                  <select className="flex-1 bg-slate-50 border border-slate-200 h-8 text-[11px] font-bold uppercase rounded-md outline-none px-2 focus:ring-1 focus:ring-[#E1261C]/20">
                     <option>--Replace this item--</option>
                     {menuItems.map(item => <option key={item.id}>{item.name}</option>)}
                  </select>
               </div>
               <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 min-w-[120px]">
                     <input type="checkbox" className="w-3.5 h-3.5 accent-[#E1261C]" />
                     <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Replace With</span>
                  </div>
                  <select className="flex-1 bg-slate-50 border border-slate-200 h-8 text-[11px] font-bold uppercase rounded-md outline-none px-2 focus:ring-1 focus:ring-[#E1261C]/20">
                     <option>--Update this item--</option>
                     {menuItems.map(item => <option key={item.id}>{item.name}</option>)}
                  </select>
               </div>
            </div>

            {/* Payment & Bill Type */}
            <div className="col-span-3 space-y-2">
               <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider min-w-[90px]">Payment:</span>
                  <select className="flex-1 bg-slate-50 border border-slate-200 h-8 text-[11px] font-bold uppercase rounded-md outline-none px-2">
                     <option>--All Modes--</option>
                     <option>CASH</option>
                     <option>CARD</option>
                     <option>UPI</option>
                  </select>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider min-w-[90px]">Bill Type:</span>
                  <select className="flex-1 bg-slate-50 border border-slate-200 h-8 text-[11px] font-bold uppercase rounded-md outline-none px-2">
                     <option>--All Types--</option>
                     <option>TABLE BILL</option>
                     <option>TAKE WAY</option>
                  </select>
               </div>
            </div>

            {/* Price Range */}
            <div className="col-span-3 space-y-2">
               <select className="w-full bg-slate-50 border border-slate-200 h-8 text-[11px] font-bold uppercase rounded-md outline-none px-2">
                  <option>Main Outlet (Sadar)</option>
               </select>
               <select className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100 h-8 text-[11px] font-black uppercase tracking-widest rounded-md outline-none px-2">
                  <option>Price Range: Standard</option>
               </select>
            </div>

            {/* Search/Close Buttons */}
            <div className="col-span-2 flex flex-col gap-2">
               <button className="bg-[#E1261C] text-white py-2 px-4 text-xs font-black uppercase tracking-widest rounded-lg shadow-lg shadow-red-900/20 active:scale-95 transition-all">Search</button>
               <button className="bg-slate-800 text-white py-2 px-4 text-xs font-black uppercase tracking-widest rounded-lg shadow-lg active:scale-95 transition-all">Close</button>
            </div>

            {/* Dates & Bill Search */}
            <div className="col-span-12 grid grid-cols-12 gap-4 items-center">
               <div className="col-span-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                     <span className="text-[10px] font-black uppercase text-slate-400">From</span>
                     <input type="date" defaultValue="2026-04-20" className="flex-1 bg-white border border-slate-200 h-8 text-center text-[10px] font-bold uppercase rounded-md" />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                     <span className="text-[10px] font-black uppercase text-slate-400">To</span>
                     <input type="date" defaultValue="2026-04-20" className="flex-1 bg-white border border-slate-200 h-8 text-center text-[10px] font-bold uppercase rounded-md" />
                  </div>
               </div>
               
               <div className="col-span-3 flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase text-slate-400">Bill No:</span>
                  <input type="text" placeholder="####" className="flex-1 bg-slate-50 border border-slate-200 h-8 rounded-md px-3 text-xs font-black" />
               </div>

               <div className="col-span-5 flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-dashed border-slate-200">
                  <div className="flex items-center gap-2">
                     <input type="checkbox" className="w-3.5 h-3.5 accent-[#E1261C]" />
                     <span className="text-[10px] font-black uppercase text-slate-600">Delete Scan</span>
                  </div>
                  <select className="flex-1 bg-white border border-slate-200 h-8 text-[10px] font-bold uppercase rounded-md outline-none px-2 italic text-slate-400">
                     <option>--Protocol Action--</option>
                  </select>
               </div>
            </div>

         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         
         {/* Left Side Menu (Admin Dark Style) */}
         <div className="w-28 bg-[#1A1A1A] flex flex-col gap-1.5 p-2 shrink-0">
            <div className="p-2 border-b border-white/5 mb-2">
               <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] leading-tight text-center">Protocol</h3>
            </div>
            
            <button className="w-full bg-[#E1261C] text-white rounded-xl py-3 flex flex-col items-center gap-2 shadow-lg shadow-red-900/40">
               <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
                  <FileSpreadsheet size={18} />
               </div>
               <span className="text-[9px] font-black uppercase tracking-widest">Reports</span>
            </button>

            <button className="w-full bg-white/5 text-white/70 hover:bg-white/10 rounded-xl py-3 flex flex-col items-center gap-2 transition-all">
               <HardDrive size={18} className="opacity-50" />
               <span className="text-[9px] font-black uppercase tracking-widest">Archive</span>
            </button>

            <div className="mt-auto">
               <button className="w-full bg-white/5 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl py-3 flex flex-col items-center gap-2 transition-all">
                  <LogOut size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-center">Exit Panel</span>
               </button>
            </div>
         </div>

         {/* Main Table Area */}
         <div className="flex-1 overflow-hidden flex flex-col bg-white">
            <div className="bg-slate-800 px-4 py-1.5 border-b border-black/10 flex items-center justify-between">
               <span className="text-[10px] font-black text-white uppercase tracking-[0.25em]">Audit Registry — Live Feed</span>
               <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-white/40 uppercase">Synchronized</span>
               </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-white">
               <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                     <tr>
                        <th className="px-3 py-4 w-10 text-center"><input type="checkbox" className="accent-[#E1261C]" /></th>
                        <th className="px-3 py-4">Bill No</th>
                        <th className="px-3 py-4">Bill Date</th>
                        <th className="px-3 py-4 text-right">Bill Amount</th>
                        <th className="px-3 py-4">Payment</th>
                        <th className="px-3 py-4">Type</th>
                        <th className="px-3 py-4 text-right">Discount</th>
                        <th className="px-3 py-4">Cashier</th>
                        <th className="px-3 py-4 text-center">Table</th>
                        <th className="px-3 py-4 text-center">Qty</th>
                        <th className="px-3 py-4">Year</th>
                     </tr>
                  </thead>
                  <tbody className="text-[11px]">
                     {bills.map((bill, idx) => (
                        <tr 
                          key={bill.id} 
                          onClick={() => toggleBillSelection(bill.id)}
                          className={`${selectedBills.includes(bill.id) ? 'bg-[#E1261C]/5 border-l-4 border-[#E1261C]' : 'border-l-4 border-transparent'} border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-all`}
                        >
                           <td className="px-3 py-3 text-center"><input type="checkbox" checked={selectedBills.includes(bill.id)} readOnly className="accent-[#E1261C]" /></td>
                           <td className="px-3 py-3 font-black text-[#E1261C] tabular-nums">{bill.id}</td>
                           <td className="px-3 py-3 font-bold text-slate-500">{bill.date}</td>
                           <td className="px-3 py-3 text-right font-black text-slate-900">₹{maskCurrency(bill.amount).toFixed(2)}</td>
                           <td className="px-3 py-3 font-bold uppercase text-slate-500">{bill.mode}</td>
                           <td className="px-3 py-3 font-bold uppercase text-slate-500">{bill.type}</td>
                           <td className="px-3 py-3 text-right text-slate-400">{bill.discount.toFixed(2)}</td>
                           <td className="px-3 py-3 font-bold uppercase text-slate-600">{bill.cashier}</td>
                           <td className="px-3 py-3 text-center font-bold text-slate-500">{bill.table}</td>
                           <td className="px-3 py-3 text-center font-black text-slate-800">{maskQuantity(bill.items)}</td>
                           <td className="px-3 py-3 font-bold text-slate-400">{bill.year}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* Table Footer Stats (Modern Style) */}
            <div className="bg-slate-900 grid grid-cols-4 border-t border-white/10 p-1.5 gap-2">
               <div className="flex flex-col bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.15em]">Registry Count</span>
                  <span className="text-sm font-black text-white tabular-nums">{bills.length}</span>
               </div>
               <div className="flex flex-col bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.15em]">Selection Audit</span>
                  <span className="text-sm font-black text-amber-500 tabular-nums">{selectedBills.length}</span>
               </div>
               <div className="flex flex-col bg-[#E1261C]/20 rounded-lg px-3 py-1.5 border border-[#E1261C]/50 relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#E1261C]" />
                  <span className="text-[8px] font-black text-[#E1261C] uppercase tracking-[0.15em]">Aggregate Fiscal</span>
                  <span className="text-sm font-black text-white tabular-nums">₹{maskCurrency(bills.reduce((s,b)=>s+b.amount, 0)).toLocaleString()} .00</span>
               </div>
               <div className="flex flex-col bg-[#E1261C]/20 rounded-lg px-3 py-1.5 border border-[#E1261C]/50">
                  <span className="text-[8px] font-black text-[#E1261C] uppercase tracking-[0.15em]">Selection Total</span>
                  <span className="text-sm font-black text-white tabular-nums">₹0.00</span>
               </div>
            </div>
         </div>

         {/* Right Control Side Panel (Admin Theme) */}
         <div className="w-40 bg-white border-l border-slate-200 flex flex-col p-4 gap-6 shrink-0 relative">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#E1261C]" />
            
            <div className="flex flex-col items-center">
               <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-inner mb-2 group">
                  <Monitor size={32} className="text-slate-200 group-hover:text-[#E1261C] transition-colors" />
               </div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Monitor</span>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                  <Hash size={12} className="text-[#E1261C]" />
                  Decrease Pct
               </label>
               <input 
                  type="text" 
                  value={decreasePct}
                  onChange={(e) => setDecreasePct(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 h-10 rounded-lg text-center text-sm font-black text-slate-800 focus:border-[#E1261C] transition-all outline-none" 
               />
               <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#E1261C]" style={{ width: `${decreasePct}%` }} />
               </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-[#E1261C] transition-all" onClick={() => setIsDecreaseQty(!isDecreaseQty)}>
               <input 
                 type="checkbox" 
                 checked={isDecreaseQty}
                 onChange={() => {}}
                 className="w-4 h-4 accent-[#E1261C] cursor-pointer" 
               />
               <span className="text-[9px] font-black uppercase text-slate-600 tracking-wider">Mask Quantity</span>
            </div>

            <button 
              onClick={handleApplyModify}
              className="w-full bg-[#E1261C] text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-900/30 hover:bg-[#C11F17] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
               <Save size={16} />
               Apply Protocol
            </button>

            <div className="mt-auto flex flex-col items-center gap-2 pt-4 border-t border-slate-100">
               <button className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                  <FileSpreadsheet size={24} />
               </button>
               <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center">Export Snapshot</span>
            </div>
         </div>
      </div>

      {/* Main Footer (Admin Status Bar) */}
      <div className="bg-white border-t border-slate-200 flex items-center h-8 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest divide-x divide-slate-100 italic">
         <div className="pr-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E1261C]" />
            Session: <span className="text-slate-800 font-black not-italic">Admin_Auth_042</span>
         </div>
         <div className="px-4">Node: <span className="text-[#E1261C] font-black not-italic">Cluster_Sadar</span></div>
         <div className="px-4 flex-1 flex justify-end gap-2 pr-2 opacity-60">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — System Pulse Active
         </div>
      </div>
    </div>
  );
}
