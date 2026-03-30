
import React, { useState } from 'react';
import { ShoppingBag, Search, Filter, Clock, CheckCircle, XCircle, ChevronRight, Eye, Edit2, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';

export default function AllOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  const [orders, setOrders] = useState([
    { id: 'ORD-8821', type: 'Dine-in', items: 4, total: 1240, status: 'Completed', time: '12:45 PM', customer: 'Aryan Sharma' },
    { id: 'ORD-8822', type: 'Takeaway', items: 2, total: 580, status: 'Active', time: '01:10 PM', customer: 'Priya Patel' },
    { id: 'ORD-8823', type: 'Delivery', items: 3, total: 940, status: 'Cancelled', time: '01:15 PM', customer: 'Rahul Verma' },
    { id: 'ORD-8824', type: 'Dine-in', items: 5, total: 2100, status: 'Active', time: '01:20 PM', customer: 'Sonia Khan' },
  ]);

  const [formData, setFormData] = useState({
    status: 'Active'
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'text-emerald-500 bg-emerald-50';
      case 'Active': return 'text-blue-500 bg-blue-50';
      case 'Cancelled': return 'text-red-500 bg-red-50';
      default: return 'text-slate-400 bg-slate-50';
    }
  };

  const handleOpenView = (order) => {
    setViewingOrder(order);
    setFormData({ status: order.status });
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    setOrders(orders.map(o => o.id === viewingOrder.id ? { ...o, ...formData } : o));
    setIsModalOpen(false);
  };

  const handleCancelOrder = (id) => {
    if (window.confirm('PROTOCOL: Proceed with order cancellation?')) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'Cancelled' } : o));
    }
  };

  const filteredOrders = orders.filter(o => o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.type.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 underline decoration-transparent">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Master Order Log</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 underline decoration-transparent">Cross-Channel Operational Flow</p>
        </div>
        <div className="flex items-center gap-2 underline decoration-transparent">
          <div className="px-4 py-2 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10">
            <ShoppingBag size={14} />
            {orders.length} ACTIVE SIGNALS
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-4 flex flex-col md:flex-row gap-4 underline decoration-transparent shadow-sm">
        <div className="relative flex-1 group underline decoration-transparent">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="FILTER ORDERS BY ID, TYPE OR CUSTOMER..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none underline decoration-transparent underline decoration-transparent shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="h-10 px-4 border border-slate-100 text-slate-500 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all outline-none">
          <Filter size={14} />
          Protocol Selection
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm overflow-hidden overflow-x-auto underline decoration-transparent shadow-sm underline decoration-transparent">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Order Signal</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Channel Designation</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Invoice Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Current Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Terminal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-900/5 group transition-all duration-300 underline decoration-transparent">
                <td className="px-6 py-4">
                  <div className="flex flex-col underline decoration-transparent">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors underline decoration-transparent">#{order.id}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 underline decoration-transparent">{order.time} | {order.customer}</span>
                  </div>
                </td>
                <td className="px-6 py-4 underline decoration-transparent">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest tracking-tighter underline decoration-transparent">{order.type} ({order.items} Items)</span>
                </td>
                <td className="px-6 py-4 text-right underline decoration-transparent">
                  <span className="text-xs font-black text-slate-900 tracking-tighter underline decoration-transparent">₹{order.total}</span>
                </td>
                <td className="px-6 py-4 underline decoration-transparent">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest ${getStatusColor(order.status)} underline decoration-transparent`}>
                    {order.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-right underline decoration-transparent">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all underline decoration-transparent">
                    <button 
                      onClick={() => handleOpenView(order)}
                      className="p-2 text-slate-400 hover:text-slate-900 transition-colors outline-none"
                    ><Eye size={16} /></button>
                    {order.status !== 'Cancelled' && (
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors outline-none"
                      ><XCircle size={16} /></button>
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
        title={viewingOrder ? `Audit Order ${viewingOrder.id}` : 'Order Context'}
        subtitle="Protocol Status Override & Flow Audit"
        onSubmit={handleUpdateStatus}
        submitLabel="Synchronize Status"
      >
        {viewingOrder && (
          <div className="space-y-6 underline decoration-transparent">
            <div className="grid grid-cols-2 gap-4 underline decoration-transparent">
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm underline decoration-transparent">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 underline decoration-transparent">Customer Entity</label>
                <div className="text-xs font-black text-slate-900 uppercase underline decoration-transparent">{viewingOrder.customer}</div>
              </div>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm underline decoration-transparent">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 underline decoration-transparent">Channel</label>
                <div className="text-xs font-black text-slate-900 uppercase underline decoration-transparent">{viewingOrder.type}</div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm underline decoration-transparent">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 underline decoration-transparent">Status Protocol Override</label>
              <div className="flex gap-2 underline decoration-transparent">
                {['Active', 'Completed', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ status })}
                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-sm border transition-all ${
                      formData.status === status 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                    } underline decoration-transparent`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border border-slate-100 rounded-sm underline decoration-transparent">
              <div className="flex justify-between items-center mb-4 underline decoration-transparent">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 underline decoration-transparent">Manifest Data</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 underline decoration-transparent">{viewingOrder.items} Elements</span>
              </div>
              <div className="space-y-2 underline decoration-transparent">
                <div className="flex justify-between text-xs underline decoration-transparent">
                  <span className="text-slate-500 font-bold uppercase underline decoration-transparent">Subtotal Protocol</span>
                  <span className="text-slate-900 font-black underline decoration-transparent">₹{viewingOrder.total - 120}</span>
                </div>
                <div className="flex justify-between text-xs underline decoration-transparent">
                  <span className="text-slate-500 font-bold uppercase underline decoration-transparent">Surcharge/Tax</span>
                  <span className="text-slate-900 font-black underline decoration-transparent">₹120</span>
                </div>
                <div className="pt-2 border-t border-slate-50 flex justify-between text-sm underline decoration-transparent">
                  <span className="text-slate-900 font-black uppercase underline decoration-transparent">Fiscal Total</span>
                  <span className="text-blue-600 font-black underline decoration-transparent">₹{viewingOrder.total}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
