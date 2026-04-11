
import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, Leaf, Flame, MoreVertical, Edit2, Trash2, Tag, Save, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';
import { usePos } from '../../../pos/context/PosContext';

export default function MenuItems() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { variantGroups, dishVariants, assignVariantsToDish } = usePos();

  const [items, setItems] = useState([]);

  // Fetch and parse CSV data
  useEffect(() => {
    const fetchCSV = async () => {
      try {
        const response = await fetch('/data/mama franky menu.csv');
        const text = await response.text();
        const lines = text.split('\n');
        
        if (lines.length < 2) return;

        const parseRow = (row) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const csvItems = [];
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const row = parseRow(line);
          if (row.length < 11) continue;

          const name = row[0].replace(/^"|"$/g, '');
          const category = row[8].replace(/^"|"$/g, '') || 'General';
          const price = parseFloat(row[10]) || 0;
          const code = row[3].replace(/^"|"$/g, '') || '';
          const isVeg = (row[11] || '').toLowerCase().includes('veg') && !(row[11] || '').toLowerCase().includes('non-veg');

          csvItems.push({
            id: `csv-${i}`,
            name: name,
            price: price,
            category: category,
            code: code,
            isVeg: isVeg,
            spiceLevel: 0,
            image: ''
          });
        }
        setItems(csvItems);
      } catch (error) {
        console.error('Error loading menu CSV:', error);
      }
    };
    fetchCSV();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Main Course',
    code: '',
    isVeg: true,
    spiceLevel: 0,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200',
    variants: []
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
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200',
        variants: []
      });
    }

    if (item) {
       setFormData(prev => ({ ...prev, variants: dishVariants[item.id] || [] }));
    }
    
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const dishId = editingItem ? editingItem.id : Date.now();

    if (editingItem) {
      setItems(items.map(i => i.id === dishId ? { ...formData, id: dishId } : i));
    } else {
      setItems([...items, { ...formData, id: dishId }]);
    }

    // Save variant mappings to Context
    assignVariantsToDish(dishId, formData.variants || []);

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
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="px-2 py-0.5 bg-white rounded-sm border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-400">
                  #{item.code}
                </div>
                {item.isVeg && (
                  <div className="p-1.5 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center">
                    <Leaf size={10} className="text-emerald-500" />
                  </div>
                )}
              </div>
              <div className="p-4 bg-white">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight line-clamp-1">{item.name}</h4>
                  <span className="text-[10px] font-black text-blue-600">₹{item.price}</span>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">{item.category}</p>
                <div className="flex items-center gap-2 transition-all duration-300">
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
                <div className="w-10 h-10 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                   <ImageIcon size={16} />
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
                value={formData.price === 0 ? '' : formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
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

          <div className="pt-4 border-t border-slate-100 space-y-4">
             <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Tag size={12} /> Assign Variant Groups
                </label>
             </div>
             
             {variantGroups.length === 0 ? (
                <div className="text-[10px] font-bold text-slate-400 italic bg-slate-50 p-4 rounded-sm border border-slate-100/50">
                   No variant groups defined. Create them in System Settings > Variant Master.
                </div>
             ) : (
                <div className="space-y-3">
                   {variantGroups.map(group => {
                      const assignment = formData.variants?.find(v => v.groupId === group.id);
                      const isAssigned = !!assignment;
                      
                      return (
                         <div key={group.id} className={`p-3 border rounded-sm transition-all ${isAssigned ? 'border-slate-900 bg-slate-50' : 'border-slate-100 bg-slate-50/50'}`}>
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <input 
                                     type="checkbox" 
                                     checked={isAssigned}
                                     onChange={(e) => {
                                        if (e.target.checked) {
                                           setFormData({ ...formData, variants: [...(formData.variants || []), { groupId: group.id, required: false }] });
                                        } else {
                                           setFormData({ ...formData, variants: formData.variants.filter(v => v.groupId !== group.id) });
                                        }
                                     }}
                                     className="w-4 h-4 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900"
                                  />
                                  <span className={`text-[11px] font-black uppercase ${isAssigned ? 'text-slate-900' : 'text-slate-400'}`}>{group.name}</span>
                               </div>
                               
                               {isAssigned && (
                                  <div className="flex items-center gap-2">
                                     <span className="text-[9px] font-bold text-slate-400 uppercase">Required?</span>
                                     <button 
                                        type="button"
                                        onClick={() => {
                                           setFormData({
                                              ...formData,
                                              variants: formData.variants.map(v => v.groupId === group.id ? { ...v, required: !v.required } : v)
                                           });
                                        }}
                                        className={`w-8 h-4 rounded-full transition-all relative ${assignment.required ? 'bg-slate-900' : 'bg-slate-300'}`}
                                     >
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${assignment.required ? 'right-0.5' : 'left-0.5'}`} />
                                     </button>
                                  </div>
                               )}
                            </div>
                         </div>
                      );
                   })}
                </div>
             )}
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
