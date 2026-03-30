
import React, { useState } from 'react';
import { Package, Plus, Search, Filter, Edit2, Trash2, Layers, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';

export default function ComboMeals() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);

  const [combos, setCombos] = useState([
    { id: 1, name: 'Family Weekend Feast', price: 1499, elements: 6, code: 'CM-01', active: true },
    { id: 2, name: 'Quick Lunch Box', price: 299, elements: 3, code: 'CM-02', active: true },
    { id: 3, name: 'Date Night Platter', price: 899, elements: 4, code: 'CM-03', active: false },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    elements: 0,
    active: true
  });

  const handleOpenModal = (combo = null) => {
    if (combo) {
      setEditingCombo(combo);
      setFormData(combo);
    } else {
      setEditingCombo(null);
      setFormData({ name: '', price: '', elements: 0, active: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingCombo) {
      setCombos(combos.map(c => c.id === editingCombo.id ? { ...c, ...formData } : c));
    } else {
      setCombos([...combos, { ...formData, id: Date.now(), code: `CM-${combos.length + 10}` }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('PROTOCOL: Proceed with record termination?')) {
      setCombos(combos.filter(c => c.id !== id));
    }
  };

  const filteredCombos = combos.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between underline decoration-transparent">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Combo Matrix</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 underline decoration-transparent">Bundle Logic & Dynamic Menus</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none"
        >
          <Plus size={14} />
          Forge New Combo
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-4 flex gap-4 underline decoration-transparent">
        <div className="relative flex-1 group underline decoration-transparent">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="FILTER CATALOGED COMBOS..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none underline decoration-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="h-10 px-4 border border-slate-100 text-slate-500 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all outline-none">
          <Filter size={14} />
          Protocol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 underline decoration-transparent">
        {filteredCombos.map((combo) => (
          <div key={combo.id} className="bg-white border border-slate-100 rounded-sm p-6 hover:shadow-xl hover:border-slate-300 transition-all group relative underline decoration-transparent">
            <div className={`absolute top-0 right-0 w-1.5 h-full ${combo.active ? 'bg-emerald-500' : 'bg-slate-200'} underline decoration-transparent`} />
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-sm flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-all underline decoration-transparent">
              <Package size={20} />
            </div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{combo.name}</h4>
            <div className="flex items-center gap-2 mb-6 underline decoration-transparent">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">#{combo.code}</span>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{combo.elements} Elements Integrated</span>
            </div>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 underline decoration-transparent">
              <span className="text-xs font-black text-blue-600">₹{combo.price}</span>
              <div className="flex items-center gap-2 underline decoration-transparent">
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
      >
        <div className="space-y-4 underline decoration-transparent">
          <div className="space-y-2 underline decoration-transparent">
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
          <div className="grid grid-cols-2 gap-4 underline decoration-transparent">
            <div className="space-y-2 underline decoration-transparent">
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
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Element Count</label>
              <input 
                type="number" 
                required
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.elements}
                onChange={(e) => setFormData({...formData, elements: e.target.value})}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex items-center justify-between bg-slate-50 p-4 border border-slate-100 rounded-sm underline decoration-transparent">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Operational Status</span>
            <button 
              type="button"
              onClick={() => setFormData({...formData, active: !formData.active})}
              className={`w-10 h-5 rounded-full transition-all relative ${formData.active ? 'bg-emerald-500' : 'bg-slate-300'} underline decoration-transparent`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.active ? 'right-1' : 'left-1'} underline decoration-transparent`} />
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
