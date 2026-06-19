
import React, { useState } from 'react';
import { Utensils, Search, Plus, Filter, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';
import { usePos } from '../../../pos/context/PosContext';

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory, menuItems } = usePos();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    status: 'Active'
  });

  const handleOpenModal = (category = null) => {
    setFormError('');
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, status: category.status });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setError('');

    if (!formData.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    try {
      setIsSaving(true);
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('status', formData.status);
      
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
      } else {
        await addCategory(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      setFormError(error.response?.data?.message || 'Unable to save category.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        setError('');
        await deleteCategory(id);
      } catch (error) {
        console.error('Error deleting category:', error);
        setError(error.response?.data?.message || 'Unable to delete category.');
      }
    }
  };

  const getItemCount = (catId) => {
    return menuItems.filter(item => item.catId === catId).length;
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Categories</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Catalog Structure & Designation</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none"
        >
          <Plus size={14} />
          Create New Category
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-sm px-4 py-3 flex items-start gap-3">
          <AlertCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{error}</p>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-sm p-2 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="FILTER CATEGORIES..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-slate-900/10 transition-all outline-none"
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
        {categories.filter(c => c.id !== 'fav' && c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
          <div className="col-span-full bg-white border border-slate-100 rounded-sm p-12 text-center text-slate-400">
            <p className="text-[11px] font-black uppercase tracking-[0.2em]">No categories found</p>
          </div>
        )}
        {categories.filter(c => c.id !== 'fav' && c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((cat) => (
          <motion.div 
            key={cat.id}
            whileHover={{ y: -4 }}
            className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm hover:border-slate-300 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:scale-110" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-sm flex items-center justify-center mb-4 shadow-lg shadow-slate-900/10">
                <Utensils size={24} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{cat.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{getItemCount(cat.id)} Items Linked</p>
              
              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${cat.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-[8px] font-black text-slate-900 uppercase tracking-widest">{cat.status}</span>
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
        title={editingCategory ? 'Update Category' : 'Create Category'}
        subtitle="Menu structure and category hierarchy"
        onSubmit={handleSave}
        isSaving={isSaving}
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-rose-50 border border-rose-100 rounded-sm px-4 py-3 flex items-start gap-3">
              <AlertCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{formError}</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Name</label>
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
