
import React, { useState } from 'react';
import { XCircle, Search, Filter, AlertCircle, RefreshCw, Eye, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';

export default function CancelledOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  const [cancellations, setCancellations] = useState([
    { id: 'ORD-7701', type: 'Dine-in', reason: 'Customer Changed Mind', value: 450, refund: 'Processed', time: '11:20 AM' },
    { id: 'ORD-7702', type: 'App Order', reason: 'Item Out of Stock', value: 1200, refund: 'Pending', time: '11:45 AM' },
    { id: 'ORD-7703', type: 'Takeaway', reason: 'Wait Time Too High', value: 310, refund: 'None', time: '12:05 PM' },
  ]);

  const [formData, setFormData] = useState({
    refund: 'Pending'
  });

  const handleOpenView = (order) => {
    setViewingOrder(order);
    setFormData({ refund: order.refund });
    setIsModalOpen(true);
  };

  const handleUpdateRefund = (e) => {
    e.preventDefault();
    setCancellations(cancellations.map(o => o.id === viewingOrder.id ? { ...o, ...formData } : o));
    setIsModalOpen(false);
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm('PROTOCOL: Permanently purge this cancellation record?')) {
      setCancellations(cancellations.filter(o => o.id !== id));
    }
  };

  const filteredCancellations = cancellations.filter(o => o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.reason.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 underline decoration-transparent">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase text-rose-600">Void Registry</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 underline decoration-transparent">Cancellation Protocol & Refund Audit</p>
        </div>
        <div className="flex items-center gap-3 underline decoration-transparent">
          <div className="px-4 py-2 border border-rose-100 bg-rose-50 text-rose-600 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 underline decoration-transparent shadow-sm">
            <XCircle size={14} />
            Shrinkage Watch Active
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-2 flex flex-col md:flex-row items-center gap-4 underline decoration-transparent shadow-sm">
        <div className="relative flex-1 group underline decoration-transparent">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="FILTER VOIDED LOGS..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none underline decoration-transparent underline decoration-transparent shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm overflow-hidden underline decoration-transparent overflow-x-auto shadow-sm underline decoration-transparent">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Order Signal</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Negative Reason</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Lost Value</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Refund Logic</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Terminal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCancellations.map((order) => (
              <tr key={order.id} className="hover:bg-rose-50/30 group transition-colors underline decoration-transparent">
                <td className="px-6 py-4">
                  <div className="flex flex-col underline decoration-transparent">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight underline decoration-transparent">#{order.id}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 underline decoration-transparent">{order.time}</span>
                  </div>
                </td>
                <td className="px-6 py-4 underline decoration-transparent">
                  <div className="flex items-center gap-2 underline decoration-transparent">
                    <AlertCircle size={12} className="text-rose-500" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest tracking-tighter underline decoration-transparent">{order.reason}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right underline decoration-transparent">
                  <span className="text-xs font-black text-rose-600 tracking-tighter underline decoration-transparent">- ₹{order.value}</span>
                </td>
                <td className="px-6 py-4 underline decoration-transparent">
                  <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest ${order.refund === 'Processed' ? 'bg-emerald-50 text-emerald-600' : order.refund === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'} underline decoration-transparent`}>
                    {order.refund}
                  </span>
                </td>
                <td className="px-6 py-4 text-right underline decoration-transparent">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all underline decoration-transparent">
                    <button 
                      onClick={() => handleOpenView(order)}
                      className="p-1.5 hover:bg-white rounded-sm text-slate-400 hover:text-slate-900 shadow-sm transition-colors outline-none"
                    ><Eye size={14} /></button>
                    <button 
                      onClick={() => handleDeleteRecord(order.id)}
                      className="p-1.5 hover:bg-rose-100 rounded-sm text-slate-400 hover:text-rose-600 shadow-sm transition-colors outline-none"
                    ><Trash2 size={14} /></button>
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
        title={viewingOrder ? `Audit Void ${viewingOrder.id}` : 'Cancellation Context'}
        subtitle="Negative Flow Analysis & Fiscal Reversal"
        onSubmit={handleUpdateRefund}
        submitLabel="Commit Refund Protocol"
      >
        {viewingOrder && (
          <div className="space-y-6 underline decoration-transparent">
            <div className="bg-rose-50 p-4 border border-rose-100 rounded-sm underline decoration-transparent">
              <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest block mb-2 underline decoration-transparent">Void Designation</label>
              <div className="text-xs font-black text-rose-900 uppercase underline decoration-transparent">{viewingOrder.reason}</div>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm underline decoration-transparent">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 underline decoration-transparent">Refund Logic Protocol</label>
              <div className="grid grid-cols-3 gap-2 underline decoration-transparent">
                {['None', 'Pending', 'Processed'].map((refund) => (
                  <button
                    key={refund}
                    type="button"
                    onClick={() => setFormData({ refund })}
                    className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-sm border transition-all ${
                      formData.refund === refund 
                        ? 'bg-rose-600 text-white border-rose-600 shadow-lg' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                    } underline decoration-transparent`}
                  >
                    {refund}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border border-slate-100 rounded-sm underline decoration-transparent">
              <div className="flex justify-between items-center mb-4 underline decoration-transparent">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 underline decoration-transparent">Negative Audit</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 underline decoration-transparent">PO: {viewingOrder.type}</span>
              </div>
              <div className="space-y-2 underline decoration-transparent">
                <div className="flex justify-between text-xs underline decoration-transparent">
                  <span className="text-slate-500 font-bold uppercase underline decoration-transparent">Voided Value Impact</span>
                  <span className="text-rose-600 font-black underline decoration-transparent">-₹{viewingOrder.value}</span>
                </div>
                <div className="pt-2 border-t border-slate-50 flex justify-between text-sm underline decoration-transparent">
                  <span className="text-slate-900 font-black uppercase underline decoration-transparent">Fiscal Reconciliation</span>
                  <span className="text-slate-900 font-black underline decoration-transparent">₹0</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
