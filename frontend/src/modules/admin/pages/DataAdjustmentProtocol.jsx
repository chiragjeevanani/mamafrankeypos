import React, { useState, useEffect } from 'react';
import { 
  Search, Save, X, Edit3, Trash2, 
  FileSpreadsheet, Monitor, LogOut, HardDrive, 
  ChevronDown, Calendar, Hash, CreditCard, AlertCircle, RefreshCw
} from 'lucide-react';
import { usePos } from '../../pos/context/PosContext';
import { maskQuantity, maskCurrency } from '../utils/dataMask';
import api from '../../../utils/api';
import { playClickSound } from '../../pos/utils/sounds';

export default function DataAdjustmentProtocol() {
  const { menuItems } = usePos();
  const today = new Date().toISOString().split('T')[0];
  
  // --- States ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [records, setRecords] = useState([]);
  
  const [decreasePct, setDecreasePct] = useState('0');
  const [isDecreaseQty, setIsDecreaseQty] = useState(false);
  const [selectedBills, setSelectedBills] = useState([]);
  const [isReplaceEnabled, setIsReplaceEnabled] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    paymentMode: '--All Modes--',
    orderType: '--All Types--',
    billNo: '',
    itemName: '--Replace this item--'
  });

  const [replaceWithItem, setReplaceWithItem] = useState('--Update this item--');

  useEffect(() => {
    fetchBills();
    fetchProtocols();
  }, []);

  const fetchProtocols = async () => {
    try {
      const { data } = await api.get('/settings/store');
      setDecreasePct(data.visibilityDecrement?.toString() || '0');
      setIsDecreaseQty(data.maskQuantity || false);
      if (data.itemReplacements && data.itemReplacements.length > 0) {
        setIsReplaceEnabled(true);
        setFilters(prev => ({ ...prev, itemName: data.itemReplacements[0].originalItem }));
        setReplaceWithItem(data.itemReplacements[0].replacedWith);
      }
      // Update local storage for immediate masking effect in current session if needed
      localStorage.setItem('rms_visibility_decrement', data.visibilityDecrement || '0');
    } catch (err) {
      console.error("Failed to fetch protocols:", err);
    }
  };

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.paymentMode !== '--All Modes--') params.append('paymentMode', filters.paymentMode);
      if (filters.orderType !== '--All Types--') params.append('orderType', filters.orderType);
      if (filters.billNo) params.append('billNo', filters.billNo);
      if (filters.itemName !== '--Replace this item--') params.append('itemName', filters.itemName);

      const { data } = await api.get(`/orders/adjustment-audit?${params.toString()}`);
      setRecords(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch registry signals');
      setLoading(false);
    }
  };

  const handleApplyModify = async () => {
    try {
      setLoading(true);
      const payload = {
        visibilityDecrement: Number(decreasePct),
        maskQuantity: isDecreaseQty,
        itemReplacements: isReplaceEnabled && filters.itemName !== '--Replace this item--' && replaceWithItem !== '--Update this item--'
          ? [{ originalItem: filters.itemName, replacedWith: replaceWithItem }]
          : []
      };

      await api.put('/settings/store', payload);
      
      localStorage.setItem('rms_visibility_decrement', decreasePct);
      playClickSound();
      alert(`System Protocol Synchronized: Rules successfully committed to database.`);
      setLoading(false);
    } catch (err) {
      setError('Failed to commit protocols to database');
      setLoading(false);
    }
  };

  const toggleBillSelection = (id) => {
    setSelectedBills(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleExportSnapshot = () => {
    const headers = ["Bill ID", "Date", "Amount", "Mode", "Type", "Table", "Items"];
    const rows = records.map(bill => [
      bill.orderNumber,
      new Date(bill.completedAt).toLocaleDateString(),
      bill.totalAmount,
      bill.paymentMethod,
      bill.orderType,
      bill.table?.name || 'N/A',
      bill.kots.flatMap(k => k.items.map(i => i.name)).join(' | ')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `adjustment_protocol_snapshot_${new Date().toLocaleDateString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playClickSound();
  };

  const totalSales = records.reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <div className="h-full w-full bg-[#F4F4F7] text-slate-800 font-sans flex flex-col overflow-hidden border-2 border-slate-200 selection:bg-[#E1261C]/10">
      
      <div className="bg-white p-6 border-b border-slate-200 shadow-sm">
         <div className="grid grid-cols-4 gap-x-8 gap-y-6">
            
            {/* Column 1: Item Management */}
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Search Item</label>
                  <select 
                     value={filters.itemName}
                     onChange={(e) => setFilters({...filters, itemName: e.target.value})}
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
                  <select 
                    value={filters.paymentMode}
                    onChange={(e) => setFilters({...filters, paymentMode: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 h-9 text-[11px] font-bold uppercase rounded-md outline-none px-3"
                  >
                     <option>--All Modes--</option>
                     <option>CASH</option>
                     <option>CARD</option>
                     <option>UPI</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Bill Type</label>
                  <select 
                    value={filters.orderType}
                    onChange={(e) => setFilters({...filters, orderType: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 h-9 text-[11px] font-bold uppercase rounded-md outline-none px-3"
                  >
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
                     <input 
                        type="date" 
                        value={filters.startDate} 
                        onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                        className="flex-1 bg-white border border-slate-200 h-9 px-3 text-[10px] font-bold uppercase rounded-md outline-none focus:border-[#E1261C]/50" 
                     />
                     <input 
                        type="date" 
                        value={filters.endDate} 
                        onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                        className="flex-1 bg-white border border-slate-200 h-9 px-3 text-[10px] font-bold uppercase rounded-md outline-none focus:border-[#E1261C]/50" 
                     />
                  </div>
               </div>
               <div className="flex-1 flex flex-col justify-end">
                  <div className="flex items-center gap-3">
                     <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Bill No</label>
                        <input 
                           type="text" 
                           placeholder="####" 
                           value={filters.billNo}
                           onChange={(e) => setFilters({...filters, billNo: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 h-9 rounded-md px-3 text-[11px] font-black uppercase" 
                        />
                     </div>
                     <div className="flex gap-2 pt-5">
                        <button 
                           onClick={() => { playClickSound(); fetchBills(); }}
                           className="h-9 px-4 bg-gradient-to-br from-[#E1261C] to-[#C11F17] text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-md active:scale-95 transition-all flex items-center gap-2"
                        >
                           <Search size={14} />
                           SEARCH
                        </button>
                        <button 
                           onClick={() => { playClickSound(); setFilters({ startDate: today, endDate: today, paymentMode: '--All Modes--', orderType: '--All Types--', billNo: '', itemName: '--Replace this item--' }); }}
                           className="h-9 px-4 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-md active:scale-95 transition-all"
                        >
                           RESET
                        </button>
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-3 text-rose-600 text-[10px] font-black uppercase tracking-widest">
           <AlertCircle size={16} />
           {error}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
         
         {/* Main Table Area */}
         <div className="flex-1 overflow-hidden flex flex-col bg-white">
            <div className="bg-slate-800 px-4 py-1.5 border-b border-black/10 flex items-center justify-between">
               <span className="text-[10px] font-black text-white uppercase tracking-[0.25em]">Audit Registry — Live Feed</span>
               <div className="flex gap-3 items-center">
                  {loading && <RefreshCw size={12} className="text-white/40 animate-spin" />}
                  <div className="flex gap-1.5 items-center">
                     <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                     <span className="text-[9px] font-bold text-white/40 uppercase">{loading ? 'Syncing...' : 'Synchronized'}</span>
                  </div>
               </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-white relative">
               <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                     <tr>
                        <th className="px-3 py-4 w-10 text-center"><input type="checkbox" className="accent-[#E1261C]" /></th>
                        <th className="px-3 py-4">Bill ID</th>
                        <th className="px-3 py-4">Item Nodes</th>
                        <th className="px-3 py-4">Completed At</th>
                        <th className="px-3 py-4 text-right">Fiscal Amount</th>
                        <th className="px-3 py-4">Mode</th>
                        <th className="px-3 py-4">Service</th>
                        <th className="px-3 py-4">Cashier Node</th>
                        <th className="px-3 py-4 text-center">Table</th>
                        <th className="px-3 py-4 text-center">Units</th>
                        <th className="px-3 py-4">Protocol Year</th>
                     </tr>
                  </thead>
                  <tbody className="text-[11px]">
                     {records.map((bill, idx) => (
                        <tr 
                          key={bill._id} 
                          onClick={() => toggleBillSelection(bill._id)}
                          className={`${selectedBills.includes(bill._id) ? 'bg-[#E1261C]/5 border-l-4 border-[#E1261C]' : 'border-l-4 border-transparent'} border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-all`}
                        >
                           <td className="px-3 py-3 text-center"><input type="checkbox" checked={selectedBills.includes(bill._id)} readOnly className="accent-[#E1261C]" /></td>
                           <td className="px-3 py-3 font-black text-[#E1261C] tabular-nums">{bill.orderNumber}</td>
                           <td className="px-3 py-3 font-bold text-emerald-600 uppercase italic max-w-xs truncate">
                              {bill.kots.flatMap(k => k.items.map(i => {
                                 // Apply Item Replacement Logic
                                 if (isReplaceEnabled && filters.itemName !== '--Replace this item--' && replaceWithItem !== '--Update this item--') {
                                    if (i.name.toLowerCase() === filters.itemName.toLowerCase()) {
                                       return replaceWithItem;
                                    }
                                 }
                                 return i.name;
                              })).join(', ')}
                           </td>
                           <td className="px-3 py-3 font-bold text-slate-500">{new Date(bill.completedAt).toLocaleString()}</td>
                           <td className="px-3 py-3 text-right font-black text-slate-900">₹{maskCurrency(bill.totalAmount).toFixed(2)}</td>
                           <td className="px-3 py-3 font-bold uppercase text-slate-500">{bill.paymentMethod || 'N/A'}</td>
                           <td className="px-3 py-3 font-bold uppercase text-slate-500">{bill.orderType}</td>
                           <td className="px-3 py-3 font-bold uppercase text-slate-600">{bill.waiter?.name || 'SYSTEM'}</td>
                           <td className="px-3 py-3 text-center font-bold text-slate-500">{bill.table?.name || 'CAR'}</td>
                           <td className="px-3 py-3 text-center font-black text-slate-800">
                             {isDecreaseQty 
                               ? maskQuantity(bill.kots.reduce((s, k) => s + k.items.reduce((si, i) => si + i.quantity, 0), 0))
                               : bill.kots.reduce((s, k) => s + k.items.reduce((si, i) => si + i.quantity, 0), 0)
                             }
                           </td>
                           <td className="px-3 py-3 font-bold text-slate-400">2026-2027</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {records.length === 0 && !loading && (
                 <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                    <div className="flex flex-col items-center gap-3">
                       <HardDrive size={40} className="text-slate-200" />
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching registry records found</span>
                    </div>
                 </div>
               )}
            </div>

            {/* Table Footer Stats */}
            <div className="bg-slate-900 grid grid-cols-4 border-t border-white/10 p-1.5 gap-2">
               <div className="flex flex-col bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.15em]">Registry Count</span>
                  <span className="text-sm font-black text-white tabular-nums">{records.length}</span>
               </div>
               <div className="flex flex-col bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.15em]">Selection Audit</span>
                  <span className="text-sm font-black text-amber-500 tabular-nums">{selectedBills.length}</span>
               </div>
               <div className="flex flex-col bg-[#E1261C]/20 rounded-lg px-3 py-1.5 border border-[#E1261C]/50 relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#E1261C]" />
                  <span className="text-[8px] font-black text-[#E1261C] uppercase tracking-[0.15em]">Aggregate Fiscal</span>
                  <span className="text-sm font-black text-white tabular-nums">₹{maskCurrency(totalSales).toLocaleString()}</span>
               </div>
               <div className="flex flex-col bg-[#E1261C]/20 rounded-lg px-3 py-1.5 border border-[#E1261C]/50">
                  <span className="text-[8px] font-black text-[#E1261C] uppercase tracking-[0.15em]">Selection Total</span>
                  <span className="text-sm font-black text-white tabular-nums">
                    ₹{maskCurrency(records.filter(r => selectedBills.includes(r._id)).reduce((s, b) => s + b.totalAmount, 0)).toLocaleString()}
                  </span>
               </div>
            </div>
         </div>

         {/* Right Control Side Panel */}
         <div className="w-36 bg-white border-l border-slate-200 flex flex-col p-3 gap-5 shrink-0 relative">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#E1261C]" />
            
            <div className="flex flex-col items-center">
               <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-inner mb-2 group">
                  <Monitor size={32} className="text-slate-200 group-hover:text-[#E1261C] transition-colors" />
               </div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol Monitor</span>
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
            </div>

            <div 
               className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-[#E1261C] hover:bg-white hover:shadow-md transition-all duration-300 cursor-pointer group" 
               onClick={() => { playClickSound(); setIsDecreaseQty(!isDecreaseQty); }}
            >
               <input 
                 type="checkbox" 
                 checked={isDecreaseQty}
                 onChange={() => {}}
                 className="w-5 h-5 accent-[#E1261C] cursor-pointer" 
               />
               <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider group-hover:text-slate-900 transition-colors leading-tight">Mask Quantity</span>
            </div>

            <button 
              onClick={handleApplyModify}
              className="w-full bg-gradient-to-br from-[#E1261C] to-[#A11912] text-white py-2 px-3 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] shadow-[0_4px_10px_rgba(225,38,28,0.2)] hover:shadow-[0_8px_16px_rgba(225,38,28,0.3)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95 border-b border-black/30 flex items-center justify-center gap-2 group relative overflow-hidden"
            >
               <Save size={14} className="group-hover:rotate-12 transition-transform" />
               <span className="relative z-10">Apply Protocol</span>
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
