import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Save, X, Edit3, Trash2, 
  FileSpreadsheet, Monitor, LogOut, HardDrive, 
  ChevronDown, ChevronUp, Calendar, Hash, CreditCard, AlertCircle, RefreshCw,
  Plus, CheckSquare, Square, Eye, Download, CheckCircle
} from 'lucide-react';
import { usePos } from '../../pos/context/PosContext';
import { getReplacedName } from '../utils/dataMask';
import api from '../../../utils/api';
import { playClickSound } from '../../pos/utils/sounds';
import { printBillReceipt } from '../../pos/utils/printBill';

function SearchableSelect({ label, value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative space-y-1">
      <label className="text-[8px] font-black text-slate-400 uppercase">{label}</label>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setSearch('');
            setIsOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsOpen(false);
              setSearch(value || '');
            }, 200);
          }}
          className="w-full h-8 bg-white border border-slate-200 rounded px-2 pr-8 text-[10px] font-bold uppercase outline-none focus:border-[#E1261C]"
        />
        <ChevronDown size={14} className="absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto py-1 text-[10px] font-bold uppercase">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onMouseDown={() => {
                  onChange(option);
                  setSearch(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${value === option ? 'text-[#E1261C] bg-[#E1261C]/5' : 'text-slate-700'}`}
              >
                {option}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-slate-400 italic">No items found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DataAdjustmentProtocol() {
  const { menuItems, sections = [] } = usePos();
  const today = new Date().toISOString().split('T')[0];

  const isStandardDineInSection = (sec) => {
    const type = (sec.type || '').toUpperCase();
    if (type === 'PICKUP' || type === 'CAR-SERVICE') return false;

    const name = (sec.name || sec.label || sec.id || '').toLowerCase();
    if (name.includes('pickup') || name.includes('pick-up') || name.includes('takeaway') || name.includes('take-away')) {
      return false;
    }
    if (name.includes('car-service') || name.includes('car') || name.includes('drive-thru') || name.includes('drive-through')) {
      return false;
    }
    return true;
  };

  const dineInSections = sections.filter(isStandardDineInSection);
  
  // --- States ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [records, setRecords] = useState([]);
  
  const [decreasePct, setDecreasePct] = useState('0');
  const [selectedBills, setSelectedBills] = useState([]);
  const [viewingBill, setViewingBill] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    playClickSound();
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const calculateMaskedTotal = (bill) => bill?.totalAmount || 0;

  const getBillQty = (bill) => {
    if (!bill || !bill.kots) return 0;
    return bill.kots.reduce((s, k) => {
      if (!k || !k.items) return s;
      return s + k.items.reduce((si, i) => si + (i.quantity || 0), 0);
    }, 0);
  };

  const sortedRecords = useMemo(() => {
    if (!sortField) return records;
    return [...records].sort((a, b) => {
      let valA, valB;
      if (sortField === 'billId') {
        valA = a.orderNumber || '';
        valB = b.orderNumber || '';
      } else if (sortField === 'completedAt') {
        valA = new Date(a.completedAt).getTime();
        valB = new Date(b.completedAt).getTime();
      } else if (sortField === 'amount') {
        valA = calculateMaskedTotal(a);
        valB = calculateMaskedTotal(b);
      } else if (sortField === 'qty') {
        valA = getBillQty(a);
        valB = getBillQty(b);
      }

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [records, sortField, sortDirection]);
  
  // New Filter States (targetOutlet removed)
  const [priceRange, setPriceRange] = useState('Price Range: Standard');

  // Multi-Replacement State
  const [itemReplacements, setItemReplacements] = useState([]);
  const [newReplacement, setNewReplacement] = useState({ originalItem: '', replacedWith: '', replacedPrice: 0 });
  
  // Filters for Searching
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    paymentMode: '--All Payment Modes--',
    orderType: '--All Types--',
    billNo: '',
    itemName: '--Filter by item--'
  });

  useEffect(() => {
    fetchBills();
    fetchProtocols();
  }, []);

  useEffect(() => {
    const handleCommit = () => {
      const token = localStorage.getItem('admin_access') || localStorage.getItem('pos_access');
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      fetch(`${baseURL}/settings/store/commit-adjustments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Module': 'admin'
        },
        keepalive: true
      }).catch(err => console.error("Auto-commit failed:", err));
    };

    window.addEventListener('beforeunload', handleCommit);

    return () => {
      window.removeEventListener('beforeunload', handleCommit);
      // Auto-commit on component unmount (internal navigation)
      handleCommit();
    };
  }, []);

  const fetchProtocols = async () => {
    try {
      const { data } = await api.get('/settings/store');
      setStoreInfo(data);
      setDecreasePct(data.visibilityDecrement?.toString() || '0');
      setPriceRange(data.protocolPriceRange || 'Price Range: Standard');
      setItemReplacements(data.itemReplacements || []);
      setSelectedBills(data.adjustedOrderIds || []);
      
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
      if (filters.paymentMode !== '--All Payment Modes--') params.append('paymentMode', filters.paymentMode);
      if (filters.orderType !== '--All Types--') params.append('orderType', filters.orderType);
      if (filters.billNo) params.append('billNo', filters.billNo);
      if (filters.itemName !== '--Filter by item--') params.append('itemName', filters.itemName);
      
      params.append('priceRange', priceRange);

      const { data } = await api.get(`/orders/adjustment-audit?${params.toString()}`);
      setRecords(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch bills log');
      setLoading(false);
    }
  };

  const handleApplyModify = async () => {
    const pct = Number(decreasePct);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      setError('Reduction % must be between 0 and 100.');
      return;
    }
    if (selectedBills.length === 0) {
      setError('Please select the bill');
      return;
    }
    let timer;
    try {
      setLoading(true);
      setError('');
      setShowProgress(true);
      setSyncProgress(10);
      
      timer = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(timer);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const payload = {
        visibilityDecrement: pct,
        maskQuantity: true,
        protocolPriceRange: priceRange,
        itemReplacements,
        adjustedOrderIds: selectedBills
      };

      await api.put('/settings/store', payload);
      
      localStorage.setItem('rms_visibility_decrement', decreasePct);
      localStorage.setItem('rms_item_replacements', JSON.stringify(itemReplacements));
      
      await fetchBills();
      
      clearInterval(timer);
      setSyncProgress(100);
      
      playClickSound();
      setSaveSuccess('Reduction settings saved successfully.');
      setTimeout(() => setSaveSuccess(''), 3000);
      
      setTimeout(() => {
        setLoading(false);
        setShowProgress(false);
        setSyncProgress(0);
      }, 500);
    } catch (err) {
      if (timer) clearInterval(timer);
      setError('Failed to save settings');
      setLoading(false);
      setShowProgress(false);
      setSyncProgress(0);
    }
  };

  const getMaskedBillingDetails = (bill) => {
    if (!bill) return null;

    let appliedTaxes = (bill.taxes || []).map(t => ({
      ...t,
      rate: t.rate || t.percentage
    }));

    // Dynamic CGST & SGST fallback reverse calculation matching POS logic
    if (appliedTaxes.length === 0 && storeInfo?.taxes) {
      const activeTaxes = storeInfo.taxes.filter(t => t.active);
      if (activeTaxes.length > 0) {
        const totalTaxRate = activeTaxes.reduce((sum, t) => sum + (t.percentage || 0), 0);
        const discountAmt = bill.discount?.amount || 0;
        const taxableAmount = Math.max(0, bill.subtotal - discountAmt);
        appliedTaxes = activeTaxes.map(t => ({
          name: t.name,
          rate: t.percentage,
          amount: Number((taxableAmount * (t.percentage / 100)).toFixed(2))
        }));
      }
    }

    const discountAmt = bill.discount?.amount || 0;
    const taxSum = appliedTaxes.reduce((sum, t) => sum + (t.amount || 0), 0);
    const total = bill.totalAmount;

    let subTotal = bill.subtotal;
    const isExclusive = subTotal > 0 && Math.abs(subTotal + taxSum - total) < 2.0;
    if (isExclusive) {
      subTotal += taxSum;
      if (Math.abs(subTotal - total) < 1.0 && discountAmt > 0) {
        subTotal += discountAmt;
      }
    }

    return {
      subTotal,
      tax: taxSum,
      discount: discountAmt,
      total: total,
      orderType: bill.orderType === 'DINE-IN' ? 'DINE IN' : (bill.orderType || 'DINE IN'),
      appliedTaxes,
      storeInfo: storeInfo,
      billerName: bill.waiter?.name || 'Cashier',
      orderNumber: bill.orderNumber
    };
  };

  const handleDownloadBill = (bill) => {
    if (!bill) return;
    playClickSound();
    const details = getMaskedBillingDetails(bill);
    printBillReceipt(
      bill,
      { name: bill.table?.name || bill.carNumber || bill.orderType || 'Order' },
      details
    );
  };

  const toggleBillSelection = (id) => {
    setSelectedBills(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBills.length === sortedRecords.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(sortedRecords.map(r => r._id));
    }
  };

  const handleExportSnapshot = () => {
    const headers = ["Bill ID", "Date", "Amount", "Mode", "Type", "Items"];
    
    const formatDateForCSV = (dateStr) => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `'${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const rows = sortedRecords.map(bill => {
       const maskedTotal = calculateMaskedTotal(bill);
       return [
        bill.orderNumber,
        formatDateForCSV(bill.completedAt),
        maskedTotal,
        bill.paymentMethod,
        bill.orderType,
        bill.kots.flatMap(k => k.items.map(i => getReplacedName(i.name))).join(' | ')
      ];
    });

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvContent = "\uFEFF" + [
      headers.map(escapeCSV).join(","), 
      ...rows.map(r => r.map(escapeCSV).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `adjustment_protocol_snapshot_${new Date().toLocaleDateString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    playClickSound();
  };

  const addReplacementRule = async () => {
    if (!newReplacement.originalItem || !newReplacement.replacedWith) return;
    const updated = [...itemReplacements, { ...newReplacement }];
    setItemReplacements(updated);
    setNewReplacement({ originalItem: '', replacedWith: '', replacedPrice: 0 });
    playClickSound();

    // Instant save rule to DB
    try {
      setLoading(true);
      setError('');
      const payload = {
        visibilityDecrement: Number(decreasePct),
        maskQuantity: true,
        protocolPriceRange: priceRange,
        itemReplacements: updated
      };
      await api.put('/settings/store', payload);
      localStorage.setItem('rms_item_replacements', JSON.stringify(updated));
      setSaveSuccess('Substitutions updated permanently.');
      setTimeout(() => setSaveSuccess(''), 3000);
      await fetchBills();
    } catch (err) {
      setError('Failed to update substitutions permanently');
    } finally {
      setLoading(false);
    }
  };

  const removeReplacementRule = async (idx) => {
    const updated = itemReplacements.filter((_, i) => i !== idx);
    setItemReplacements(updated);
    playClickSound();

    // Instant save rule deletion to DB
    try {
      setLoading(true);
      setError('');
      const payload = {
        visibilityDecrement: Number(decreasePct),
        maskQuantity: true,
        protocolPriceRange: priceRange,
        itemReplacements: updated
      };
      await api.put('/settings/store', payload);
      localStorage.setItem('rms_item_replacements', JSON.stringify(updated));
      setSaveSuccess('Substitutions updated permanently.');
      setTimeout(() => setSaveSuccess(''), 3000);
      await fetchBills();
    } catch (err) {
      setError('Failed to update substitutions permanently');
    } finally {
      setLoading(false);
    }
  };

  const aggregateTotal = sortedRecords.reduce((sum, r) => sum + calculateMaskedTotal(r), 0);

  return (
    <div className="h-full w-full bg-[#F4F4F7] text-slate-800 font-sans flex flex-col overflow-hidden border-2 border-slate-200 selection:bg-[#E1261C]/10">
      
      <div className="bg-white p-6 border-b border-slate-200 shadow-sm">
         <div className="grid grid-cols-4 gap-x-8 gap-y-6">
            
            {/* Column 1: Bill Value & Order Channel */}
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Filter by Bill Value</label>
                  <select 
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 h-9 text-[11px] font-bold uppercase rounded-md outline-none px-3 focus:ring-2 focus:ring-[#E1261C]/10 focus:border-[#E1261C]/50 focus:bg-white transition-all shadow-sm cursor-pointer"
                  >
                     <option value="Price Range: Standard">All Bills</option>
                     <option value="Price Range: Premium">High Value (&gt; ₹1000)</option>
                     <option value="Price Range: Economy">Low Value (&lt; ₹300)</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Order Channel</label>
                    <select 
                      value={filters.orderType}
                      onChange={(e) => setFilters({...filters, orderType: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 h-9 text-[11px] font-bold uppercase rounded-md outline-none px-3 focus:ring-2 focus:ring-[#E1261C]/10 focus:border-[#E1261C]/50 focus:bg-white transition-all shadow-sm cursor-pointer"
                    >
                       <option value="--All Types--">--All Channels--</option>
                       <option value="DINE-IN">DINE-IN</option>
                       {dineInSections.map(sec => (
                         <option key={sec.id || sec._id} value={sec._id}>DINE-IN ({sec.label || sec.name})</option>
                       ))}
                       <option value="PICKUP">PICKUP</option>
                       <option value="CAR-SERVICE">CAR-SERVICE</option>
                    </select>
                 </div>
            </div>

            {/* Column 2: Payment Mode & Filter by Item */}
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Payment Mode</label>
                  <select 
                    value={filters.paymentMode}
                    onChange={(e) => setFilters({...filters, paymentMode: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 h-9 text-[11px] font-bold uppercase rounded-md outline-none px-3 focus:ring-2 focus:ring-[#E1261C]/10 focus:border-[#E1261C]/50 focus:bg-white transition-all shadow-sm cursor-pointer"
                  >
                     <option value="--All Payment Modes--">--All Payment Modes--</option>
                     <option value="CASH">CASH</option>
                     <option value="CASHLESS">CASHLESS</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                  <SearchableSelect
                     label="Filter by Item"
                     placeholder="--Filter by item--"
                     value={filters.itemName === '--Filter by item--' ? '' : filters.itemName}
                     onChange={(val) => setFilters({...filters, itemName: val || '--Filter by item--'})}
                     options={['--Filter by item--', ...menuItems.map(item => item.name)]}
                  />
               </div>
            </div>

            {/* Column 3: Bill No & Date Range */}
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Bill No Search</label>
                  <input 
                     type="text" 
                     placeholder="####" 
                     value={filters.billNo}
                     onChange={(e) => setFilters({...filters, billNo: e.target.value})}
                     className="w-full bg-slate-50 border border-slate-200 h-9 rounded-md px-3 text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-[#E1261C]/10 focus:border-[#E1261C]/50 focus:bg-white transition-all shadow-sm" 
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Date Range</label>
                  <div className="flex gap-2">
                     <input 
                        type="date" 
                        value={filters.startDate} 
                        max={today}
                        onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                        className="flex-1 bg-slate-50 border border-slate-200 h-9 px-3 text-[10px] font-bold uppercase rounded-md outline-none focus:ring-2 focus:ring-[#E1261C]/10 focus:border-[#E1261C]/50 focus:bg-white transition-all shadow-sm cursor-pointer" 
                     />
                     <input 
                        type="date" 
                        value={filters.endDate} 
                        min={filters.startDate}
                        max={today}
                        onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                        className="flex-1 bg-slate-50 border border-slate-200 h-9 px-3 text-[10px] font-bold uppercase rounded-md outline-none focus:ring-2 focus:ring-[#E1261C]/10 focus:border-[#E1261C]/50 focus:bg-white transition-all shadow-sm cursor-pointer" 
                     />
                  </div>
               </div>
            </div>

            {/* Column 4: Date & Actions */}
            <div className="space-y-4 flex flex-col pl-8 border-l border-slate-100">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-transparent select-none tracking-wider pointer-events-none">Search Action</label>
                  <button 
                     onClick={() => { playClickSound(); fetchBills(); }}
                     className="w-full h-9 bg-gradient-to-br from-[#E1261C] to-[#C11F17] hover:from-[#f03228] hover:to-[#d1241b] text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
                  >
                     <Search size={14} />
                     SEARCH
                  </button>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-transparent select-none tracking-wider pointer-events-none">Reset Action</label>
                  <button 
                     onClick={() => { playClickSound(); setFilters({ startDate: today, endDate: today, paymentMode: '--All Payment Modes--', orderType: '--All Types--', billNo: '', itemName: '--Filter by item--' }); }}
                     className="w-full h-9 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-md active:scale-95 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                     RESET
                  </button>
               </div>
            </div>

         </div>
      </div>

      {saveSuccess && (
        <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-3 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
           <CheckCircle size={16} />
           {saveSuccess}
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-3 text-rose-600 text-[10px] font-black uppercase tracking-widest">
           <AlertCircle size={16} />
           {error}
        </div>
      )}

      {showProgress && (
         <div className="mx-6 mt-4 p-4 bg-white border border-slate-100 rounded-lg shadow-sm space-y-2">
           <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-wider">
             <span>Synchronizing adjustments registry...</span>
             <span className="tabular-nums text-[#E1261C]">{syncProgress}%</span>
           </div>
           <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
             <div 
               className="bg-gradient-to-r from-[#E1261C] to-[#ff4b40] h-full transition-all duration-200 ease-out"
               style={{ width: `${syncProgress}%` }}
             />
           </div>
         </div>
       )}

      <div className="flex-1 flex overflow-hidden">
         
         {/* Main Table Area */}
         <div className="flex-1 overflow-hidden flex flex-col bg-white">
            <div className="bg-slate-800 px-4 py-1.5 border-b border-black/10 flex items-center justify-between">
               <span className="text-[10px] font-black text-white uppercase tracking-[0.25em]">Adjusted Bills Log</span>
               <div className="flex gap-3 items-center">
                  {loading && <RefreshCw size={12} className="text-white/40 animate-spin" />}
                  <div className="flex gap-1.5 items-center">
                     <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                     <span className="text-[9px] font-bold text-white/40 uppercase">{loading ? 'Updating...' : 'Settings Active'}</span>
                  </div>
               </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-white relative">
               {loading && (
                 <div className="sticky top-0 z-20 h-0.5 w-full bg-[#E1261C]/10 overflow-hidden">
                   <div className="h-full bg-[#E1261C] animate-pulse w-full" />
                 </div>
               )}
               <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                     <tr>
                        <th className="px-3 py-4 w-10 text-center cursor-pointer" onClick={toggleSelectAll}>
                           {selectedBills.length === sortedRecords.length && sortedRecords.length > 0 ? <CheckSquare size={16} className="text-[#E1261C] mx-auto" /> : <Square size={16} className="mx-auto" />}
                        </th>
                        <th className="px-3 py-4 cursor-pointer select-none hover:bg-slate-100 hover:text-slate-700 transition-colors" onClick={() => handleSort('billId')}>
                          <div className="flex items-center gap-1">
                            Bill ID
                            {sortField === 'billId' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                          </div>
                        </th>
                        <th className="px-3 py-4">Items</th>
                        <th className="px-3 py-4 cursor-pointer select-none hover:bg-slate-100 hover:text-slate-700 transition-colors" onClick={() => handleSort('completedAt')}>
                          <div className="flex items-center gap-1">
                            Completed At
                            {sortField === 'completedAt' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                          </div>
                        </th>
                        <th className="px-3 py-4 text-right cursor-pointer select-none hover:bg-slate-100 hover:text-slate-700 transition-colors" onClick={() => handleSort('amount')}>
                          <div className="flex justify-end items-center gap-1">
                            Bill Amount
                            {sortField === 'amount' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                          </div>
                        </th>
                        <th className="px-3 py-4">Payment Mode</th>
                        <th className="px-3 py-4">Type</th>
                        <th className="px-3 py-4">Cashier</th>
                        <th className="px-3 py-4 text-center">Table</th>
                        <th className="px-3 py-4 text-center cursor-pointer select-none hover:bg-slate-100 hover:text-slate-700 transition-colors" onClick={() => handleSort('qty')}>
                          <div className="flex justify-center items-center gap-1">
                            Qty
                            {sortField === 'qty' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                          </div>
                        </th>
                        <th className="px-3 py-4">Financial Year</th>
                        <th className="px-3 py-4 text-center">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="text-[11px]">
                     {sortedRecords.map((bill, idx) => {
                        const maskedTotal = calculateMaskedTotal(bill);
                        return (
                        <tr 
                          key={bill._id} 
                          onClick={() => { playClickSound(); setViewingBill(bill); }}
                          className={`${selectedBills.includes(bill._id) ? 'bg-[#E1261C]/5 border-l-4 border-[#E1261C]' : 'border-l-4 border-transparent'} border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-all`}
                        >
                           <td className="px-3 py-3 text-center" onClick={(e) => { e.stopPropagation(); toggleBillSelection(bill._id); }}>
                             <input type="checkbox" checked={selectedBills.includes(bill._id)} onChange={() => {}} className="accent-[#E1261C] cursor-pointer" />
                           </td>
                           <td className="px-3 py-3 font-black text-[#E1261C] tabular-nums">{bill.orderNumber}</td>
                           <td className="px-3 py-3 font-bold text-emerald-600 uppercase italic max-w-xs truncate">
                              {bill.kots.flatMap(k => k.items.map(i => getReplacedName(i.name))).join(', ')}
                           </td>
                           <td className="px-3 py-3 font-bold text-slate-500">{new Date(bill.completedAt).toLocaleString()}</td>
                           <td className="px-3 py-3 text-right font-black text-slate-900">₹{maskedTotal.toFixed(2)}</td>
                            <td className="px-3 py-3 font-bold uppercase text-slate-500">
                              {bill.paymentMethod === 'CASHLESS' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                  CASHLESS
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                                  CASH
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 font-bold uppercase text-slate-500">
                              {(() => {
                                const type = bill.orderType?.toUpperCase();
                                let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                                if (type === 'DINE-IN') badgeStyle = 'bg-blue-50 text-blue-700 border-blue-100';
                                if (type === 'PICKUP') badgeStyle = 'bg-purple-50 text-purple-700 border-purple-100';
                                if (type === 'CAR-SERVICE') badgeStyle = 'bg-amber-50 text-amber-700 border-amber-100';
                                return (
                                  <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black tracking-wider border ${badgeStyle}`}>
                                    {type}
                                  </span>
                                );
                              })()}
                            </td>
                           <td className="px-3 py-3 font-bold uppercase text-slate-600">{bill.waiter?.name || 'SYSTEM'}</td>
                           <td className="px-3 py-3 text-center font-bold text-slate-500">
                              {bill.orderType === 'PICKUP' ? 'PICKUP' : (bill.table?.name || bill.carNumber || 'CAR')}
                            </td>
                           <td className="px-3 py-3 text-center font-black text-slate-800">
                              {bill.kots.reduce((s, k) => s + k.items.reduce((si, i) => si + i.quantity, 0), 0)}
                           </td>
                           <td className="px-3 py-3 font-bold text-slate-400">
                              {(() => {
                                const d = new Date(bill.completedAt);
                                const y = d.getFullYear();
                                const fiscalStart = d.getMonth() >= 3 ? y : y - 1;
                                return `${fiscalStart}-${(fiscalStart + 1).toString().slice(-2)}`;
                              })()}
                           </td>
                           <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-2">
                                 <button onClick={() => { playClickSound(); setViewingBill(bill); }} className="p-1 hover:text-[#E1261C] text-slate-400 transition-colors" title="View Receipt"><Eye size={16} /></button>
                                 <button onClick={() => handleDownloadBill(bill)} className="p-1 hover:text-emerald-600 text-slate-400 transition-colors" title="Download PDF Receipt"><Download size={16} /></button>
                              </div>
                           </td>
                        </tr>
                     )})}
                  </tbody>
               </table>
               {sortedRecords.length === 0 && !loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                     <div className="flex flex-col items-center gap-3">
                        <HardDrive size={40} className="text-slate-200" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching bills found</span>
                     </div>
                  </div>
               )}
               {sortedRecords.length === 0 && loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                     <div className="flex flex-col items-center gap-3">
                        <RefreshCw size={36} className="text-[#E1261C] animate-spin" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading secure bills...</span>
                     </div>
                  </div>
               )}
            </div>

            {/* Table Footer Stats */}
            <div className="bg-slate-900 grid grid-cols-4 border-t border-white/10 p-1.5 gap-2">
               <div className="flex flex-col bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.15em]">Total Bills</span>
                  <span className="text-sm font-black text-white tabular-nums">{sortedRecords.length}</span>
               </div>
               <div className="flex flex-col bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.15em]">Selected Bills</span>
                  <span className="text-sm font-black text-amber-500 tabular-nums">{selectedBills.length}</span>
               </div>
               <div className="flex flex-col bg-[#E1261C]/20 rounded-lg px-3 py-1.5 border border-[#E1261C]/50 relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#E1261C]" />
                  <span className="text-[8px] font-black text-rose-300 uppercase tracking-[0.15em]">Total Adjusted Sales</span>
                  <span className="text-sm font-black text-white tabular-nums" style={{ fontFamily: "system-ui, sans-serif" }}>₹{aggregateTotal.toLocaleString()}</span>
               </div>
               <div className="flex flex-col bg-[#E1261C]/20 rounded-lg px-3 py-1.5 border border-[#E1261C]/50">
                  <span className="text-[8px] font-black text-rose-300 uppercase tracking-[0.15em]">Selected Adjusted Total</span>
                  <span className="text-sm font-black text-white tabular-nums" style={{ fontFamily: "system-ui, sans-serif" }}>
                    ₹{sortedRecords.filter(r => selectedBills.includes(r._id)).reduce((s, b) => s + calculateMaskedTotal(b), 0).toLocaleString()}
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
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Adjustment Settings</span>
            </div>

            {/* Global Switches */}
            <div className="space-y-4">
               <div className="space-y-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-1.5">
                     <span className="text-[10px] font-black text-[#E1261C] tracking-widest uppercase"># Reduction Percentage (%)</span>
                  </div>
                  <div className="relative">
                     <input 
                        type="number" 
                        value={decreasePct}
                        min="0"
                        max="100"
                        step="1"
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, Number(e.target.value)));
                          setDecreasePct(String(val));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 h-12 rounded-lg text-center text-lg font-black text-slate-800 focus:border-[#E1261C] focus:bg-white transition-all outline-none focus:ring-2 focus:ring-[#E1261C]/10" 
                     />
                  </div>

               </div>
            </div>

            {/* Item Substitutions */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
               <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-slate-900 tracking-[0.15em]">Item Substitutions</label>
                  <div className="px-2 py-0.5 bg-[#E1261C] text-white text-[8px] font-black rounded-full uppercase">{itemReplacements.length} Rules</div>
               </div>

               {/* Add New Rule */}
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                  <SearchableSelect
                     label="Original Item"
                     placeholder="--Select Item--"
                     value={newReplacement.originalItem}
                     onChange={(val) => setNewReplacement({ ...newReplacement, originalItem: val })}
                     options={menuItems.map(item => item.name)}
                  />
                  <SearchableSelect
                     label="Replace With (Menu Item)"
                     placeholder="--Select Replacement--"
                     value={newReplacement.replacedWith}
                     onChange={(val) => {
                        const selectedItem = menuItems.find(item => item.name === val);
                        setNewReplacement({
                           ...newReplacement,
                           replacedWith: val,
                           replacedPrice: selectedItem ? (selectedItem.price || selectedItem.variants?.[0]?.price || 0) : 0
                        });
                     }}
                     options={menuItems.map(item => item.name)}
                  />
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase flex items-center gap-1">Replacement Price <span className="text-emerald-500 normal-case font-normal">(auto-filled from menu)</span></label>
                      <input 
                         type="number" 
                         readOnly
                         value={newReplacement.replacedPrice}
                         className="w-full h-8 bg-slate-100 border border-slate-200 rounded px-2 text-[10px] font-bold outline-none cursor-not-allowed text-slate-500"
                      />
                   </div>
                  <button 
                     onClick={addReplacementRule}
                     className="w-full h-8 bg-slate-900 hover:bg-[#E1261C] text-white text-[9px] font-black uppercase tracking-widest rounded shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                     <Plus size={12} />
                     Add Replacement Rule
                  </button>
               </div>

               {/* Active Rules List */}
               <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                  {itemReplacements.map((rule, i) => (
                     <div 
                        key={i} 
                        className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between group hover:border-[#E1261C] hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 relative overflow-hidden"
                     >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 group-hover:bg-[#E1261C] transition-colors" />
                        <div className="flex flex-col gap-1 pl-1">
                           <span className="text-[10px] font-extrabold text-slate-800 uppercase truncate max-w-[150px]">{rule.originalItem}</span>
                           <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-black text-[#E1261C] uppercase tracking-wider bg-rose-50 px-1 rounded-sm">REPLACED WITH</span>
                              <span className="text-[9px] font-bold text-slate-500 uppercase truncate max-w-[100px]">{rule.replacedWith}</span>
                              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50/80 px-1.5 py-0.2 rounded border border-emerald-100">₹{rule.replacedPrice}</span>
                           </div>
                        </div>
                        <button 
                           onClick={() => removeReplacementRule(i)}
                           className="p-2 text-slate-400 hover:text-[#E1261C] hover:bg-rose-50 rounded-lg transition-all active:scale-90 cursor-pointer"
                           title="Delete rule"
                        >
                           <Trash2 size={13} />
                        </button>
                     </div>
                  ))}
                  {itemReplacements.length === 0 && (
                     <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">No Substitutions Defined</span>
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
                  <span className="relative z-10">Apply Settings</span>
               </button>

               <button 
                  onClick={handleExportSnapshot}
                  className="w-full h-11 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white transition-all shadow-sm group"
               >
                  <FileSpreadsheet size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Export CSV</span>
               </button>
            </div>
         </div>
      </div>

      {viewingBill && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Receipt Audit Preview</span>
              <button 
                onClick={() => { playClickSound(); setViewingBill(null); }}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Receipt Body */}
            <div className="flex-1 overflow-y-auto py-8 px-6 bg-slate-100 flex flex-col items-center">
              <div className="w-full receipt-paper-jagged p-6 font-mono text-[11px] text-slate-800 flex flex-col">
                
                {/* Branding */}
                <div className="text-center mb-4">
                  <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">RETAIL INVOICE</span>
                  <h3 className="text-sm font-extrabold uppercase tracking-tight text-slate-900 mt-1">
                    {storeInfo?.name || 'MAMA FRANKY HOUSE'}
                  </h3>
                  {storeInfo?.legalName && (
                    <div className="text-[9px] text-slate-500">({storeInfo.legalName})</div>
                  )}
                  <div className="text-[9px] text-slate-500 mt-1">
                    {storeInfo?.address || 'A - 17, Shopping Arcade, Sadar Bazar'}
                  </div>
                  <div className="text-[9px] text-slate-500">
                    {storeInfo?.city ? `${storeInfo.city}, ${storeInfo.state || ''} - ${storeInfo.pincode || ''}` : 'Agra Cantt, U. P. - 282001'}
                  </div>
                  {storeInfo?.phone && (
                    <div className="text-[9px] text-slate-500">Ph. No: +91 {storeInfo.phone}</div>
                  )}
                  <div className="text-[9px] text-slate-500">GSTIN: {storeInfo?.gstin || '09AAFFT9378RIZW'}</div>
                </div>

                <div className="border-t border-dashed border-slate-300 my-3" />

                {/* Metadata */}
                <div className="space-y-1 text-slate-600 mb-3">
                  <div className="flex justify-between">
                    <span>Date: {new Date(viewingBill.completedAt).toLocaleDateString('en-GB')}</span>
                    <span className="font-bold">{viewingBill.orderType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time: {new Date(viewingBill.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                    <span>Bill No: {viewingBill.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cashier: {viewingBill.waiter?.name || 'SYSTEM'}</span>
                    <span>Table: {viewingBill.orderType === 'PICKUP' ? 'PICKUP' : (viewingBill.table?.name || viewingBill.carNumber || 'CAR')}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 my-2" />

                {/* Item List Header */}
                <div className="grid grid-cols-12 font-bold text-slate-700 py-1 border-b border-dashed border-slate-200">
                  <span className="col-span-6">Item</span>
                  <span className="col-span-2 text-right">Qty</span>
                  <span className="col-span-2 text-right">Price</span>
                  <span className="col-span-2 text-right">Amt</span>
                </div>

                {/* Item List Rows */}
                <div className="space-y-2 py-2">
                  {(viewingBill.kots || []).flatMap(kot => kot.items || [])
                    .filter(item => item.status !== 'cancelled')
                    .map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 text-slate-600">
                        <div className="col-span-6 flex flex-col">
                          <span className="font-bold">{item.name}</span>
                          {item.variantLabel && <span className="text-[9px] text-slate-400">({item.variantLabel})</span>}
                        </div>
                        <span className="col-span-2 text-right">{item.quantity}</span>
                        <span className="col-span-2 text-right">{item.price.toFixed(2)}</span>
                        <span className="col-span-2 text-right">{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                </div>

                <div className="border-t border-dashed border-slate-300 my-2" />

                {/* Totals */}
                <div className="space-y-1.5 text-slate-700 font-bold">
                  {(() => {
                    const details = getMaskedBillingDetails(viewingBill);
                    if (!details) return null;
                    const grandTotal = Math.round(details.total);
                    const roundOff = (grandTotal - details.total).toFixed(2);
                    return (
                      <>
                        <div className="flex justify-between">
                          <span>Sub Total</span>
                          <span>₹{details.subTotal.toFixed(2)}</span>
                        </div>
                        {details.discount > 0 && (
                          <div className="flex justify-between text-rose-600">
                            <span>Discount</span>
                            <span>-₹{details.discount.toFixed(2)}</span>
                          </div>
                        )}
                        {details.appliedTaxes.map((tax, i) => (
                          <div key={i} className="flex justify-between font-normal text-slate-600">
                            <span>{tax.name} {tax.rate}%</span>
                            <span>₹{tax.amount.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t border-slate-200 pt-1.5 flex justify-between font-normal text-[10px] text-slate-500">
                          <span>Round off</span>
                          <span>₹{roundOff}</span>
                        </div>
                        <div className="border-t-2 border-double border-slate-300 pt-2 flex justify-between text-slate-900 text-sm font-extrabold">
                          <span>GRAND TOTAL</span>
                          <span>₹{grandTotal}.00</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="border-t border-dashed border-slate-300 my-3" />
                
                <div className="text-center text-[9px] text-slate-400 uppercase tracking-widest mt-1">
                  Thank You, Kindly Visit Again...!!
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50/50">
              <button 
                onClick={() => { playClickSound(); setViewingBill(null); }}
                className="flex-1 h-10 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all active:scale-95 outline-none"
              >
                Close Preview
              </button>
              <button 
                onClick={() => handleDownloadBill(viewingBill)}
                className="flex-1 h-10 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-600/10 transition-all flex items-center justify-center gap-2 active:scale-95 outline-none"
              >
                <Download size={14} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
