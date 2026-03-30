
import React, { useState } from 'react';
import { 
  CreditCard, IndianRupee, TrendingUp, TrendingDown, 
  FileText, Download, Filter, Search, Plus,
  PieChart, Activity, DollarSign, X, Save,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_EXPENSES = [
  { id: 1, date: '2024-03-14', category: 'Raw Materials', vendor: 'Global Fresh Produce', amount: 12450, status: 'paid' },
  { id: 2, date: '2024-03-13', category: 'Utilities', vendor: 'City Electric Supply', amount: 8200, status: 'paid' },
  { id: 3, date: '2024-03-13', category: 'Rent', vendor: 'Commercial Realty', amount: 45000, status: 'pending' },
  { id: 4, date: '2024-03-12', category: 'Marketing', vendor: 'Digital Ads Agency', amount: 5000, status: 'paid' },
  { id: 5, date: '2024-03-11', category: 'Staff Salaries', vendor: 'Internal Personnel', amount: 185000, status: 'processing' },
];

export default function FinancialManagement() {
  const [expenses, setExpenses] = useState(MOCK_EXPENSES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Raw Materials',
    vendor: '',
    amount: '',
    status: 'paid'
  });

  const handleOpenModal = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'Raw Materials',
      vendor: '',
      amount: '',
      status: 'paid'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newExpense = {
      ...formData,
      id: Date.now(),
      amount: parseFloat(formData.amount)
    };
    setExpenses([newExpense, ...expenses]);
    setIsModalOpen(false);
  };

  const totalExpenseValue = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar max-h-full">
       <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Financial Control & Billing</h1>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Expense monitoring, tax configuration, and fiscal reports</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => window.alert('FISCAL PROTOCOL: Generating consolidated PDF report...')}
             className="h-9 px-4 bg-white border border-slate-200 text-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"
           >
              <Download size={14} />
              Export Fiscal
           </button>
           <button 
             onClick={handleOpenModal}
             className="h-9 px-4 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
           >
              <Plus size={14} />
              Log Expense
           </button>
        </div>
      </div>

      {/* Summary Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
            <IndianRupee className="text-blue-500 mb-4" size={24} />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gross Sales (MTD)</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">₹8,42,850</h3>
            <div className="flex items-center gap-1 mt-2">
               <TrendingUp size={10} className="text-emerald-500" />
               <span className="text-[9px] font-black text-emerald-500 uppercase">+15.2% from prev.</span>
            </div>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50/50 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
            <TrendingDown className="text-rose-500 mb-4" size={24} />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logged Expenses</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">₹{totalExpenseValue.toLocaleString()}</h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 inline-block">Manual Registry Active</span>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50/50 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
            <Activity className="text-emerald-500 mb-4" size={24} />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Profit Margin</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">42.8%</h3>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-2 inline-block">Highly Optimized</span>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-slate-900/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
            <FileText className="text-slate-900 mb-4" size={24} />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">GST Collected</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">₹1,51,713</h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 inline-block">Liability Managed</span>
         </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden">
         <div className="p-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Expense Audit Log</h3>
            <div className="flex bg-slate-50 p-1 border border-slate-100 rounded-sm">
               <button className="px-3 py-1 text-[8px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-900 shadow-sm rounded-sm">All Time</button>
               <button className="px-3 py-1 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">This Month</button>
            </div>
         </div>
         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Ref Date</th>
                     <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Expense Category</th>
                     <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Source/Vendor</th>
                     <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap text-right">Amount (INR)</th>
                     <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap text-center">Protocol Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {expenses.map(exp => (
                     <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                        <td className="px-6 py-4">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exp.date}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[11px] font-black uppercase text-slate-900">{exp.category}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exp.vendor}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className="text-[11px] font-black text-slate-900">₹{exp.amount.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 flex justify-center">
                           <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              exp.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                              exp.status === 'pending' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                           }`}>
                              {exp.status}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Expense Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-sm shadow-2xl relative overflow-hidden flex flex-col"
            >
               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-slate-900 text-white rounded-sm flex items-center justify-center">
                        <Plus size={16} />
                     </div>
                     <div>
                        <h3 className="text-[13px] font-black uppercase tracking-tight text-slate-900">Registry Manual Ledger Entry</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Fiscal Protocol v2.4.0</p>
                     </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={18} /></button>
               </div>

               <form onSubmit={handleSave} className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Date</label>
                        <input 
                           type="date" 
                           required
                           className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={formData.date}
                           onChange={(e) => setFormData({...formData, date: e.target.value})}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Category</label>
                        <select 
                           className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={formData.category}
                           onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                           <option>Raw Materials</option>
                           <option>Utilities</option>
                           <option>Rent</option>
                           <option>Marketing</option>
                           <option>Staff Salaries</option>
                           <option>Maintenance</option>
                        </select>
                     </div>

                     <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source / Vendor Endpoint</label>
                        <input 
                           type="text" 
                           required
                           className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={formData.vendor}
                           onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                           placeholder="VENDOR NAME OR DESIGNATION"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fiscal Value (INR)</label>
                        <input 
                           type="number" 
                           required
                           className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={formData.amount}
                           onChange={(e) => setFormData({...formData, amount: e.target.value})}
                           placeholder="0.00"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement Status</label>
                        <select 
                           className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={formData.status}
                           onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                           <option value="paid">PAID / SETTLED</option>
                           <option value="pending">PENDING</option>
                           <option value="processing">PROCESSING</option>
                        </select>
                     </div>
                  </div>

                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-sm flex items-center gap-3">
                     <AlertCircle size={16} className="text-blue-500" />
                     <p className="text-[9px] font-bold text-blue-700 uppercase tracking-widest leading-relaxed">
                        Data Integrity: Manual ledger entries are subject to reconciliation vs banking protocols at end of fiscal day.
                     </p>
                  </div>

                  <div className="pt-6 flex items-center gap-3">
                     <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm"
                     >Discard Entry</button>
                     <button 
                        type="submit"
                        className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                     >
                        <Save size={14} />
                        Commit to Ledger
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
