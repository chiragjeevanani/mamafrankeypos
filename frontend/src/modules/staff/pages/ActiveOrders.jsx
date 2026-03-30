import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, ChefHat, AlertCircle, Search, Filter, Hash } from 'lucide-react';
import { useOrders } from '../../../context/OrderContext';
import { StaffNavbar } from '../components/StaffNavbar';

export default function ActiveOrders() {
  const { orders, updateItemStatus, updateOrderStatus } = useOrders();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Use real orders from context (excluding those that are already served/cleared)
  const activeOrders = orders.filter(o => o.status !== 'ready');

  const filteredOrders = activeOrders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = 
      order.table.toLowerCase().includes(search.toLowerCase()) || 
      order.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 max-w-lg mx-auto w-full bg-white shadow-xl shadow-slate-200/50 min-h-screen relative pb-32">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-6 py-6">
          <div className="flex items-center justify-between mb-8">
             <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                   <ChefHat size={14} className="text-teal-500" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Staff Ops Node</span>
                 </div>
                 <h1 className="text-xl font-black text-slate-900 tracking-tight">Active Room Service</h1>
              </div>
              
              <div className="flex items-center gap-2">
                 <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                   {filteredOrders.length} Tracks
                 </span>
              </div>
           </div>

           <div className="flex gap-2">
              <div className="relative flex-1 group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter by item or table..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-[11px] font-medium outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                />
              </div>
              <button 
                onClick={() => setFilter(filter === 'all' ? 'preparing' : 'all')}
                className={`p-3 border rounded-2xl transition-all shadow-sm ${filter !== 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}
              >
                <Filter size={18} />
              </button>
           </div>
        </header>

      <main className="p-6">
         <div className="flex flex-col gap-6">
            <AnimatePresence mode="popLayout">
              {filteredOrders.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center opacity-20"
                >
                  <ChefHat size={64} strokeWidth={1} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Active Orders</p>
                </motion.div>
              ) : (
                filteredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm"
                  >
                    {/* Order Header */}
                    <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                            T{order.table}
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Ref ID</p>
                             <div className="flex items-center gap-1">
                                <Hash size={10} className="text-teal-500" />
                                <p className="text-sm font-bold text-slate-900 leading-none">{order.orderNum}</p>
                             </div>
                          </div>
                       </div>
                       <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${order.status === 'delayed' ? 'text-red-500 bg-red-50 border-red-100' : 'text-orange-500 bg-orange-50 border-orange-100'}`}>
                          <Clock size={12} strokeWidth={3} className="animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                       </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6 space-y-4">
                       {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between group">
                             <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs ring-1 ring-slate-200 shrink-0">
                                   {item.quantity}x
                                </div>
                                <div className="min-w-0">
                                   <h4 className="text-sm font-bold text-slate-900 leading-tight mb-0.5 truncate">{item.name}</h4>
                                   <div className="flex items-center gap-1.5 grayscale opacity-60">
                                      <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'ready' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.status}</span>
                                   </div>
                                </div>
                             </div>
                             
                             {item.status !== 'ready' ? (
                               <motion.button
                                 whileTap={{ scale: 0.9 }}
                                 onClick={() => updateItemStatus(order.id, item.id, 'ready')}
                                 className="px-4 py-2 bg-teal-50 text-teal-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all border border-teal-100"
                               >
                                 Mark Ready
                               </motion.button>
                             ) : (
                               <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 shrink-0">
                                  <CheckCircle size={16} strokeWidth={3} />
                               </div>
                             )}
                          </div>
                       ))}
                    </div>

                    {/* Order Footer */}
                    <div className="px-6 py-4 bg-slate-900/5 flex items-center justify-between">
                       <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900">
                          <AlertCircle size={14} /> Report
                       </button>
                       {order.items.every(i => i.status === 'ready') && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                          >
                             Serve Order
                          </motion.button>
                       )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
         </div>
      </main>

      <StaffNavbar activeTab="orders" />
      </div>
    </div>
  );
}
