
import React, { useState } from 'react';
import { 
  Plus, Edit3, Trash2, 
  AlertCircle, Utensils,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePos } from '../../../pos/context/PosContext';
import AdminModal from '../../components/ui/AdminModal';

export default function DishReplacementManagement() {
  const { menuItems, replacements, addReplacement, updateReplacement, deleteReplacement } = usePos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    originalDishId: '',
    replacementDishId: '',
    startDate: '',
    endDate: ''
  });

  const getDishName = (id) => {
    return menuItems.find(item => item.id === id)?.name || 'Unknown Dish';
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
    setFormError('');
    if (rule) {
      setEditingRule(rule);
      setFormData({
        originalDishId: rule.originalDishId,
        replacementDishId: rule.replacementDishId,
        startDate: rule.startDate,
        endDate: rule.endDate
      });
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

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setError('');

    if (!formData.originalDishId || !formData.replacementDishId || !formData.startDate || !formData.endDate) {
      setFormError('All replacement fields are required.');
      return;
    }
    
    if (formData.originalDishId === formData.replacementDishId) {
      setFormError('Original dish and replacement dish cannot be the same.');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setFormError('End date cannot be before start date.');
      return;
    }

    try {
      setIsSaving(true);
      const data = {
        originalDish: formData.originalDishId,
        replacementDish: formData.replacementDishId,
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      if (editingRule) {
        await updateReplacement(editingRule.id, data);
      } else {
        await addReplacement(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving replacement rule:', error);
      setFormError(error.response?.data?.message || 'Unable to save replacement rule.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this replacement rule?')) {
      try {
        setError('');
        await deleteReplacement(id);
      } catch (error) {
        console.error('Error deleting replacement rule:', error);
        setError(error.response?.data?.message || 'Unable to delete replacement rule.');
      }
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
          className="h-9 px-4 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none"
        >
           <Plus size={14} />
           Create Replacement Rule
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-sm px-4 py-3 flex items-start gap-3">
          <AlertCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Rules</p>
            <h3 className="text-2xl font-black text-slate-900">{replacements.length} RULES</h3>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Now</p>
            <h3 className="text-2xl font-black text-emerald-600">
               {replacements.filter(r => getStatus(r.startDate, r.endDate) === 'Active').length} ACTIVE
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
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Sync</p>
            <h3 className="text-sm font-black text-slate-900 uppercase">Live</h3>
         </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <RefreshCw size={14} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Active Substitutions Ledger</span>
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
              {replacements.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                       <Utensils size={40} />
                       <span className="text-[11px] font-black uppercase tracking-[0.2em]">No replacement rules defined</span>
                    </div>
                  </td>
                </tr>
              ) : replacements.map(rule => {
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
                          <button onClick={() => handleOpenModal(rule)} className="p-1.5 text-slate-400 hover:text-slate-900 bg-white border border-slate-100 rounded-sm outline-none"><Edit3 size={12} /></button>
                          <button onClick={() => handleDelete(rule.id)} className="p-1.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-100 rounded-sm outline-none"><Trash2 size={12} /></button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRule ? 'Modify Replacement Rule' : 'Create Replacement Rule'}
        subtitle="Substitution Rules & Time Overrides"
        onSubmit={handleSave}
        isSaving={isSaving}
      >
        <div className="space-y-6">
          {formError && (
            <div className="bg-rose-50 border border-rose-100 rounded-sm px-4 py-3 flex items-start gap-3">
              <AlertCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{formError}</p>
            </div>
          )}
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
                  {menuItems.map(item => (
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
                  {menuItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
               </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
               <input 
                  type="date"
                  required
                  className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
               <input 
                  type="date"
                  required
                  className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
               />
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-sm flex items-start gap-3">
             <AlertCircle size={14} className="text-blue-600 mt-0.5 shrink-0" />
             <p className="text-[9px] font-bold text-blue-700 uppercase tracking-widest leading-relaxed">
                Synchronization: Replacement rules will be applied to the POS module immediately upon commitment.
             </p>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
