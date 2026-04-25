
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
  const today = new Date().toISOString().split('T')[0];
  
  // --- States ---
  const [decreasePct, setDecreasePct] = useState(() => {
    return localStorage.getItem('rms_visibility_decrement') || '0';
  });
  const [isDecreaseQty, setIsDecreaseQty] = useState(false);
  const [selectedBills, setSelectedBills] = useState([]);
  const [searchItem, setSearchItem] = useState('');
  const [isReplaceEnabled, setIsReplaceEnabled] = useState(false);
  const [replaceWithItem, setReplaceWithItem] = useState('');
  
  // Mock Data for the table (Bill Details)
  const [bills, setBills] = useState([
    { id: '7581', date: '20-04-2026', amount: 135.00, mode: 'CASH', type: 'TABLE BILL', discount: 0.00, cashier: 'admin', table: '10', items: 1, year: '2026-2027', items_list: ['EGG CHICKEN ROLL'] },
    { id: '7582', date: '20-04-2026', amount: 120.00, mode: 'CASH', type: 'TAKE WAY', discount: 0.00, cashier: 'admin', table: 'N/A', items: 1, year: '2026-2027', items_list: ['PLAIN CHICKEN ROLL'] },
    { id: '7583', date: '20-04-2026', amount: 230.00, mode: 'UPI', type: 'TABLE BILL', discount: 0.00, cashier: 'admin', table: '5', items: 1, year: '2026-2027', items_list: ['CHILLY PANEER'] },
    { id: '7584', date: '20-04-2026', amount: 150.00, mode: 'CASH', type: 'TAKE WAY', discount: 0.00, cashier: 'admin', table: 'N/A', items: 1, year: '2026-2027', items_list: ['DOUBLE EGG CHICKEN ROLL'] },
    { id: '7585', date: '20-04-2026', amount: 180.00, mode: 'CARD', type: 'TABLE BILL', discount: 0.00, cashier: 'admin', table: '12', items: 1, year: '2026-2027', items_list: ['BUTTER CHICKEN FULL'] },
    { id: '7586', date: '25-04-2026', amount: 160.00, mode: 'UPI', type: 'TABLE BILL', discount: 0.00, cashier: 'admin', table: '8', items: 1, year: '2026-2027', items_list: ['EGG PANEER ROLL'] },
    { id: '7587', date: '25-04-2026', amount: 160.00, mode: 'CASH', type: 'TAKE WAY', discount: 0.00, cashier: 'admin', table: 'N/A', items: 1, year: '2026-2027', items_list: ['EGG PANEER ROLL'] },
  ]);

  const filteredBills = searchItem && searchItem !== '--Replace this item--'
    ? bills.filter(bill => bill.items_list?.some(item => item.toLowerCase() === searchItem.toLowerCase()))
    : bills;

  const handleApplyModify = () => {
    localStorage.setItem('rms_visibility_decrement', decreasePct);
    alert(`Protocol Modified: System visibility mask updated.`);
  };

  const toggleBillSelection = (id) => {
    setSelectedBills(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleExportSnapshot = () => {
    const headers = ["Bill ID", "Date", "Amount", "Mode", "Type", "Table", "Items"];
    const rows = filteredBills.map(bill => [
      bill.id,
      bill.date,
      bill.amount,
      bill.mode,
      bill.type,
      bill.table,
      bill.items_list.join(' | ')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `adjustment_protocol_snapshot_${new Date().toLocaleDateString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Snapshot exported successfully!");
  };

  return (
    <div className="h-full w-full bg-[#F4F4F7] text-slate-800 font-sans flex flex-col overflow-hidden border-2 border-slate-200 selection:bg-[#E1261C]/10">
      
      <div className="bg-white p-6 border-b border-slate-200 shadow-sm">
         <div className="grid grid-cols-4 gap-x-8 gap-y-6">
            
            {/* Column 1: Item Management */}
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Search Item</label>
                  <select 
                     value={searchItem}
                     onChange={(e) => setSearchItem(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 h-9 text-[11px] font-bold uppercase rounded-md outline-none px-3 focus:ring-2 focus:ring-[#E1261C]/10 focus:border-[#E1261C]/50 transition-all"
                  >
                     <option>--Replace this item--</option>
                     {menuItems.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                  </select>
               </div>
               <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                     <input 
                        type="checkbox" 
                        checked={isReplaceEnabled}
                        onChange={(e) => setIsReplaceEnabled(e.target.checked)}
                        className="w-4 h-4 accent-[#E1261C] cursor-pointer" 
                     />
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider cursor-pointer">Replace With</label>
                  </div>
                  <select 
                     value={replaceWithItem}
                     onChange={(e) => setReplaceWithItem(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 h-9 text-[11px] font-bold uppercase rounded-md outline-none px-3 focus:ring-2 focus:ring-[#E1261C]/10 focus:border-[#E1261C]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                     disabled={!isReplaceEnabled}
                  >
                     <option>--Update this item--</option>
                     {menuItems.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                  </select>
               </div>
            </div>

            {/* Column 2: Order Categorization */}
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Payment Mode</label>
                  <select className="w-full bg-slate-50 border border-slate-200 h-9 text-[11px] font-bold uppercase rounded-md outline-none px-3">
                     <option>--All Modes--</option>
                     <option>CASH</option>
                     <option>CARD</option>
                     <option>UPI</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Bill Type</label>
                  <select className="w-full bg-slate-50 border border-slate-200 h-9 text-[11px] font-bold uppercase rounded-md outline-none px-3">
                     <option>--All Types--</option>
                     <option>TABLE BILL</option>
                     <option>TAKE WAY</option>
                  </select>
               </div>
            </div>

            {/* Column 3: Source & Pricing */}
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Target Outlet</label>
                  <select className="w-full bg-slate-50 border border-slate-200 h-9 text-[11px] font-bold uppercase rounded-md outline-none px-3">
                     <option>Main Outlet (Sadar)</option>
                     <option>Station Branch</option>
                     <option>City Center</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Protocol Price Range</label>
                  <select className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100 h-9 text-[11px] font-black uppercase tracking-widest rounded-md outline-none px-3">
                     <option>Price Range: Standard</option>
                     <option>Price Range: Premium</option>
                     <option>Price Range: Economy</option>
                  </select>
               </div>
            </div>

            {/* Column 4: Temporal & Actions */}
            <div className="space-y-4 flex flex-col pl-8 border-l border-slate-100">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Date Duration</label>
                  <div className="flex gap-2">
                     <input type="date" defaultValue={today} min={today} className="flex-1 bg-white border border-slate-200 h-9 px-5 text-[10px] font-bold uppercase rounded-md outline-none focus:border-[#E1261C]/50" />
                     <input type="date" defaultValue={today} min={today} className="flex-1 bg-white border border-slate-200 h-9 px-5 text-[10px] font-bold uppercase rounded-md outline-none focus:border-[#E1261C]/50" />
                  </div>
               </div>
               <div className="flex-1 flex flex-col justify-end">
                  <div className="flex items-center gap-3">
                     <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Bill No</label>
                        <input type="text" placeholder="####" className="w-full bg-slate-50 border border-slate-200 h-9 rounded-md px-3 text-[11px] font-black" />
                     </div>
                     <div className="flex gap-2 pt-5">
                        <button className="h-9 px-4 bg-gradient-to-br from-[#E1261C] to-[#C11F17] text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-md active:scale-95 transition-all">SEARCH</button>
                        <button className="h-9 px-4 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-md active:scale-95 transition-all">CLOSE</button>
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         

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
                        <th className="px-3 py-4">Item Name</th>
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
                     {filteredBills.map((bill, idx) => (
                        <tr 
                          key={bill.id} 
                          onClick={() => toggleBillSelection(bill.id)}
                          className={`${selectedBills.includes(bill.id) ? 'bg-[#E1261C]/5 border-l-4 border-[#E1261C]' : 'border-l-4 border-transparent'} border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-all`}
                        >
                           <td className="px-3 py-3 text-center"><input type="checkbox" checked={selectedBills.includes(bill.id)} readOnly className="accent-[#E1261C]" /></td>
                           <td className="px-3 py-3 font-black text-[#E1261C] tabular-nums">{bill.id}</td>
                           <td className="px-3 py-3 font-bold text-emerald-600 uppercase italic">
                              {isReplaceEnabled && replaceWithItem && searchItem ? replaceWithItem : (bill.items_list?.join(', ') || 'N/A')}
                           </td>
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
                  <span className="text-sm font-black text-white tabular-nums">{filteredBills.length}</span>
               </div>
               <div className="flex flex-col bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.15em]">Selection Audit</span>
                  <span className="text-sm font-black text-amber-500 tabular-nums">{selectedBills.length}</span>
               </div>
               <div className="flex flex-col bg-[#E1261C]/20 rounded-lg px-3 py-1.5 border border-[#E1261C]/50 relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#E1261C]" />
                  <span className="text-[8px] font-black text-[#E1261C] uppercase tracking-[0.15em]">Aggregate Fiscal</span>
                  <span className="text-sm font-black text-white tabular-nums">₹{maskCurrency(filteredBills.reduce((s,b)=>s+b.amount, 0)).toLocaleString()} .00</span>
               </div>
               <div className="flex flex-col bg-[#E1261C]/20 rounded-lg px-3 py-1.5 border border-[#E1261C]/50">
                  <span className="text-[8px] font-black text-[#E1261C] uppercase tracking-[0.15em]">Selection Total</span>
                  <span className="text-sm font-black text-white tabular-nums">₹0.00</span>
               </div>
            </div>
         </div>

         {/* Right Control Side Panel (Admin Theme) */}
         <div className="w-36 bg-white border-l border-slate-200 flex flex-col p-3 gap-5 shrink-0 relative">
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
                  className="w-24 mx-auto bg-slate-50 border border-slate-200 h-10 rounded-lg text-center text-sm font-black text-slate-800 focus:border-[#E1261C] transition-all outline-none" 
               />
            </div>

            <div 
               className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-[#E1261C] hover:bg-white hover:shadow-md transition-all duration-300 cursor-pointer group" 
               onClick={() => setIsDecreaseQty(!isDecreaseQty)}
            >
               <input 
                 type="checkbox" 
                 checked={isDecreaseQty}
                 onChange={() => {}}
                 className="w-5 h-5 accent-[#E1261C] cursor-pointer" 
               />
               <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider group-hover:text-slate-900 transition-colors">Mask Quantity</span>
            </div>

            <button 
              onClick={handleApplyModify}
              className="w-[85%] mx-auto bg-gradient-to-br from-[#E1261C] to-[#A11912] text-white py-1.5 px-6 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] shadow-[0_4px_10px_rgba(225,38,28,0.2)] hover:shadow-[0_8px_16px_rgba(225,38,28,0.3)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95 border-b border-black/30 flex items-center justify-center gap-2 group relative overflow-hidden"
            >
               <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10" />
               <Save size={14} className="group-hover:rotate-12 transition-transform" />
               <span className="relative z-10">Apply Protocol</span>
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </button>

            <div className="mt-auto flex flex-col items-center gap-2 pt-4 border-t border-slate-100">
                <button 
                   onClick={handleExportSnapshot}
                   className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center hover:bg-emerald-600 hover:text-white hover:rotate-1 scale-100 hover:scale-110 transition-all duration-500 shadow-[0_4px_12px_rgba(16,185,129,0.1)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.3)] group"
                >
                   <FileSpreadsheet size={26} className="group-hover:scale-110 transition-transform" />
                </button>
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center">Export Snapshot</span>
            </div>
         </div>
      </div>

    </div>
  );
}
