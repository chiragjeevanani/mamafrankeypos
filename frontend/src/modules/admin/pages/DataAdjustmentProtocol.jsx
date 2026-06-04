import React, { useState, useEffect } from 'react';
import { 
  Search, Save, X, Edit3, Trash2, 
  FileSpreadsheet, Monitor, LogOut, HardDrive, 
  ChevronDown, Calendar, Hash, CreditCard, AlertCircle, RefreshCw,
  Plus, CheckSquare, Square
} from 'lucide-react';
import { usePos } from '../../pos/context/PosContext';
import { maskQuantity, maskCurrency, getReplacedName } from '../utils/dataMask';
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
  
  // New Filter States
  const [targetOutlet, setTargetOutlet] = useState('Main Outlet (Sadar)');
  const [priceRange, setPriceRange] = useState('Price Range: Standard');

  // Multi-Replacement State
  const [itemReplacements, setItemReplacements] = useState([]);
  const [newReplacement, setNewReplacement] = useState({ originalItem: '', replacedWith: '', replacedPrice: 0 });
  
  // Filters for Searching
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    paymentMode: '--All Modes--',
    orderType: '--All Types--',
    billNo: '',
    itemName: '--Filter by item--'
  });

  useEffect(() => {
    fetchBills();
    fetchProtocols();
  }, []);

  const fetchProtocols = async () => {
    try {
      const { data } = await api.get('/settings/store');
      setDecreasePct(data.visibilityDecrement?.toString() || '0');
      setIsDecreaseQty(data.maskQuantity || false);
      setTargetOutlet(data.targetOutlet || 'Main Outlet (Sadar)');
      setPriceRange(data.protocolPriceRange || 'Price Range: Standard');
      setItemReplacements(data.itemReplacements || []);
      
      // Sync local storage
      localStorage.setItem('rms_visibility_decrement', data.visibilityDecrement || '0');
      localStorage.setItem('rms_item_replacements', JSON.stringify(data.itemReplacements || []));
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
      if (filters.itemName !== '--Filter by item--') params.append('itemName', filters.itemName);
      
      // Real filtering from backend
      params.append('outlet', targetOutlet);
      params.append('priceRange', priceRange);

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
        targetOutlet,
        protocolPriceRange: priceRange,
        itemReplacements
      };

      await api.put('/settings/store', payload);
      
      localStorage.setItem('rms_visibility_decrement', decreasePct);
      localStorage.setItem('rms_item_replacements', JSON.stringify(itemReplacements));
      
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

  const toggleSelectAll = () => {
    if (selectedBills.length === records.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(records.map(r => r._id));
    }
  };

  const handleExportSnapshot = () => {
    const headers = ["Bill ID", "Date", "Original Amount", "Masked Amount", "Mode", "Type", "Items"];
    const rows = records.map(bill => {
       const maskedTotal = calculateMaskedTotal(bill);
       return [
        bill.orderNumber,
        new Date(bill.completedAt).toLocaleDateString(),
        bill.totalAmount,
        maskedTotal,
        bill.paymentMethod,
        bill.orderType,
        bill.kots.flatMap(k => k.items.map(i => getReplacedName(i.name))).join(' | ')
      ];
    });

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

  const addReplacementRule = () => {
    if (!newReplacement.originalItem || !newReplacement.replacedWith) return;
    setItemReplacements([...itemReplacements, { ...newReplacement }]);
    setNewReplacement({ originalItem: '', replacedWith: '', replacedPrice: 0 });
    playClickSound();
  };

  const removeReplacementRule = (idx) => {
    setItemReplacements(itemReplacements.filter((_, i) => i !== idx));
    playClickSound();
  };

  const calculateMaskedTotal = (bill) => {
     let total = 0;
     bill.kots.forEach(kot => {
        kot.items.forEach(item => {
           if (item.status !== 'cancelled') {
              total += maskCurrency(item.price, item.name) * item.quantity;
           }
        });
     });
     // If we have global taxes in the bill, we might need to adjust them too, 
     // but for "manipulation", usually we just mask the final total.
     // To be safe, if the item overrides didn't catch anything, we apply global mask to the bill's total.
     if (total === 0 || total === bill.subtotal) {
        return maskCurrency(bill.totalAmount);
     }
     return total;
  };

  const aggregateTotal = records.reduce((sum, r) => sum + calculateMaskedTotal(r), 0);

  return (
    <div className="h-full w-full bg-[#F4F4F7] text-slate-800 font-sans flex flex-col overflow-hidden border-2 border-slate-200 selection:bg-[#E1261C]/10">
      
      <div className="bg-white p-6 border-b border-slate-200 shadow-sm">
         <div className="grid grid-cols-4 gap-x-8 gap-y-6">
            
            {/* Column 1: Filter Logic */}
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Target Outlet</label>
                  <select 
                    value={targetOutlet}
                    onChange={(e) => setTargetOutlet(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 h-9 text-[11px] font-bold uppercase rounded-md outline-none px-3"
                  >
                     <option>Main Outlet (Sadar)</option>
                     <option>Station Branch</option>
                     <option>City Center</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Protocol Price Range</label>
                  <select 
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100 h-9 text-[11px] font-black uppercase tracking-widest rounded-md outline-none px-3"
                  >
                     <option>Price Range: Standard</option>
                     <option>Price Range: Premium</option>
                     <option>Price Range: Economy</option>
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
                     <option>CAR SERVICE</option>
                  </select>
               </div>
            </div>

            {/* Column 3: Item Search */}
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Filter by Item</label>
                  <select 
                     value={filters.itemName}
                     onChange={(e) => setFilters({...filters, itemName: e.target.value})}
                     className="w-full bg-slate-50 border border-slate-200 h-9 text-[11px] font-bold uppercase rounded-md outline-none px-3 focus:ring-2 focus:ring-[#E1261C]/10 focus:border-[#E1261C]/50 transition-all"
                  >
                     <option>--Filter by item--</option>
                     {menuItems.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Bill No Search</label>
                  <input 
                     type="text" 
                     placeholder="####" 
                     value={filters.billNo}
                     onChange={(e) => setFilters({...filters, billNo: e.target.value})}
                     className="w-full bg-slate-50 border border-slate-200 h-9 rounded-md px-3 text-[11px] font-black uppercase" 
                  />
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
                     <div className="flex gap-2 pt-1 w-full">
                        <button 
                           onClick={() => { playClickSound(); fetchBills(); }}
                           className="flex-1 h-9 bg-gradient-to-br from-[#E1261C] to-[#C11F17] text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                           <Search size={14} />
                           SEARCH
                        </button>
                        <button 
                           onClick={() => { playClickSound(); setFilters({ startDate: today, endDate: today, paymentMode: '--All Modes--', orderType: '--All Types--', billNo: '', itemName: '--Filter by item--' }); }}
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
                        <th className="px-3 py-4 w-10 text-center cursor-pointer" onClick={toggleSelectAll}>
                           {selectedBills.length === records.length && records.length > 0 ? <CheckSquare size={16} className="text-[#E1261C] mx-auto" /> : <Square size={16} className="mx-auto" />}
                        </th>
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
                     {records.map((bill, idx) => {
                        const maskedTotal = calculateMaskedTotal(bill);
                        return (
                        <tr 
                          key={bill._id} 
                          onClick={() => toggleBillSelection(bill._id)}
                          className={`${selectedBills.includes(bill._id) ? 'bg-[#E1261C]/5 border-l-4 border-[#E1261C]' : 'border-l-4 border-transparent'} border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-all`}
                        >
                           <td className="px-3 py-3 text-center"><input type="checkbox" checked={selectedBills.includes(bill._id)} readOnly className="accent-[#E1261C]" /></td>
                           <td className="px-3 py-3 font-black text-[#E1261C] tabular-nums">{bill.orderNumber}</td>
                           <td className="px-3 py-3 font-bold text-emerald-600 uppercase italic max-w-xs truncate">
                              {bill.kots.flatMap(k => k.items.map(i => getReplacedName(i.name))).join(', ')}
                           </td>
                           <td className="px-3 py-3 font-bold text-slate-500">{new Date(bill.completedAt).toLocaleString()}</td>
                           <td className="px-3 py-3 text-right font-black text-slate-900">₹{maskedTotal.toFixed(2)}</td>
                           <td className="px-3 py-3 font-bold uppercase text-slate-500">{bill.paymentMethod || 'N/A'}</td>
                           <td className="px-3 py-3 font-bold uppercase text-slate-500">{bill.orderType}</td>
                           <td className="px-3 py-3 font-bold uppercase text-slate-600">{bill.waiter?.name || 'SYSTEM'}</td>
                           <td className="px-3 py-3 text-center font-bold text-slate-500">
                              {bill.orderType === 'PICKUP' ? 'PICKUP' : (bill.table?.name || bill.carNumber || 'CAR')}
                            </td>
                           <td className="px-3 py-3 text-center font-black text-slate-800">
                             {isDecreaseQty 
                               ? maskQuantity(bill.kots.reduce((s, k) => s + k.items.reduce((si, i) => si + i.quantity, 0), 0))
                               : bill.kots.reduce((s, k) => s + k.items.reduce((si, i) => si + i.quantity, 0), 0)
                             }
                           </td>
                           <td className="px-3 py-3 font-bold text-slate-400">2026-2027</td>
                        </tr>
                     )})}
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
                  <span className="text-[8px] font-black text-rose-300 uppercase tracking-[0.15em]">Aggregate Fiscal</span>
                  <span className="text-sm font-black text-white tabular-nums" style={{ fontFamily: "system-ui, sans-serif" }}>₹{aggregateTotal.toLocaleString()}</span>
               </div>
               <div className="flex flex-col bg-[#E1261C]/20 rounded-lg px-3 py-1.5 border border-[#E1261C]/50">
                  <span className="text-[8px] font-black text-rose-300 uppercase tracking-[0.15em]">Selection Total</span>
                  <span className="text-sm font-black text-white tabular-nums" style={{ fontFamily: "system-ui, sans-serif" }}>
                    ₹{records.filter(r => selectedBills.includes(r._id)).reduce((s, b) => s + calculateMaskedTotal(b), 0).toLocaleString()}
                  </span>
               </div>
            </div>
         </div>

         {/* Right Control Side Panel */}
         <div className="w-80 bg-white border-l border-slate-200 flex flex-col p-4 gap-6 shrink-0 relative overflow-y-auto no-scrollbar">
            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#E1261C]" />
            
            <div className="flex flex-col items-center">
               <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shadow-inner mb-2 group">
                  <Monitor size={24} className="text-slate-300 group-hover:text-[#E1261C] transition-colors" />
               </div>
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Protocol Master Node</span>
            </div>

            {/* Global Switches */}
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                     <Hash size={12} className="text-[#E1261C]" />
                     Global Mask Decrement (%)
                  </label>
                  <input 
                     type="number" 
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
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider group-hover:text-slate-900 transition-colors leading-tight">Apply Quantity Masking</span>
               </div>
            </div>

            {/* Targeted Replacement Manager */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
               <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-slate-900 tracking-[0.15em]">Surgical Replacements</label>
                  <div className="px-2 py-0.5 bg-[#E1261C] text-white text-[8px] font-black rounded-full uppercase">{itemReplacements.length} Rules</div>
               </div>

               {/* Add New Rule */}
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                  <div className="space-y-1">
                     <label className="text-[8px] font-black text-slate-400 uppercase">Target Item</label>
                     <select 
                        value={newReplacement.originalItem}
                        onChange={(e) => setNewReplacement({...newReplacement, originalItem: e.target.value})}
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-[10px] font-bold uppercase outline-none"
                     >
                        <option value="">--Select Item--</option>
                        {menuItems.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[8px] font-black text-slate-400 uppercase">Replace With Name</label>
                     <input 
                        type="text" 
                        placeholder="NEW NAME"
                        value={newReplacement.replacedWith}
                        onChange={(e) => setNewReplacement({...newReplacement, replacedWith: e.target.value})}
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-[10px] font-bold uppercase outline-none"
                     />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[8px] font-black text-slate-400 uppercase">Protocol Price (Targeted)</label>
                     <input 
                        type="number" 
                        placeholder="0.00"
                        value={newReplacement.replacedPrice}
                        onChange={(e) => setNewReplacement({...newReplacement, replacedPrice: Number(e.target.value)})}
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-[10px] font-bold outline-none"
                     />
                  </div>
                  <button 
                     onClick={addReplacementRule}
                     className="w-full h-8 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded shadow-md hover:bg-[#E1261C] transition-all flex items-center justify-center gap-2"
                  >
                     <Plus size={12} />
                     Commit Rule
                  </button>
               </div>

               {/* Active Rules List */}
               <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                  {itemReplacements.map((rule, i) => (
                     <div key={i} className="bg-white border border-slate-100 rounded-lg p-2.5 flex items-center justify-between group hover:border-[#E1261C] transition-all relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 group-hover:bg-[#E1261C]" />
                        <div className="flex flex-col gap-0.5">
                           <span className="text-[9px] font-black text-slate-800 uppercase truncate max-w-[120px]">{rule.originalItem}</span>
                           <div className="flex items-center gap-1">
                              <span className="text-[8px] font-bold text-slate-400 uppercase">➜ {rule.replacedWith}</span>
                              <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1 rounded">₹{rule.replacedPrice}</span>
                           </div>
                        </div>
                        <button 
                           onClick={() => removeReplacementRule(i)}
                           className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                           <Trash2 size={14} />
                        </button>
                     </div>
                  ))}
                  {itemReplacements.length === 0 && (
                     <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">No Active Rules</span>
                     </div>
                  )}
               </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-3">
               <button 
                 onClick={handleApplyModify}
                 className="w-full bg-gradient-to-br from-[#E1261C] to-[#A11912] text-white py-3 px-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_4px_15px_rgba(225,38,28,0.3)] hover:shadow-[0_8px_20px_rgba(225,38,28,0.4)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95 border-b border-black/30 flex items-center justify-center gap-2 group relative overflow-hidden"
               >
                  <Save size={16} className="group-hover:rotate-12 transition-transform" />
                  <span className="relative z-10">Synchronize Registry</span>
               </button>

               <button 
                  onClick={handleExportSnapshot}
                  className="w-full h-11 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white transition-all shadow-sm group"
               >
                  <FileSpreadsheet size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Download Snapshot</span>
               </button>
            </div>
         </div>
      </div>

    </div>
  );
}
