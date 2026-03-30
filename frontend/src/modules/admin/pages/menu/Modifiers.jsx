
import React, { useState } from 'react';
import { Sliders, Plus, Search, Filter, Edit2, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';

export default function Modifiers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModifier, setEditingModifier] = useState(null);

  const [modifiers, setModifiers] = useState([
    { id: 1, name: 'Extra Cheese', price: 60, items: 112, type: 'Add-on' },
    { id: 2, name: 'Double Patty', price: 90, items: 45, type: 'Upgrade' },
    { id: 3, name: 'Vegan Option', price: 120, items: 85, type: 'Dietary' },
    { id: 4, name: 'Large Size', price: 40, items: 230, type: 'Size' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    type: 'Add-on'
  });

  const handleOpenModal = (mod = null) => {
    if (mod) {
      setEditingModifier(mod);
      setFormData({ name: mod.name, price: mod.price, type: mod.type });
    } else {
      setEditingModifier(null);
      setFormData({ name: '', price: '', type: 'Add-on' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingModifier) {
      setModifiers(modifiers.map(m => m.id === editingModifier.id ? { ...m, ...formData } : m));
    } else {
      setModifiers([...modifiers, { ...formData, id: Date.now(), items: 0 }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('PROTOCOL: Proceed with record termination?')) {
      setModifiers(modifiers.filter(m => m.id !== id));
    }
  };

  const filteredModifiers = modifiers.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between underline decoration-transparent">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Modifier Matrix</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 underline decoration-transparent">Add-on Logic & Customizations</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none"
        >
          <Plus size={14} />
          Create Modifier
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-4 flex gap-4 underline decoration-transparent">
        <div className="relative flex-1 group underline decoration-transparent">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="FILTER MODIFIER GROUPS..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none underline decoration-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="h-10 px-4 border border-slate-100 text-slate-500 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all outline-none">
          <Filter size={14} />
          Type
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm overflow-hidden overflow-x-auto underline decoration-transparent">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Modifier Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Price Design</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Linked Items</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Type Mapping</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredModifiers.map((mod) => (
              <tr key={mod.id} className="hover:bg-slate-50/50 transition-colors underline decoration-transparent">
                <td className="px-6 py-4">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{mod.name}</span>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-blue-600 tracking-tighter">+₹{mod.price}</td>
                <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest tracking-tighter">{mod.items} Active Links</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-sm text-[8px] font-black uppercase tracking-widest">{mod.type}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 underline decoration-transparent">
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
        title={editingModifier ? 'Update Modifier' : 'Register Modifier'}
        subtitle="Add-on Logic & Customization Protocols"
        onSubmit={handleSave}
      >
        <div className="space-y-4 underline decoration-transparent">
          <div className="space-y-2 underline decoration-transparent">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modifier Designation</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. EXTRA CHEESE"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 underline decoration-transparent">
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Surcharge (INR)</label>
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type Protocol</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Add-on">Add-on Asset</option>
                <option value="Upgrade">Upgrade Path</option>
                <option value="Dietary">Dietary Override</option>
                <option value="Size">Dimensional Shift</option>
              </select>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
