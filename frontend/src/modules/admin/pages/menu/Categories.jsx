
import React, { useState } from 'react';
import { Utensils, Search, Plus, Filter, MoreVertical, Edit2, Trash2, ChevronRight, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Main Course', items: 24, icon: 'Utensils', status: 'Active' },
    { id: 2, name: 'Beverages', items: 15, icon: 'Beer', status: 'Active' },
    { id: 3, name: 'Desserts', items: 12, icon: 'IceCream', status: 'Active' },
    { id: 4, name: 'Starters', items: 18, icon: 'Soup', status: 'Active' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    status: 'Active',
    icon: 'Utensils'
  });

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, status: category.status, icon: category.icon });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', status: 'Active', icon: 'Utensils' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...formData } : c));
    } else {
      setCategories([...categories, { ...formData, id: Date.now(), items: 0 }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('PROTOCOL: Proceed with record termination?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 underline decoration-transparent">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Categories</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 underline decoration-transparent">Catalog Structure & Designation</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none"
        >
          <Plus size={14} />
          Create New Category
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-2 flex flex-col md:flex-row items-center gap-4 underline decoration-transparent">
        <div className="relative flex-1 group underline decoration-transparent">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="FILTER CATEGORIES..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-slate-900/10 transition-all outline-none underline decoration-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="h-10 px-4 bg-white border border-slate-100 text-slate-500 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all outline-none">
          <Filter size={14} />
          Designation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((cat) => (
          <motion.div 
            key={cat.id}
            whileHover={{ y: -4 }}
            className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm hover:border-slate-300 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:scale-110" />
            
            <div className="relative z-10 underline decoration-transparent">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-sm flex items-center justify-center mb-4 shadow-lg shadow-slate-900/10">
                <Utensils size={24} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{cat.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 underline decoration-transparent">{cat.items} Items Linked</p>
              
              <div className="flex items-center justify-between border-t border-slate-50 pt-4 underline decoration-transparent">
                <div className="flex items-center gap-2 underline decoration-transparent">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${cat.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-[8px] font-black text-slate-900 uppercase tracking-widest underline decoration-transparent">{cat.status}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => handleOpenModal(cat)}
                    className="p-1.5 hover:bg-slate-50 rounded-sm transition-colors outline-none"
                  ><Edit2 size={12} /></button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-sm transition-colors outline-none"
                  ><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Update Category' : 'Initialize Category'}
        subtitle="Catalog Structure & Hierarchy Protocol"
        onSubmit={handleSave}
      >
        <div className="space-y-4 underline decoration-transparent">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Designation</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. STARTERS"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Protocol</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Active">Operational</option>
                <option value="Inactive">Decommissioned</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Icon Mapping</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
              >
                <option value="Utensils">General Dining</option>
                <option value="Beer">Beverages</option>
                <option value="IceCream">Desserts</option>
                <option value="Soup">Appetizers</option>
              </select>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
