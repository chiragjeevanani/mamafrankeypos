
import React, { useState } from 'react';
import { 
  ArrowLeft, Plus, Search, Save, X, Edit3, Trash2, 
  AlertCircle, ShieldCheck, Calendar, Utensils,
  ChevronRight, RefreshCw, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { POS_MENU_ITEMS } from '../../../pos/data/posMenu';

export default function DishReplacementManagement() {
  const [rules, setRules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    originalDishId: '',
    replacementDishId: '',
    startDate: '',
    endDate: ''
  });

  const getDishName = (id) => {
    return POS_MENU_ITEMS.find(item => item.id === id)?.name || 'Unknown Dish';
  };

  const getStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now >= start && now <= end) return 'Active';
    if (now < start) return 'Scheduled';
    return 'Expired';
  };

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData(rule);
    } else {
      setEditingRule(null);
      setFormData({
        originalDishId: '',
        replacementDishId: '',
        startDate: '',
        endDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Validations
    if (formData.originalDishId === formData.replacementDishId) {
      alert('Original Dish and Replacement Dish cannot be the same.');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('End Date cannot be before Start Date.');
      return;
    }

    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? { ...formData, id: r.id } : r));
    } else {
      const newRule = {
        ...formData,
        id: Date.now()
      };
      setRules([...rules, newRule]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this replacement rule?')) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar max-h-full">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Dish Replacement Management</h1>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configure temporary dish substitutions and availability rules</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="h-9 px-4 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
        >
           <Plus size={14} />
           Create Replacement Rule
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Rules</p>
            <h3 className="text-2xl font-black text-slate-900">{rules.length} RULES</h3>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Now</p>
            <h3 className="text-2xl font-black text-emerald-600">
               {rules.filter(r => getStatus(r.startDate, r.endDate) === 'Active').length} ACTIVE
            </h3>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">System Load</p>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-2 h-2 rounded-full bg-emerald-500" />
               <h3 className="text-sm font-black text-slate-900 uppercase">Optimized</h3>
            </div>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Update</p>
            <h3 className="text-sm font-black text-slate-900 uppercase">Just Now</h3>
         </div>
      </div>

      {/* List / Table */}
      <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <RefreshCw size={14} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Active Substitutions Ledger</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="relative">
                 <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input type="text" placeholder="Search rules..." className="pl-7 pr-2 py-1 bg-white border border-slate-200 text-[10px] font-bold uppercase rounded-sm w-32 outline-none focus:ring-1 focus:ring-slate-900/10" />
              </div>
              <button className="p-1.5 text-slate-400 hover:text-slate-900"><Filter size={14} /></button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Original Dish</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Replacement Dish</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                       <Utensils size={40} />
                       <span className="text-[11px] font-black uppercase tracking-[0.2em]">No replacement rules defined</span>
                    </div>
                  </td>
                </tr>
              ) : rules.map(rule => {
                const status = getStatus(rule.startDate, rule.endDate);
                return (
                  <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-slate-50 rounded-sm flex items-center justify-center text-slate-400">
                            <Utensils size={14} />
                         </div>
                         <span className="text-[11px] font-black text-slate-900 uppercase">{getDishName(rule.originalDishId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <RefreshCw size={12} className="text-emerald-500" />
                         <span className="text-[11px] font-black text-slate-700 uppercase">{getDishName(rule.replacementDishId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">{rule.startDate}</td>
                    <td className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">{rule.endDate}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest ${
                         status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                         status === 'Scheduled' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                       }`}>
                         {status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2 transition-all">
                          <button onClick={() => handleOpenModal(rule)} className="p-1.5 text-slate-400 hover:text-slate-900 bg-white border border-slate-100 rounded-sm"><Edit3 size={12} /></button>
                          <button onClick={() => handleDelete(rule.id)} className="p-1.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-100 rounded-sm"><Trash2 size={12} /></button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
                        <RefreshCw size={16} />
                     </div>
                      <div>
                         <h3 className="text-[13px] font-black uppercase tracking-tight text-slate-900">
                           {editingRule ? 'Modify Replacement Logic' : 'Establish New Replacement'}
                         </h3>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Substitution Protocol v1.2</p>
                      </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={18} /></button>
               </div>

               <form onSubmit={handleSave} className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Original Dish</label>
                       <select 
                          required
                          className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                          value={formData.originalDishId}
                          onChange={(e) => setFormData({...formData, originalDishId: e.target.value})}
                       >
                          <option value="">Select Original</option>
                          {POS_MENU_ITEMS.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Replacement Dish</label>
                       <select 
                          required
                          className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                          value={formData.replacementDishId}
                          onChange={(e) => setFormData({...formData, replacementDishId: e.target.value})}
                       >
                          <option value="">Select Replacement</option>
                          {POS_MENU_ITEMS.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                       </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Start Date</label>
                       <input 
                          type="date"
                          required
                          className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Termination Date</label>
                       <input 
                          type="date"
                          required
                          className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                       />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm flex items-start gap-3">
                     <AlertCircle size={14} className="text-slate-900 mt-0.5 shrink-0" />
                     <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                        Data Integrity: Replacement rules will override global menu visibility for the specified duration. Ensure original dish availability is verified.
                     </p>
                  </div>

                  <div className="pt-6 flex items-center gap-3">
                     <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm"
                     >Abort Deployment</button>
                     <button 
                        type="submit"
                        className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                     >
                        <Save size={14} />
                        {editingRule ? 'Update Rule' : 'Commit Rule'}
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
