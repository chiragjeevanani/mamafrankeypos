
import React, { useState } from 'react';
import { Box, Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, AlertCircle, Edit2, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';

export default function StockManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [stock, setStock] = useState([
    { id: 1, name: 'Truffle Oil (5L)', quantity: 12, unit: 'Ltrs', minLevel: 15, category: 'Oils & Fats', price: 45000 },
    { id: 2, name: 'Basmati Rice', quantity: 4, unit: 'Kgs', minLevel: 50, category: 'Dry Grocery', price: 12000 },
    { id: 3, name: 'Chicken Breast (Frozen)', quantity: 25, unit: 'Kgs', minLevel: 10, category: 'Meat & Poultry', price: 18000 },
    { id: 4, name: 'Heavy Cream', quantity: 8, unit: 'Ltrs', minLevel: 15, category: 'Dairy', price: 4200 },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'Kgs',
    minLevel: '',
    category: 'Dry Grocery'
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ name: '', quantity: '', unit: 'Kgs', minLevel: '', category: 'Dry Grocery' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingItem) {
      setStock(stock.map(s => s.id === editingItem.id ? { ...formData, id: s.id } : s));
    } else {
      setStock([...stock, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('PROTOCOL: Proceed with record termination?')) {
      setStock(stock.filter(s => s.id !== id));
    }
  };

  const filteredStock = stock.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between underline decoration-transparent">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Stock Logic</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 underline decoration-transparent">Real-time Inventory Equilibrium</p>
        </div>
        <div className="flex items-center gap-3 underline decoration-transparent">
          <button className="h-10 px-6 border border-slate-200 text-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all outline-none">
            <ArrowUpRight size={14} />
            Procure Stock
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none"
          >
            <Plus size={14} />
            Audit Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 underline decoration-transparent">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-sm underline decoration-transparent">
          <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2 underline decoration-transparent underline decoration-transparent">Optimal Inventory</div>
          <div className="text-2xl font-black text-emerald-900 tracking-tighter underline decoration-transparent">{stock.length + 138} SKUs</div>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-sm underline decoration-transparent">
          <div className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2 underline decoration-transparent underline decoration-transparent">Low Threshold Alerts</div>
          <div className="text-2xl font-black text-amber-900 tracking-tighter underline decoration-transparent">{stock.filter(s => s.quantity < s.minLevel).length} Items</div>
        </div>
        <div className="bg-red-50 border border-red-100 p-6 rounded-sm underline decoration-transparent">
          <div className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-2 underline decoration-transparent underline decoration-transparent">Out of Stock Protocol</div>
          <div className="text-2xl font-black text-red-900 tracking-tighter underline decoration-transparent">04 Items</div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-4 flex gap-4 underline decoration-transparent">
        <div className="relative flex-1 group underline decoration-transparent">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="FILTER STOCK REGISTRY..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none underline decoration-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="h-10 px-4 border border-slate-100 text-slate-500 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 outline-none">
          <Filter size={14} />
          Protocol
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm overflow-hidden overflow-x-auto underline decoration-transparent">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Item Designation</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Current Level</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Minimum Capacity</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStock.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors underline decoration-transparent group">
                <td className="px-6 py-4">
                  <div className="flex flex-col underline decoration-transparent">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.name}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 underline decoration-transparent">{item.category}</span>
                  </div>
                </td>
                <td className="px-6 py-4 underline decoration-transparent">
                  <span className={`text-xs font-black ${item.quantity < item.minLevel ? 'text-amber-500 animate-pulse' : 'text-slate-900'}`}>{item.quantity} {item.unit}</span>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-slate-500 tracking-tighter underline decoration-transparent">{item.minLevel} {item.unit}</td>
                <td className="px-6 py-4 text-right underline decoration-transparent">
                  <div className="flex items-center justify-end gap-2 underline decoration-transparent">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all underline decoration-transparent">
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="p-1.5 hover:bg-slate-100 rounded-sm outline-none"
                      ><Edit2 size={12} /></button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-sm outline-none"
                      ><Trash2 size={12} /></button>
                    </div>
                    {item.quantity < item.minLevel ? (
                      <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-sm underline decoration-transparent">
                        <AlertCircle size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest underline decoration-transparent">Low Level</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-sm underline decoration-transparent">
                        <span className="text-[8px] font-black uppercase tracking-widest underline decoration-transparent">Synchronized</span>
                      </div>
                    )}
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
        title={editingItem ? 'Update Audit' : 'Inventory Audit Entry'}
        subtitle="Real-time Asset Synchronization Protocol"
        onSubmit={handleSave}
      >
        <div className="space-y-4 underline decoration-transparent">
          <div className="space-y-2 underline decoration-transparent">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Designation</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. TRUFFLE OIL (5L)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 underline decoration-transparent">
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Quantum</label>
              <input 
                type="number" 
                required
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                placeholder="0"
              />
            </div>
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Measurement Unit</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
              >
                <option value="Kgs">Kilograms (Kgs)</option>
                <option value="Ltrs">Liters (Ltrs)</option>
                <option value="Units">Units (Pcs)</option>
                <option value="Boxes">Bulk Boxes</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 underline decoration-transparent">
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Low Threshold Level</label>
              <input 
                type="number" 
                required
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.minLevel}
                onChange={(e) => setFormData({...formData, minLevel: e.target.value})}
                placeholder="Minimum level for alert"
              />
            </div>
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Category</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Dry Grocery">Dry Grocery</option>
                <option value="Oils & Fats">Oils & Fats</option>
                <option value="Meat & Poultry">Meat & Poultry</option>
                <option value="Dairy">Dairy & Produce</option>
              </select>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
