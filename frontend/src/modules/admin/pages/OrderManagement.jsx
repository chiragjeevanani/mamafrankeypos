import React, { useState } from 'react';
import { 
  ShoppingBag, Search, Filter, Calendar, 
  ChevronRight, Clock, MapPin, Eye,
  Printer, CheckCircle2, XCircle, AlertCircle,
  X, Receipt, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrders } from '../../../context/OrderContext';
import { useTheme } from '../../user/context/ThemeContext';

export default function OrderManagement() {
  const { orders, updateOrderStatus, cancelOrder } = useOrders();
  const { isDarkMode } = useTheme();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || 
                         order.source?.toLowerCase().includes(filterStatus.toLowerCase());
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (order.table && `Table ${order.table}`.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 overflow-y-auto no-scrollbar max-h-full">
       <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2.5 mb-1">
             <ShoppingBag size={18} className="text-[#5D4037]" />
             <h1 className="text-xl font-black uppercase tracking-tight text-stone-800">Live Order Monitor</h1>
           </div>
           <p className="text-xs text-stone-400 font-semibold">Real-time view of all dine-in, takeaway and QR orders</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex bg-white p-1 border border-stone-200 rounded-lg shadow-sm">
              <button 
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${filterStatus === 'all' ? 'bg-[#5D4037] text-white shadow-sm' : 'text-stone-400 hover:text-stone-700'}`}
              >All</button>
              <button 
                onClick={() => setFilterStatus('Staff App')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${filterStatus === 'Staff App' ? 'bg-[#5D4037] text-white shadow-sm' : 'text-stone-400 hover:text-stone-700'}`}
              >Staff</button>
              <button 
                onClick={() => setFilterStatus('QR Ordering')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${filterStatus === 'QR Ordering' ? 'bg-[#5D4037] text-white shadow-sm' : 'text-stone-400 hover:text-stone-700'}`}
              >QR</button>
           </div>
        </div>
      </div>

      {/* Order Grid */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
         <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-20">
            <div className="flex items-center gap-3 flex-1">
               <div className="max-w-xs w-full relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search by order # or table..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 py-2 pl-9 pr-4 text-[11px] font-semibold rounded-lg outline-none focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037] transition-all placeholder:text-stone-300" 
                  />
               </div>
               <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer whitespace-nowrap hover:bg-stone-100 transition-colors">
                  <Calendar size={12} className="text-stone-400" />
                  <span className="text-[10px] font-bold text-stone-700">Today: {new Date().toLocaleDateString()}</span>
               </div>
            </div>
         </div>

         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                     <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-stone-500 whitespace-nowrap">Order #</th>
                     <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-stone-500 whitespace-nowrap">Channel</th>
                     <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-stone-500 whitespace-nowrap">Table</th>
                     <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-stone-500 whitespace-nowrap">Status</th>
                     <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-stone-500 whitespace-nowrap text-right">Total</th>
                     <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-stone-500 whitespace-nowrap text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-50">
                  {filteredOrders.map(order => (
                     <tr key={order.id} className="hover:bg-amber-50/40 transition-colors group cursor-pointer relative border-b border-stone-50 last:border-0" onClick={() => setSelectedOrder(order)}>
                        <td className="px-5 py-3.5">
                           <div className="flex flex-col">
                              <span className="text-[12px] font-black text-stone-900">#{order.orderNum}</span>
                              <span className="text-[9px] font-semibold text-stone-400 mt-0.5">{new Date(order.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           </div>
                        </td>
                        <td className="px-5 py-3.5">
                           <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${order.source === 'Staff App' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                              <span className="text-[11px] font-semibold text-stone-600">{order.source}</span>
                           </div>
                        </td>
                        <td className="px-5 py-3.5">
                           <span className="text-[12px] font-bold text-stone-800">{order.table ? `Table ${order.table}` : 'Takeaway'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                           <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                              order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                              order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'ready' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'
                           }`}>
                              {order.status === 'completed' && <CheckCircle2 size={10} />}
                              {order.status === 'cancelled' && <XCircle size={10} />}
                              {order.status === 'preparing' && <Clock size={10} className="animate-spin" />}
                              {order.status === 'new' && <AlertCircle size={10} />}
                              {order.status}
                           </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                           <div className="flex flex-col">
                              <span className="text-[12px] font-black text-stone-900">₹{order.total.toLocaleString()}</span>
                              <span className="text-[9px] font-semibold text-stone-400 mt-0.5">{order.items.length} items</span>
                           </div>
                        </td>
                        <td className="px-5 py-3.5">
                           <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 text-stone-400 hover:text-[#5D4037] bg-white border border-stone-200 rounded-lg shadow-sm transition-all"><Eye size={12} /></button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.alert(`Print receipt for Order #${order.orderNum}`);
                                }}
                                className="p-1.5 text-stone-400 hover:text-blue-600 bg-white border border-stone-200 rounded-lg shadow-sm transition-all"
                              ><Printer size={12} /></button>
                              <ChevronRight size={14} className="text-stone-200" />
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         
         <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-stone-400">{filteredOrders.length} orders found</span>
            <div className="flex items-center gap-1">
               <button className="p-1.5 border border-stone-200 rounded-lg cursor-pointer hover:bg-white transition-colors"><ChevronRight size={12} className="rotate-180 text-stone-400" /></button>
               <button className="p-1.5 border border-stone-200 rounded-lg cursor-pointer hover:bg-white transition-colors"><ChevronRight size={12} className="text-stone-400" /></button>
            </div>
         </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-xl shadow-2xl relative overflow-hidden flex flex-col"
            >
               <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#2C2C2C]">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-[#5D4037] text-white rounded-lg flex items-center justify-center">
                        <ShoppingBag size={16} />
                     </div>
                     <div>
                        <h3 className="text-[13px] font-black uppercase tracking-tight text-white">Order #{selectedOrder.orderNum}</h3>
                        <p className="text-[9px] font-semibold text-stone-400 mt-0.5">{selectedOrder.source}</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 text-stone-400 hover:text-white transition-colors"><X size={18} /></button>
               </div>

                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                     <div className="bg-stone-50 border border-stone-100 rounded-xl p-3">
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Channel</p>
                        <p className="text-sm font-black text-stone-800">{selectedOrder.source}</p>
                     </div>
                     <div className="bg-stone-50 border border-stone-100 rounded-xl p-3">
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Table</p>
                        <p className="text-sm font-black text-stone-800">{selectedOrder.table ? `Table ${selectedOrder.table}` : 'Takeaway'}</p>
                     </div>
                     <div className="bg-stone-50 border border-stone-100 rounded-xl p-3">
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Total</p>
                        <p className="text-sm font-black text-[#5D4037]">₹{selectedOrder.total.toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="flex items-center justify-between px-1">
                     <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Update Status</p>
                     <select 
                        value={selectedOrder.status}
                        onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                        className="text-[11px] font-bold bg-stone-100 border border-stone-200 outline-none px-3 py-1.5 rounded-lg text-stone-700 focus:ring-2 focus:ring-[#5D4037]/20"
                     >
                        <option value="new">New</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                     </select>
                  </div>

                  <div className="bg-stone-50 p-4 border border-stone-100 rounded-xl">
                     <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Order Items</h4>
                     <div className="space-y-2 max-h-[180px] overflow-y-auto no-scrollbar">
                        {selectedOrder.items.map((item, idx) => (
                           <div key={idx} className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-stone-700">{item.name}</span>
                              <span className="text-sm font-bold text-stone-500">x{item.quantity}</span>
                           </div>
                        ))}
                        <div className="border-t border-stone-200 pt-2.5 mt-2 flex items-center justify-between">
                           <span className="text-sm font-black text-stone-800">Grand Total</span>
                           <span className="text-sm font-black text-[#5D4037]">₹{selectedOrder.total}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                     <button 
                        onClick={() => cancelOrder(selectedOrder.id)}
                        className="flex-1 py-3 bg-white border border-rose-200 text-rose-500 text-[11px] font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-rose-50"
                     >
                        <Trash2 size={14} />
                        Cancel Order
                     </button>
                     <button 
                        onClick={() => window.alert('Print receipt...')}
                        className="flex-1 py-3 bg-[#5D4037] text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-stone-900/15 hover:bg-[#4E342E]"
                     >
                        <Receipt size={14} />
                        Print Receipt
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
