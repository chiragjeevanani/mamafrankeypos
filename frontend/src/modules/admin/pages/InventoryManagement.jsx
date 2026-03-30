
import React, { useState } from 'react';
import { 
  Box, Search, Plus, Filter, AlertTriangle, 
  ArrowDownCircle, ArrowUpCircle, Trash2, Edit3, 
  History, Receipt, TrendingDown, X, Save,
  CheckCircle2, Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_INVENTORY = [
  { id: 1, name: 'Paneer (Fresh)', stock: 12.5, unit: 'kg', minLevel: 5, category: 'Dairy', status: 'normal' },
  { id: 2, name: 'Tandoori Masala', stock: 2.1, unit: 'kg', minLevel: 10, category: 'Spices', status: 'low' },
  { id: 3, name: 'Basmati Rice', stock: 45, unit: 'kg', minLevel: 20, category: 'Grains', status: 'normal' },
  { id: 4, name: 'Refined Oil', stock: 15, unit: 'L', minLevel: 30, category: 'Oils', status: 'low' },
  { id: 5, name: 'Tomatoes', stock: 8, unit: 'kg', minLevel: 15, category: 'Vegetables', status: 'low' },
  { id: 6, name: 'Chicken Breast', stock: 25, unit: 'kg', minLevel: 10, category: 'Meat', status: 'normal' },
];

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState('stock');
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    stock: '',
    unit: 'kg',
    minLevel: '',
    category: 'Dairy',
    status: 'normal'
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        stock: '',
        unit: 'kg',
        minLevel: '',
        category: 'Dairy',
        status: 'normal'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const status = parseFloat(formData.stock) <= parseFloat(formData.minLevel) ? 'low' : 'normal';
    const finalData = { ...formData, status };

    if (editingItem) {
      setInventory(inventory.map(i => i.id === editingItem.id ? { ...finalData, id: i.id } : i));
    } else {
      setInventory([...inventory, { ...finalData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('INVENTORY PROTOCOL: Purge this ingredient record? This cannot be undone.')) {
      setInventory(inventory.filter(i => i.id !== id));
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar max-h-full">
       <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Inventory Control Center</h1>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Stock monitoring, wastage tracking, and recipe mapping</p>
        </div>
        <div className="flex bg-white p-1 border border-slate-200 rounded-sm">
           <button 
             onClick={() => setActiveTab('stock')}
             className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all ${activeTab === 'stock' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}
           >
              Active Stock
           </button>
           <button 
             onClick={() => setActiveTab('wastage')}
             className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all ${activeTab === 'wastage' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}
           >
              Wastage Logs
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <div className="flex items-center justify-between mb-2">
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Low Stock Items</span>
               <AlertTriangle size={14} className="text-orange-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
               {inventory.filter(i => i.status === 'low').length.toString().padStart(2, '0')} Items
            </h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Action required immediately</p>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <div className="flex items-center justify-between mb-2">
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Monthly Usage</span>
               <ArrowUpCircle size={14} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900">₹1,24,500</h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">+5.2% from last month</p>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <div className="flex items-center justify-between mb-2">
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Wastage</span>
               <TrendingDown size={14} className="text-red-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900">₹8,420</h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">3.1% of total inventory</p>
         </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm overflow-hidden shadow-sm">
         <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
               <div className="max-w-xs w-full relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input type="text" placeholder="Search ingredients..." className="w-full bg-slate-50 border border-slate-100 py-1.5 pl-9 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-slate-900/10 transition-all placeholder:text-slate-300" />
               </div>
            </div>
            <div className="flex items-center gap-2">
               <button className="h-8 px-3 border border-slate-200 text-slate-900 rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
                  <Receipt size={12} />
                  Log Purchase
               </button>
               <button 
                 onClick={() => handleOpenModal()}
                 className="h-8 px-3 bg-slate-900 text-white rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
               >
                  <Plus size={12} />
                  Add New Item
               </button>
            </div>
         </div>
         
         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Ingredient Name</th>
                     <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Category</th>
                     <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Stock Status</th>
                     <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Qty in Hand</th>
                     <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Min Level</th>
                     <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Operations</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {inventory.map(item => (
                     <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                           <span className="text-[11px] font-black uppercase text-slate-900 leading-tight">{item.name}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-sm">{item.category}</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'low' ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`} />
                              <span className={`text-[9px] font-black uppercase tracking-widest ${item.status === 'low' ? 'text-orange-600' : 'text-emerald-600'}`}>{item.status}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className={`text-[11px] font-black ${item.status === 'low' ? 'text-orange-600' : 'text-slate-900'}`}>{item.stock} {item.unit}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className="text-[10px] font-bold text-slate-400">{item.minLevel} {item.unit}</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleOpenModal(item)}
                                className="p-1.5 text-slate-300 hover:text-slate-900 hover:bg-white rounded-sm transition-all border border-transparent hover:border-slate-100"
                              ><Edit3 size={12} /></button>
                              <button className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-white rounded-sm transition-all border border-transparent hover:border-slate-100"><History size={12} /></button>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-white rounded-sm transition-all border border-transparent hover:border-slate-100"
                              ><Trash2 size={12} /></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Inventory Item Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-sm shadow-2xl relative overflow-hidden flex flex-col"
            >
               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-slate-900 text-white rounded-sm flex items-center justify-center">
                        <Box size={16} />
                     </div>
                     <div>
                        <h3 className="text-[13px] font-black uppercase tracking-tight text-slate-900">
                           {editingItem ? 'Update Stock Registry' : 'Initialize Stock Item'}
                        </h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Control Protocol v2.4.0</p>
                     </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={18} /></button>
               </div>

               <form onSubmit={handleSave} className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingredient Designation</label>
                        <input 
                           type="text" 
                           required
                           className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           placeholder="e.g. FRESH BASMATI RICE"
                        />
                     </div>
                     
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Unit</label>
                        <select 
                           className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={formData.category}
                           onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                           <option>Dairy</option>
                           <option>Spices</option>
                           <option>Grains</option>
                           <option>Vegetables</option>
                           <option>Meat</option>
                           <option>Oils</option>
                        </select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Measurement Unit</label>
                        <select 
                           className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={formData.unit}
                           onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        >
                           <option>kg</option>
                           <option>L</option>
                           <option>units</option>
                           <option>g</option>
                        </select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Hand Stock</label>
                        <div className="relative">
                           <Scale size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input 
                              type="number" 
                              step="0.1"
                              required
                              className="w-full bg-slate-50 border border-slate-100 py-2 pl-9 pr-4 text-[11px] font-bold outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                              value={formData.stock}
                              onChange={(e) => setFormData({...formData, stock: e.target.value})}
                              placeholder="0.0"
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Minimum Threshold</label>
                        <input 
                           type="number" 
                           step="0.1"
                           required
                           className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={formData.minLevel}
                           onChange={(e) => setFormData({...formData, minLevel: e.target.value})}
                           placeholder="LOW STOCK POINT"
                        />
                     </div>
                  </div>

                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-sm flex items-center gap-3">
                     <CheckCircle2 size={16} className="text-emerald-500" />
                     <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest leading-relaxed">
                        Automatic reconciliation policy is active for this stock item.
                     </p>
                  </div>

                  <div className="pt-6 flex items-center gap-3">
                     <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm"
                     >Cancel</button>
                     <button 
                        type="submit"
                        className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                     >
                        <Save size={14} />
                        Save Record
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
