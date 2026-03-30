
import React, { useState } from 'react';
import { Globe, Search, Filter, Smartphone, MapPin, CheckCircle, Truck, Eye, XCircle, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';

export default function OnlineOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  const [onlineOrders, setOnlineOrders] = useState([
    { id: 'ON-9901', platform: 'Website', customer: 'Aman Varma', total: 750, status: 'Preparing', courier: 'Self-Delivery' },
    { id: 'ON-9902', platform: 'Mobile App', customer: 'Ishita Jain', total: 420, status: 'Ready', courier: 'Third Party' },
    { id: 'ON-9903', platform: 'Zomato API', customer: 'Karan Mehra', total: 1150, status: 'Dispatched', courier: 'Partner' },
  ]);

  const [formData, setFormData] = useState({
    status: 'Preparing'
  });

  const handleOpenView = (order) => {
    setViewingOrder(order);
    setFormData({ status: order.status });
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    setOnlineOrders(onlineOrders.map(o => o.id === viewingOrder.id ? { ...o, ...formData } : o));
    setIsModalOpen(false);
  };

  const handleCancelOrder = (id) => {
    if (window.confirm('PROTOCOL: Proceed with online order cancellation?')) {
      setOnlineOrders(onlineOrders.map(o => o.id === id ? { ...o, status: 'Cancelled' } : o));
    }
  };

  const filteredOrders = onlineOrders.filter(o => o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer.toLowerCase().includes(searchQuery.toLowerCase()) || o.platform.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 underline decoration-transparent">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Digital Inbound Logs</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 underline decoration-transparent">Digital Channel Synchronization</p>
        </div>
        <div className="flex items-center gap-3 underline decoration-transparent">
          <div className="flex items-center -space-x-2 underline decoration-transparent">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-emerald-600 text-[10px] font-black underline decoration-transparent">Z</div>
            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600 text-[10px] font-black underline decoration-transparent">W</div>
            <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-amber-600 text-[10px] font-black underline decoration-transparent">M</div>
          </div>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest tracking-tighter underline decoration-transparent">API NETWORK ACTIVE</span>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-2 flex flex-col md:flex-row items-center gap-4 underline decoration-transparent shadow-sm">
        <div className="relative flex-1 group underline decoration-transparent">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="FILTER DIGITAL SIGNALS..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none underline decoration-transparent underline decoration-transparent shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 underline decoration-transparent">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white border border-slate-100 rounded-sm p-5 hover:border-blue-500/30 transition-all hover:shadow-xl group relative overflow-hidden underline decoration-transparent">
            <div className="absolute -right-4 -top-4 w-12 h-12 bg-slate-50 rotate-45 group-hover:bg-blue-50 transition-colors underline decoration-transparent" />
            
            <div className="flex items-center justify-between mb-6 underline decoration-transparent">
              <div className="flex items-center gap-2 underline decoration-transparent">
                <Globe size={14} className="text-blue-500" />
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest underline decoration-transparent underline decoration-transparent">{order.platform}</span>
              </div>
              <span className="text-[9px] font-black text-slate-400 tracking-widest underline decoration-transparent">#{order.id}</span>
            </div>

            <div className="mb-6 underline decoration-transparent">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1 underline decoration-transparent">{order.customer}</h4>
              <div className="flex items-center gap-2 text-slate-400 underline decoration-transparent">
                <MapPin size={10} />
                <span className="text-[8px] font-bold uppercase tracking-widest underline decoration-transparent">Delivery Protocol Initiated</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-4 underline decoration-transparent">
              <div>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 underline decoration-transparent">Final Value</div>
                <div className="text-xs font-black text-blue-600 tracking-tighter underline decoration-transparent">₹{order.total}</div>
              </div>
              <div className="flex items-center gap-2 underline decoration-transparent">
                <button 
                  onClick={() => handleOpenView(order)}
                  className="p-1.5 hover:bg-slate-50 rounded-sm text-slate-400 hover:text-slate-900 outline-none transition-colors"
                ><Eye size={14} /></button>
                <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-600 rounded-sm underline decoration-transparent">
                  <Truck size={12} />
                  <span className="text-[8px] font-black uppercase tracking-widest underline decoration-transparent underline decoration-transparent">{order.status}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={viewingOrder ? `Audit Digital ${viewingOrder.id}` : 'Order Signal'}
        subtitle="Digital Channel Status Protocol"
        onSubmit={handleUpdateStatus}
      >
        {viewingOrder && (
          <div className="space-y-6 underline decoration-transparent">
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm underline decoration-transparent">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 underline decoration-transparent">Protocol Status Override</label>
              <div className="grid grid-cols-2 gap-2 underline decoration-transparent">
                {['Preparing', 'Ready', 'Dispatched', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ status })}
                    className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-sm border transition-all ${
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
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 underline decoration-transparent">Inbound Profile</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 underline decoration-transparent">{viewingOrder.courier}</span>
              </div>
              <div className="space-y-2 underline decoration-transparent">
                <div className="flex justify-between text-xs underline decoration-transparent">
                  <span className="text-slate-500 font-bold uppercase underline decoration-transparent">Channel Entity</span>
                  <span className="text-slate-900 font-black underline decoration-transparent">{viewingOrder.platform}</span>
                </div>
                <div className="flex justify-between text-xs underline decoration-transparent">
                  <span className="text-slate-500 font-bold uppercase underline decoration-transparent">Signal Identity</span>
                  <span className="text-slate-900 font-black underline decoration-transparent">{viewingOrder.id}</span>
                </div>
                <div className="pt-2 border-t border-slate-50 flex justify-between text-sm underline decoration-transparent">
                  <span className="text-slate-900 font-black uppercase underline decoration-transparent">Net Impact</span>
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
