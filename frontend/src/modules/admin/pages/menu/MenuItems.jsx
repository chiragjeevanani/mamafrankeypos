
import React, { useState, useRef } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, Leaf, Flame, MoreVertical, Edit2, Trash2, Tag, Save, Image as ImageIcon, AlertCircle, Upload, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';
import { usePos } from '../../../pos/context/PosContext';

export default function MenuItems() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const fileInputRef = useRef(null);

  const { 
    menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem, 
    bulkUpdateMenuItems, variantGroups, bulkUploadMenu 
  } = usePos();
  const availableCategories = categories.filter(c => c.id !== 'fav');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    shortCode: '',
    type: 'veg',
    image: '',
    status: 'Available',
    variantGroups: []
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: item.catId,
        shortCode: item.code,
        type: item.type || 'veg',
        image: item.image || '',
        status: item.status || 'Available',
        variantGroups: item.variantGroups || []
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: availableCategories[0]?.id || '',
        shortCode: `ITEM-${menuItems.length + 101}`,
        type: 'veg',
        image: '',
        status: 'Available',
        variantGroups: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('shortCode', formData.shortCode);
      data.append('type', formData.type);
      data.append('status', formData.status);
      data.append('variantGroups', JSON.stringify(formData.variantGroups));
      
      // If we have variant groups assigned, we need to pass them
      // For now, simplicity: we just pass the names/ids if needed
      // But the model expects variantGroups: [variantGroupSchema]
      // Let's just pass the data as is for now
      
      if (editingItem) {
        await updateMenuItem(editingItem.id, data);
      } else {
        await addMenuItem(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Error saving menu item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('PROTOCOL: Proceed with record termination?')) {
      try {
        await deleteMenuItem(id);
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item.');
      }
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsSaving(true);
      await bulkUploadMenu(file);
      alert('Bulk upload successful.');
    } catch (error) {
      console.error('Bulk upload error:', error);
      alert('Bulk upload failed.');
    } finally {
      setIsSaving(false);
      e.target.value = null;
    }
  };
  
  const handleAddVariantGroup = () => {
    setFormData(prev => ({
      ...prev,
      variantGroups: [
        ...prev.variantGroups,
        { name: '', type: 'Add-on', options: [{ name: '', price: '' }] }
      ]
    }));
  };

  const handleUpdateVariantGroup = (groupIndex, field, value) => {
    setFormData(prev => {
      const newGroups = [...prev.variantGroups];
      newGroups[groupIndex] = { ...newGroups[groupIndex], [field]: value };
      return { ...prev, variantGroups: newGroups };
    });
  };

  const handleRemoveVariantGroup = (groupIndex) => {
    setFormData(prev => ({
      ...prev,
      variantGroups: prev.variantGroups.filter((_, i) => i !== groupIndex)
    }));
  };

  const handleAddVariantOption = (groupIndex) => {
    setFormData(prev => {
      const newGroups = [...prev.variantGroups];
      newGroups[groupIndex].options.push({ name: '', price: '' });
      return { ...prev, variantGroups: newGroups };
    });
  };

  const handleUpdateVariantOption = (groupIndex, optionIndex, field, value) => {
    setFormData(prev => {
      const newGroups = [...prev.variantGroups];
      newGroups[groupIndex].options[optionIndex] = { 
        ...newGroups[groupIndex].options[optionIndex], 
        [field]: value 
      };
      return { ...prev, variantGroups: newGroups };
    });
  };

  const handleRemoveVariantOption = (groupIndex, optionIndex) => {
    setFormData(prev => {
      const newGroups = [...prev.variantGroups];
      newGroups[groupIndex].options = newGroups[groupIndex].options.filter((_, i) => i !== optionIndex);
      return { ...prev, variantGroups: newGroups };
    });
  };

  const handleToggleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = async (status) => {
    try {
      setIsSaving(true);
      await bulkUpdateMenuItems(selectedItems, { status });
      setSelectedItems([]);
    } catch (error) {
      alert('Bulk update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = menuItems.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         i.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || i.catId === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (catId) => {
    return categories.find(c => c.id === catId)?.name || 'General';
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Menu Items</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Catalog Inventory & Pricing</p>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleBulkUpload} 
            accept=".csv" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="h-10 px-6 bg-white border border-slate-200 text-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all outline-none"
          >
            <Upload size={14} />
            Bulk Import CSV
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none"
          >
            <Plus size={14} />
            Append New Item
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-4 flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full lg:w-auto overflow-hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="SEARCH CATALOGED ITEMS..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center border border-slate-100 rounded-sm p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-sm transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
            >
              <List size={14} />
            </button>
          </div>
          <select 
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="flex-1 lg:flex-none h-10 px-4 bg-white border border-slate-100 text-slate-500 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center justify-center outline-none cursor-pointer"
          >
            <option value="all">ALL CATEGORIES</option>
            {availableCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-3'}>
        {filteredItems.length === 0 && (
          <div className="col-span-full bg-white border border-slate-100 rounded-sm p-12 text-center text-slate-400">
            <p className="text-[11px] font-black uppercase tracking-[0.2em]">No menu items found</p>
          </div>
        )}
        {filteredItems.map((item) => (
          viewMode === 'grid' ? (
            <motion.div 
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-slate-100 rounded-sm overflow-hidden shadow-sm group relative"
            >
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="px-2 py-0.5 bg-white rounded-sm border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-400">
                  #{item.code}
                </div>
                <input 
                  type="checkbox" 
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleToggleSelectItem(item.id)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                {item.type === 'veg' && (
                  <div className="p-1.5 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center">
                    <Leaf size={10} className="text-emerald-500" />
                  </div>
                )}
                {item.type === 'non-veg' && (
                  <div className="p-1.5 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center">
                    <Flame size={10} className="text-rose-500" />
                  </div>
                )}
              </div>
              <div className="p-4 bg-white">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight line-clamp-1">{item.name}</h4>
                  <span className="text-[10px] font-black text-blue-600">₹{item.price}</span>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">{getCategoryName(item.catId)}</p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenModal(item)}
                    className="flex-1 py-1.5 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-sm hover:bg-slate-800 outline-none"
                  >Edit</button>
                  <button 
                    onClick={async () => {
                      const newStatus = item.status === 'Available' ? 'Out of Stock' : 'Available';
                      const data = new FormData();
                      data.append('status', newStatus);
                      await updateMenuItem(item.id, data);
                    }}
                    className={`flex-1 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-sm border outline-none transition-colors ${
                      item.status === 'Available' ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-red-100 bg-red-50 text-red-600'
                    }`}
                  >
                    {item.status === 'Available' ? 'Available' : 'Sold Out'}
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 border border-slate-100 rounded-sm hover:text-red-500 group-hover:border-slate-200 transition-colors outline-none"
                  ><Trash2 size={12} /></button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div key={item.id} className="bg-white border border-slate-100 p-3 rounded-sm flex items-center justify-between hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 overflow-hidden">
                   {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <ImageIcon size={16} />}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CODE: {item.code}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{getCategoryName(item.catId)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[10px] font-black text-blue-600">₹{item.price}</div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Gross Price</div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleOpenModal(item)}
                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors outline-none"
                  ><Edit2 size={14} /></button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors outline-none"
                  ><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Update Item Protocol' : 'Initialize New Item'}
        subtitle="Catalog Inventory & Pricing Management"
        onSubmit={handleSave}
        isSaving={isSaving}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Designation</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. TRUFFLE RISOTTO"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
            <textarea
              rows="3"
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Short internal or menu-facing description"
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Unit</label>
              <select 
                required
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select category</option>
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry Code</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.shortCode}
                onChange={(e) => setFormData({...formData, shortCode: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Status</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dietary Type</label>
            <select 
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="veg">VEGETARIAN</option>
              <option value="non-veg">NON-VEGETARIAN</option>
              <option value="egg">EGG-BASED</option>
            </select>
          </div>

          {/* In-Line Variant Groups Builder */}
          <div className="pt-6 border-t border-slate-100 space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex flex-col">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Tag size={12} className="text-blue-600" /> Item Modifiers / Variants
                   </label>
                   <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Define custom options for this item</p>
                </div>
                <button 
                  type="button"
                  onClick={handleAddVariantGroup}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-sm border border-blue-100 hover:bg-blue-100 transition-all flex items-center gap-1.5"
                >
                   <Plus size={10} strokeWidth={4} /> Add Group
                </button>
             </div>
             
             {formData.variantGroups.length === 0 ? (
                <div className="text-[10px] font-bold text-slate-400 italic bg-slate-50 p-6 rounded-sm border border-slate-100/50 text-center">
                   No custom modifiers defined for this item. Click "Add Group" to begin.
                </div>
             ) : (
                <div className="space-y-6">
                  {formData.variantGroups.map((group, gIdx) => (
                    <div key={gIdx} className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-4 relative group/v">
                      <button 
                        type="button"
                        onClick={() => handleRemoveVariantGroup(gIdx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-100 rounded-full flex items-center justify-center shadow-sm transition-all"
                      >
                         <Trash2 size={10} />
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Group Name</label>
                          <input 
                            type="text"
                            placeholder="E.G. CHOICE OF SAUCE"
                            className="w-full bg-white border border-slate-200 p-2 text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                            value={group.name}
                            onChange={(e) => handleUpdateVariantGroup(gIdx, 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                          <select 
                            className="w-full bg-white border border-slate-200 p-2 text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                            value={group.type}
                            onChange={(e) => handleUpdateVariantGroup(gIdx, 'type', e.target.value)}
                          >
                            <option value="Add-on">ADD-ON</option>
                            <option value="Upgrade">UPGRADE</option>
                            <option value="Size">SIZE</option>
                            <option value="Dietary">DIETARY</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Options & Pricing</label>
                          <button 
                            type="button"
                            onClick={() => handleAddVariantOption(gIdx)}
                            className="text-[8px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                          >+ Add Option</button>
                        </div>
                        
                        <div className="space-y-2">
                          {group.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2">
                              <input 
                                type="text"
                                placeholder="OPTION NAME"
                                className="flex-1 bg-white border border-slate-200 p-2 text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                value={opt.name}
                                onChange={(e) => handleUpdateVariantOption(gIdx, oIdx, 'name', e.target.value)}
                              />
                              <div className="relative w-24">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">₹</span>
                                <input 
                                  type="number"
                                  placeholder="0"
                                  className="w-full bg-white border border-slate-200 p-2 pl-5 text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                  value={opt.price}
                                  onChange={(e) => handleUpdateVariantOption(gIdx, oIdx, 'price', e.target.value)}
                                />
                              </div>
                              <button 
                                type="button"
                                onClick={() => handleRemoveVariantOption(gIdx, oIdx)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             )}
          </div>
        </div>
      </AdminModal>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-sm shadow-2xl z-50 flex items-center gap-8 border border-white/10"
          >
             <div className="flex items-center gap-2 pr-8 border-r border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest">{selectedItems.length} Items Selected</span>
                <button 
                 onClick={() => setSelectedItems([])}
                 className="text-[10px] font-bold text-slate-400 hover:text-white"
                >Clear</button>
             </div>
             <div className="flex items-center gap-4">
                <button 
                 onClick={() => handleBulkStatusUpdate('Available')}
                 className="text-[10px] font-black uppercase tracking-widest hover:text-emerald-400 transition-colors"
                >Mark Available</button>
                <button 
                 onClick={() => handleBulkStatusUpdate('Out of Stock')}
                 className="text-[10px] font-black uppercase tracking-widest hover:text-orange-400 transition-colors"
                >Mark Sold Out</button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
