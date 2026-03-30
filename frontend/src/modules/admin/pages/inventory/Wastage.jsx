
import React, { useState } from 'react';
import { Trash2, Plus, Search, Filter, AlertTriangle, TrendingDown, Edit2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';

export default function Wastage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [records, setRecords] = useState([
    { id: 1, item: 'Heavy Cream', quantity: '2 Ltrs', reason: 'Expired', value: 840, date: '15 MAR 2024' },
    { id: 2, item: 'Basmati Rice', quantity: '0.5 Kgs', reason: 'Damaged Container', value: 120, date: '14 MAR 2024' },
    { id: 3, item: 'Ocean Seabass', quantity: '1.2 Kgs', reason: 'Spoilage', value: 2400, date: '12 MAR 2024' },
  ]);

  const [formData, setFormData] = useState({
    item: '',
    quantity: '',
    reason: 'Expired',
    value: ''
  });

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({ item: record.item, quantity: record.quantity, reason: record.reason, value: record.value });
    } else {
      setEditingRecord(null);
      setFormData({ item: '', quantity: '', reason: 'Expired', value: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingRecord) {
      setRecords(records.map(r => r.id === editingRecord.id ? { ...r, ...formData } : r));
    } else {
      setRecords([...records, { 
        ...formData, 
        id: Date.now(), 
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() 
      }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('PROTOCOL: Proceed with record termination?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const filteredRecords = records.filter(r => r.item.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between underline decoration-transparent">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Shrinkage Log</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 underline decoration-transparent">Shrinkage Audit & Loss Mitigation</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="h-10 px-6 bg-red-600 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-900/10 hover:bg-red-700 active:scale-95 transition-all outline-none"
        >
          <Plus size={14} />
          Report New Waste
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 underline decoration-transparent">
        <div className="bg-white border border-slate-100 p-6 rounded-sm flex items-center gap-6 underline decoration-transparent">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-sm flex items-center justify-center underline decoration-transparent">
            <TrendingDown size={24} />
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 underline decoration-transparent">Weekly Fiscal Loss</div>
            <div className="text-2xl font-black text-slate-900 tracking-tighter underline decoration-transparent">₹{records.reduce((acc, r) => acc + Number(r.value), 0).toLocaleString()}.00</div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-sm flex items-center gap-6 underline decoration-transparent">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-sm flex items-center justify-center underline decoration-transparent">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 underline decoration-transparent">Critical Waste Areas</div>
            <div className="text-2xl font-black text-slate-900 tracking-tighter underline decoration-transparent">Perishables (82%)</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm overflow-hidden overflow-x-auto underline decoration-transparent">
        <div className="p-4 border-b border-slate-50 underline decoration-transparent">
          <div className="relative flex-1 group underline decoration-transparent">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH WASTAGE LOGS..."
              className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none underline decoration-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Impacted Item</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Designated Reason</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Loss Value</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Audit Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50/50 transition-colors underline decoration-transparent group">
                <td className="px-6 py-4">
                  <div className="flex flex-col underline decoration-transparent">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight underline decoration-transparent">{record.item}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 underline decoration-transparent">Quant: {record.quantity}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-red-500 uppercase tracking-widest tracking-tighter underline decoration-transparent">{record.reason}</td>
                <td className="px-6 py-4 text-xs font-black text-slate-900 tracking-tighter underline decoration-transparent">₹{record.value}</td>
                <td className="px-6 py-4 text-xs font-bold text-slate-500 text-right underline decoration-transparent">
                  <div className="flex items-center justify-end gap-2 underline decoration-transparent">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all underline decoration-transparent">
                      <button 
                        onClick={() => handleOpenModal(record)}
                        className="p-1.5 hover:bg-slate-100 rounded-sm text-slate-400 hover:text-slate-900 transition-colors outline-none"
                      ><Edit2 size={12} /></button>
                      <button 
                        onClick={() => handleDelete(record.id)}
                        className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-sm text-slate-400 transition-colors outline-none"
                      ><Trash2 size={12} /></button>
                    </div>
                    {record.date}
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
        title={editingRecord ? 'Modify Waste Entry' : 'New Spoilage/Damage Report'}
        subtitle="Shrinkage Audit & Fiscal Loss Inventory"
        onSubmit={handleSave}
        icon={AlertTriangle}
      >
        <div className="space-y-4 underline decoration-transparent">
          <div className="space-y-2 underline decoration-transparent">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Designation</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.item}
              onChange={(e) => setFormData({...formData, item: e.target.value})}
              placeholder="e.g. OCEAN SEABASS"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 underline decoration-transparent">
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantum Lost</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                placeholder="e.g. 1.2 Kgs"
              />
            </div>
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fiscal Value Impact (INR)</label>
              <input 
                type="number" 
                required
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-2 underline decoration-transparent">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shrinkage Protocol Reason</label>
            <select 
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            >
              <option value="Expired">Product Expiration</option>
              <option value="Spoilage">Environmental Spoilage</option>
              <option value="Damaged Container">Containment Failure</option>
              <option value="Production Waste">Operational Inefficiency</option>
            </select>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
