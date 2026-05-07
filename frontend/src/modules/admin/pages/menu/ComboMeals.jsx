
import React, { useState } from 'react';
import { Package, Plus, Search, Filter, Edit2, Trash2, Layers, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';
import { usePos } from '../../../pos/context/PosContext';

export default function ComboMeals() {
  const { combos, addCombo, updateCombo, deleteCombo } = usePos();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { menuItems } = usePos();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    code: '',
    elements: [],
    active: true
  });

  const handleOpenModal = (combo = null) => {
    if (combo) {
      setEditingCombo(combo);
      setFormData({
        name: combo.name,
        price: combo.price,
        code: combo.code || '',
        elements: combo.elements?.map(el => ({ item: el.item?._id || el.item, quantity: el.quantity })) || [],
        active: combo.active
      });
    } else {
      setEditingCombo(null);
      setFormData({ name: '', price: '', code: '', elements: [], active: true });
    }
    setIsModalOpen(true);
  };

  const handleAddElement = () => {
    setFormData(prev => ({
      ...prev,
      elements: [...prev.elements, { item: menuItems[0]?.id || '', quantity: 1 }]
    }));
  };

  const handleRemoveElement = (index) => {
    setFormData(prev => ({
      ...prev,
      elements: prev.elements.filter((_, i) => i !== index)
    }));
  };

  const handleElementChange = (index, field, value) => {
    setFormData(prev => {
      const newElements = [...prev.elements];
      newElements[index] = { ...newElements[index], [field]: value };
      return { ...prev, elements: newElements };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        code: formData.code,
        active: formData.active,
        elements: formData.elements
      };

      if (editingCombo) {
        await updateCombo(editingCombo.id, data);
      } else {
        await addCombo(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving combo:', error);
      alert('Error saving combo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('PROTOCOL: Proceed with record termination?')) {
      try {
        await deleteCombo(id);
      } catch (error) {
        console.error('Error deleting combo:', error);
        alert('Error deleting combo.');
      }
    }
  };

  const filteredCombos = combos.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Combo Matrix</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Bundle Logic & Dynamic Menus</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none"
        >
          <Plus size={14} />
          Forge New Combo
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-4 flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="FILTER CATALOGED COMBOS..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="h-10 px-4 border border-slate-100 text-slate-500 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all outline-none">
          <Filter size={14} />
          Protocol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCombos.map((combo) => (
          <div key={combo.id} className="bg-white border border-slate-100 rounded-sm p-6 hover:shadow-xl hover:border-slate-300 transition-all group relative">
            <div className={`absolute top-0 right-0 w-1.5 h-full ${combo.active ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-sm flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-all">
              <Package size={20} />
            </div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{combo.name}</h4>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">#{combo.code || 'CM-AUTO'}</span>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{combo.elements?.length || 0} Elements Integrated</span>
            </div>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
              <span className="text-xs font-black text-blue-600">₹{combo.price}</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleOpenModal(combo)}
                  className="p-1.5 hover:bg-slate-50 rounded-sm transition-colors text-slate-400 hover:text-slate-900 outline-none"
                ><Edit2 size={12} /></button>
                <button 
                  onClick={() => handleDelete(combo.id)}
                  className="p-1.5 hover:bg-red-50 rounded-sm transition-colors text-slate-400 hover:text-red-500 outline-none"
                ><Trash2 size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCombo ? 'Update Combo Protocol' : 'Initialize Combo'}
        subtitle="Bundle Logic & Multi-Asset Assemblies"
        onSubmit={handleSave}
        isSaving={isSaving}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Combo Designation</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. FAMILY FEAST"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fiscal Value (INR)</label>
              <input 
                type="number" 
                required
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Status</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.active}
                onChange={(e) => setFormData({...formData, active: e.target.value === 'true'})}
              >
                <option value="true">Operational</option>
                <option value="false">Decommissioned</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Integrated Elements</label>
                <button 
                  type="button"
                  onClick={handleAddElement}
                  className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                >+ Add Item</button>
             </div>
             
             {formData.elements.length === 0 ? (
                <div className="text-[10px] font-bold text-slate-400 italic bg-slate-50 p-4 rounded-sm border border-slate-100/50">
                   No elements assigned. Add items to define this combo bundle.
                </div>
             ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                   {formData.elements.map((el, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-sm">
                         <select 
                            className="flex-1 bg-white border border-slate-200 p-2 text-[10px] font-bold uppercase outline-none rounded-sm"
                            value={el.item}
                            onChange={(e) => handleElementChange(index, 'item', e.target.value)}
                         >
                            {menuItems.map(item => (
                               <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                         </select>
                         <input 
                            type="number"
                            min="1"
                            className="w-16 bg-white border border-slate-200 p-2 text-[10px] font-bold outline-none rounded-sm"
                            value={el.quantity}
                            onChange={(e) => handleElementChange(index, 'quantity', parseInt(e.target.value) || 1)}
                         />
                         <button 
                            type="button"
                            onClick={() => handleRemoveElement(index)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                         ><Trash2 size={14} /></button>
                      </div>
                   ))}
                </div>
             )}
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
