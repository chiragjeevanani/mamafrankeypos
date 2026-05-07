
import React, { useState } from 'react';
import { Sliders, Plus, Search, Filter, Edit2, Trash2, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';
import { usePos } from '../../../pos/context/PosContext';

export default function Modifiers() {
  const { variantGroups, addVariantGroup, updateVariantGroup, deleteVariantGroup } = usePos();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModifier, setEditingModifier] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Add-on',
    options: [{ name: '', price: 0 }]
  });

  const handleOpenModal = (mod = null) => {
    if (mod) {
      setEditingModifier(mod);
      setFormData({ 
        name: mod.name, 
        type: mod.type || 'Add-on', 
        options: mod.options && mod.options.length > 0 ? mod.options : [{ name: '', price: 0 }] 
      });
    } else {
      setEditingModifier(null);
      setFormData({ name: '', type: 'Add-on', options: [{ name: '', price: 0 }] });
    }
    setIsModalOpen(true);
  };

  const handleAddOption = () => {
    setFormData({ ...formData, options: [...formData.options, { name: '', price: 0 }] });
  };

  const handleRemoveOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions.length > 0 ? newOptions : [{ name: '', price: 0 }] });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = field === 'price' ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      // Clean options
      const cleanedOptions = formData.options.filter(opt => opt.name.trim() !== '');
      const data = { ...formData, options: cleanedOptions };

      if (editingModifier) {
        await updateVariantGroup(editingModifier.id, data);
      } else {
        await addVariantGroup(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving modifier:', error);
      alert('Error saving modifier.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('PROTOCOL: Proceed with record termination?')) {
      try {
        await deleteVariantGroup(id);
      } catch (error) {
        console.error('Error deleting modifier:', error);
        alert('Error deleting modifier.');
      }
    }
  };

  const filteredModifiers = variantGroups.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Modifier Matrix</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Add-on Logic & Customizations</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none"
        >
          <Plus size={14} />
          Create Modifier Group
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-4 flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="FILTER MODIFIER GROUPS..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="h-10 px-4 border border-slate-100 text-slate-500 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all outline-none">
          <Filter size={14} />
          Type
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Group Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Options Count</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Type Mapping</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredModifiers.map((mod) => (
              <tr key={mod.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{mod.name}</span>
                </td>
                <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest tracking-tighter">
                  {mod.options?.length || 0} Choices Defined
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-sm text-[8px] font-black uppercase tracking-widest">{mod.type}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleOpenModal(mod)}
                      className="p-2 text-slate-400 hover:text-slate-900 transition-colors outline-none"
                    ><Edit2 size={14} /></button>
                    <button 
                      onClick={() => handleDelete(mod.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors outline-none"
                    ><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingModifier ? 'Update Modifier Group' : 'Register Modifier Group'}
        subtitle="Customization Logic & Pricing Profiles"
        onSubmit={handleSave}
        isSaving={isSaving}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Group Designation</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. EXTRA TOPPINGS"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selection Protocol</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Add-on">Optional Add-ons</option>
                <option value="Upgrade">Size/Type Upgrade</option>
                <option value="Dietary">Dietary Override</option>
                <option value="Size">Dimensional Change</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
               <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Configuration Options</label>
               <button 
                  type="button" 
                  onClick={handleAddOption}
                  className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:text-blue-700 transition-colors"
               >
                  <Plus size={12} /> Add Option
               </button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 no-scrollbar">
               {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3 animate-in slide-in-from-left duration-300">
                     <div className="flex-1">
                        <input 
                           type="text" 
                           required
                           placeholder="OPTION NAME (e.g. EXTRA CHEESE)"
                           className="w-full bg-slate-50 border border-slate-100 p-2.5 text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={option.name}
                           onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                        />
                     </div>
                     <div className="w-32">
                        <input 
                           type="number" 
                           required
                           placeholder="PRICE"
                           className="w-full bg-slate-50 border border-slate-100 p-2.5 text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={option.price}
                           onChange={(e) => handleOptionChange(index, 'price', e.target.value)}
                        />
                     </div>
                     <button 
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="p-2.5 text-slate-300 hover:text-red-500 transition-colors"
                     ><X size={14} /></button>
                  </div>
               ))}
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
