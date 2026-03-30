
import React, { useState } from 'react';
import { 
  Receipt, Search, Filter, CreditCard, 
  Banknote, Smartphone, Printer, Send,
  Table, Clock, ChevronRight, AlertCircle,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { usePos } from '../../context/PosContext';
import { printBillReceipt } from '../../utils/printBill';

const MOCK_BILLING_PENDING = [
  { id: 'T-04', table: 'Table 4', items: 3, subtotal: 840, tax: 42, total: 882, time: '35 MINS' },
  { id: 'T-02', table: 'Table 2', items: 5, subtotal: 1240, tax: 62, total: 1302, time: '48 MINS' },
  { id: 'T-10', table: 'Table 10', items: 2, subtotal: 450, tax: 22, total: 472, time: '12 MINS' },
];

export default function GenerateBill() {
  const { user } = usePos();
  const [selectedTable, setSelectedTable] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePrint = () => {
    if (!selectedTable) return;
    printBillReceipt(
      { cart: [] }, // Mock cart as we use totals from selectedTable
      { name: selectedTable.table },
      { 
        total: selectedTable.total, 
        subTotal: selectedTable.subtotal, 
        tax: selectedTable.tax, 
        discount: 0, 
        billerName: user?.name 
      }
    );
  };

  const handleFinalize = () => {
    if (!selectedTable) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setSelectedTable(null);
        setIsSuccess(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500 overflow-hidden">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">Guest Billing & Checkout</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Generate Invoices & Process Customer Payments</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 shadow-sm">
            <Calculator size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Pricing Matrix v1.0</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Pending Tables List */}
        <div className="w-1/2 border-r border-slate-200 overflow-y-auto p-8 no-scrollbar bg-white/50">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Pending Bill Requests</h2>
          <div className="space-y-4">
             {MOCK_BILLING_PENDING.map(table => (
               <motion.button
                 key={table.id}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => setSelectedTable(table)}
                 className={`w-full text-left p-6 rounded-lg border transition-all relative overflow-hidden group ${
                   selectedTable?.id === table.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white border-slate-100 hover:border-blue-600'
                 }`}
               >
                 <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                         selectedTable?.id === table.id ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'
                       }`}>
                          <Table size={24} />
                       </div>
                       <div>
                          <h3 className={`text-base font-black uppercase tracking-tight ${selectedTable?.id === table.id ? 'text-white' : 'text-slate-900'}`}>{table.table}</h3>
                          <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedTable?.id === table.id ? 'text-white/60' : 'text-slate-400'}`}>{table.items} ITEMS • {table.time} ACTIVE</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${selectedTable?.id === table.id ? 'text-white/60' : 'text-slate-400'}`}>Total Due</p>
                       <span className={`text-lg font-black tracking-tighter ${selectedTable?.id === table.id ? 'text-white' : 'text-slate-950'}`}>₹{table.total}</span>
                    </div>
                 </div>
                 {selectedTable?.id === table.id && <div className="absolute top-2 right-2 p-1 bg-white/20 rounded-full"><ChevronRight size={14} /></div>}
               </motion.button>
             ))}
          </div>
        </div>

        {/* Right: Bill Preview & Actions */}
        <div className="flex-1 overflow-y-auto p-12 no-scrollbar bg-[#F8F9FA]">
          <AnimatePresence mode="wait">
            {!selectedTable ? (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="h-full flex flex-col items-center justify-center text-slate-300"
               >
                  <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center mb-6">
                     <Receipt size={32} strokeWidth={1} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em]">Select a table for billing</h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest mt-2">Pick an active table from the left to view the invoice</p>
               </motion.div>
            ) : (
               <motion.div 
                 key={selectedTable.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="max-w-md mx-auto space-y-8"
               >
                  <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-2xl shadow-slate-900/5 relative">
                     <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Receipt size={120} strokeWidth={1} />
                     </div>
                     
                     <div className="text-center mb-8">
                        <h2 className="text-lg font-extrabold uppercase tracking-tighter text-slate-900">TIME TO EAT INVOICE</h2>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Terminal #01 • {new Date().toLocaleDateString()}</p>
                     </div>

                     <div className="space-y-4 mb-8">
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Table Location</span>
                           <span className="text-[11px] font-black text-slate-900 uppercase">{selectedTable.table}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Number</span>
                           <span className="text-[11px] font-black text-slate-900 uppercase">INV-0912</span>
                        </div>
                     </div>

                     <div className="space-y-3 mb-8">
                        <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                           <span>Items Subtotal</span>
                           <span>₹{selectedTable.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                           <span>VAT/CGST (5%)</span>
                           <span>₹{selectedTable.tax}</span>
                        </div>
                        <div className="pt-4 border-t-2 border-double border-slate-200 flex justify-between">
                           <span className="text-base font-extrabold text-slate-900 uppercase tracking-tighter">Amount Due</span>
                           <span className="text-xl font-extrabold text-blue-600 tracking-tighter">₹{selectedTable.total}</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-3 gap-2">
                        <button className="flex flex-col items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-md hover:border-blue-600 hover:bg-white transition-all group">
                           <Banknote size={16} className="text-slate-400 group-hover:text-emerald-500" />
                           <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Cash Payment</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-md hover:border-blue-600 hover:bg-white transition-all group">
                           <CreditCard size={16} className="text-slate-400 group-hover:text-amber-500" />
                           <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Card Payment</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-md hover:border-blue-600 hover:bg-white transition-all group">
                           <Smartphone size={16} className="text-slate-400 group-hover:text-blue-500" />
                           <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">UPI / QR Scan</span>
                        </button>
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <button 
                       onClick={handlePrint}
                       className="flex-1 py-4 bg-white border border-slate-200 text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 hover:bg-slate-50 transition-all outline-none"
                     >
                        <Printer size={16} />
                        Print Receipt
                     </button>
                     <button className="flex-1 py-4 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all outline-none active:scale-95">
                        <Send size={16} />
                        Finalize & Close
                     </button>
                  </div>

                  <div className="p-4 bg-amber-50 rounded border border-amber-100 flex items-center gap-3">
                     <AlertCircle size={16} className="text-amber-600 shrink-0" />
                     <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest">Note: Completing the bill will move the table to 'Available' status.</p>
                  </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
