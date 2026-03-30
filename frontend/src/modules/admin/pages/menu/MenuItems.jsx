
import React, { useState } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, Leaf, Flame, MoreVertical, Edit2, Trash2, Tag, Save, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';

export default function MenuItems() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [items, setItems] = useState([
    { id: 1, name: 'Truffle Mushroom Risotto', price: 549, category: 'Main Course', code: 'M101', isVeg: true, spiceLevel: 0, image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=2070&auto=format&fit=crop' },
    { id: 2, name: 'Spicy Peri Peri Wings', price: 389, category: 'Starters', code: 'S204', isVeg: false, spiceLevel: 3, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=2070&auto=format&fit=crop' },
    { id: 3, name: 'Vibrant Summer Salad', price: 299, category: 'Salads', code: 'SL05', isVeg: true, spiceLevel: 1, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop' },
    { id: 4, name: 'Belgian Chocolate Fondue', price: 449, category: 'Desserts', code: 'D402', isVeg: true, spiceLevel: 0, image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=2144&auto=format&fit=crop' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Main Course',
    code: '',
    isVeg: true,
    spiceLevel: 0,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        price: '',
        category: 'Main Course',
        code: `ITEM-${items.length + 101}`,
        isVeg: true,
        spiceLevel: 0,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...formData, id: i.id } : i));
    } else {
      setItems([...items, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('PROTOCOL: Proceed with record termination?')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Menu Items</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Catalog Inventory & Pricing</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none"
        >
          <Plus size={14} />
          Append New Item
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-4 flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full lg:w-auto overflow-hidden underline decoration-transparent">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="SEARCH CATALOGED ITEMS..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none underline decoration-transparent"
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
          <button className="flex-1 lg:flex-none h-10 px-4 bg-white border border-slate-100 text-slate-500 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover/bg-slate-50 outline-none">
            <Filter size={14} />
            Category
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-3'}>
        {filteredItems.map((item) => (
          viewMode === 'grid' ? (
            <motion.div 
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-slate-100 rounded-sm overflow-hidden shadow-sm group relative"
            >
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden underline decoration-transparent">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-sm border border-slate-100 text-[8px] font-black uppercase tracking-widest">
                  #{item.code}
                </div>
                {item.isVeg && (
                  <div className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                    <Leaf size={12} className="text-emerald-500" />
                  </div>
                )}
              </div>
              <div className="p-4 bg-white">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight line-clamp-1">{item.name}</h4>
                  <span className="text-[10px] font-black text-blue-600">₹{item.price}</span>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">{item.category}</p>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={() => handleOpenModal(item)}
                    className="flex-1 py-1.5 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-sm hover/bg-slate-800 outline-none"
                  >Edit Item</button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 border border-slate-100 rounded-sm hover/text-red-500 group-hover:border-slate-200 transition-colors outline-none"
                  ><Trash2 size={12} /></button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div key={item.id} className="bg-white border border-slate-100 p-3 rounded-sm flex items-center justify-between hover:shadow-md transition-all group underline decoration-transparent">
              <div className="flex items-center gap-4 underline decoration-transparent">
                <div className="w-12 h-12 rounded-sm overflow-hidden bg-slate-100 border border-slate-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5 underline decoration-transparent">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">CODE: {item.code}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{item.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 underline decoration-transparent">
                <div className="text-right underline decoration-transparent">
                  <div className="text-[10px] font-black text-blue-600">₹{item.price}</div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest tracking-tighter underline decoration-transparent">Gross Price</div>
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
      >
        <div className="space-y-6 underline decoration-transparent">
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
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Main Course">Main Course</option>
                <option value="Starters">Starters</option>
                <option value="Salads">Salads</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry Code</label>
              <input 
                type="text" 
                className="w-full bg-slate-100 border border-slate-200 p-3 text-[11px] font-bold uppercase outline-none rounded-sm cursor-not-allowed"
                value={formData.code}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spice Metric</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.spiceLevel}
                onChange={(e) => setFormData({...formData, spiceLevel: parseInt(e.target.value)})}
              >
                <option value={0}>0 - NONE</option>
                <option value={1}>1 - MILD</option>
                <option value={2}>2 - MEDIUM</option>
                <option value={3}>3 - HIGH</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-4 border border-slate-100 rounded-sm">
            <div className="flex items-center gap-3">
              <Leaf size={16} className={formData.isVeg ? "text-emerald-500" : "text-slate-300"} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Vegetarian Protocol</span>
            </div>
            <button 
              type="button"
              onClick={() => setFormData({...formData, isVeg: !formData.isVeg})}
              className={`w-10 h-5 rounded-full transition-all relative ${formData.isVeg ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isVeg ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
