
import React, { useState } from 'react';
import { ShoppingCart, Plus, Search, Filter, Download, Clock, CheckCircle, XCircle, Edit2, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';

export default function PurchaseOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [orders, setOrders] = useState([
    { id: 1, poNumber: 'PO-2024-001', vendor: 'Premium Grains Co.', amount: 45000, date: '12 MAR 2024', status: 'Delivered' },
    { id: 2, poNumber: 'PO-2024-002', vendor: 'Ocean Fresh Seafood', amount: 82000, date: '14 MAR 2024', status: 'Pending' },
    { id: 3, poNumber: 'PO-2024-003', vendor: 'Valley Farm Dairy', amount: 15400, date: '15 MAR 2024', status: 'Authorized' },
  ]);

  const [formData, setFormData] = useState({
    vendor: 'Premium Grains Co.',
    amount: '',
    status: 'Authorized'
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Authorized': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const handleOpenModal = (order = null) => {
    if (order) {
      setEditingOrder(order);
      setFormData({ vendor: order.vendor, amount: order.amount, status: order.status });
    } else {
      setEditingOrder(null);
      setFormData({ vendor: 'Premium Grains Co.', amount: '', status: 'Authorized' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, ...formData } : o));
    } else {
      setOrders([...orders, { 
        ...formData, 
        id: Date.now(), 
        poNumber: `PO-2024-00${orders.length + 1}`, 
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() 
      }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('PROTOCOL: Proceed with record termination?')) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  const filteredOrders = orders.filter(o => o.vendor.toLowerCase().includes(searchQuery.toLowerCase()) || o.poNumber.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between underline decoration-transparent">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Procurement Registry</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 underline decoration-transparent">Procurement Logic & Authorization</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none"
        >
          <Plus size={14} />
          Initialize New PO
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-2 flex flex-col md:flex-row items-center gap-4 underline decoration-transparent">
        <div className="relative flex-1 group underline decoration-transparent underline decoration-transparent">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="FILTER PURCHASE ORDERS..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none underline decoration-transparent underline decoration-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm overflow-hidden underline decoration-transparent overflow-x-auto underline decoration-transparent">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Order ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Vendor Entity</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Fiscal Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Protocol Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors underline decoration-transparent group">
                <td className="px-6 py-4">
                  <div className="flex flex-col underline decoration-transparent">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight underline decoration-transparent">{order.poNumber}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 underline decoration-transparent">{order.date}</span>
                  </div>
                </td>
                <td className="px-6 py-4 underline decoration-transparent">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest tracking-tighter underline decoration-transparent">{order.vendor}</span>
                </td>
                <td className="px-6 py-4 text-right underline decoration-transparent">
                  <span className="text-xs font-black text-slate-900">₹{order.amount.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 underline decoration-transparent">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(order.status)} underline decoration-transparent`}>
                    {order.status === 'Delivered' && <CheckCircle size={10} />}
                    {order.status === 'Pending' && <Clock size={10} />}
                    {order.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-right underline decoration-transparent">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all underline decoration-transparent">
                    <button 
                      onClick={() => handleOpenModal(order)}
                      className="p-1.5 hover:bg-slate-100 rounded-sm text-slate-400 hover:text-slate-900 outline-none transition-colors"
                    ><Edit2 size={14} /></button>
                    <button 
                      onClick={() => handleDelete(order.id)}
                      className="p-1.5 hover:bg-red-50 rounded-sm text-slate-400 hover:text-red-500 outline-none transition-colors"
                    ><Trash2 size={14} /></button>
                    <button className="p-1.5 hover:bg-slate-100 rounded-sm text-slate-400 hover:text-slate-900 outline-none transition-colors">
                      <Download size={14} />
                    </button>
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
        title={editingOrder ? 'Update Purchase Order' : 'Initialize New PO Protocol'}
        subtitle="Procurement Logic & Fiscal Authorization"
        onSubmit={handleSave}
      >
        <div className="space-y-4 underline decoration-transparent">
          <div className="space-y-2 underline decoration-transparent">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Vendor Unit</label>
            <select 
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.vendor}
              onChange={(e) => setFormData({...formData, vendor: e.target.value})}
            >
              <option value="Premium Grains Co.">Premium Grains Co.</option>
              <option value="Ocean Fresh Seafood">Ocean Fresh Seafood</option>
              <option value="Valley Farm Dairy">Valley Farm Dairy</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 underline decoration-transparent">
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PO Fiscal Value (INR)</label>
              <input 
                type="number" 
                required
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Status</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Authorized">Authorized</option>
                <option value="Pending">Pending Verification</option>
                <option value="Delivered">Delivered & Synchronized</option>
              </select>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
