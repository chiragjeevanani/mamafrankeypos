import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { KdsOrderCard } from './KdsOrderCard';
import { useOrders } from '../../../context/OrderContext';
import { useTheme } from '../../user/context/ThemeContext';

export default function KdsOrderQueueTemplate({ 
  title, 
  statusFilter, 
  emptyMessage = "No orders in this queue", 
  accentColor = "teal" 
}) {
  const { orders } = useOrders();
  const { isDarkMode } = useTheme();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(o => {
    const matchesStatus = Array.isArray(statusFilter) 
      ? statusFilter.includes(o.status) 
      : o.status === statusFilter;
    
    if (!matchesStatus) return false;
    
    if (!searchTerm) return true;
    
    return o.orderNum.includes(searchTerm) || 
           o.table.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Simplified View Header */}
      <header className={`px-8 py-4 border-b shrink-0 flex items-center justify-between transition-colors duration-500 ${
        isDarkMode ? 'bg-[#1a1c1e] border-white/5 shadow-inner' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className={`text-lg font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-[#E1261C]'}`}>
              {title}
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">
                {filteredOrders.length} Elements
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`relative flex items-center p-1 rounded-xl border transition-all ${
            isDarkMode ? 'bg-white/5 border-white/5' : 'bg-stone-50 border-stone-100 shadow-inner'
          }`}>
            <Search size={14} className="absolute left-4 text-stone-500" />
            <input 
              type="text"
              placeholder="SEARCH QUEUE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none pl-10 pr-4 py-2 text-[10px] font-black uppercase tracking-widest text-stone-400 placeholder:text-stone-600 w-32 focus:w-48 transition-all"
            />
          </div>
          <button className={`p-2.5 rounded-xl border transition-all ${
            isDarkMode ? 'bg-white/5 text-stone-400 border-white/5 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]' : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:text-[#E1261C]'
          }`}>
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* Grid */}
      <main className={`flex-1 overflow-y-auto p-8 no-scrollbar transition-colors ${
        isDarkMode ? 'bg-[#1a1c1e]' : 'bg-stone-50'
      }`}>
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <ChefHat size={80} strokeWidth={1} className="mb-6 text-[#E1261C]" />
            <h2 className="text-4xl font-black uppercase tracking-tighter text-[#E1261C]">{emptyMessage}</h2>
            <p className="text-sm font-bold mt-2 uppercase tracking-widest text-stone-500">Everything is up to date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order) => (
                <KdsOrderCard 
                  key={order.id} 
                  order={order} 
                  onClick={setSelectedOrder} 
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Details Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed top-0 right-0 h-full w-full sm:max-w-xl transition-colors duration-500 border-l z-[101] flex flex-col shadow-2xl ${
                isDarkMode ? 'bg-[#1a1c1e] border-white/10' : 'bg-white border-stone-200'
              }`}
            >
              <div className={`p-8 border-b transition-colors ${
                isDarkMode ? 'border-white/5' : 'border-stone-100'
              }`}>
                <div className="flex items-center justify-between mb-8">
                   <h2 className={`text-3xl font-black tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-[#E1261C]'}`}>Order #{selectedOrder.orderNum}</h2>
                   <button onClick={() => setSelectedOrder(null)} className={`p-2.5 rounded-lg border transition-all ${
                     isDarkMode ? 'bg-white/5 border-white/5 text-stone-400 hover:bg-white/10' : 'bg-stone-50 border-stone-100'
                   }`}>
                      <RefreshCw size={20} className="rotate-45" />
                   </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border transition-colors ${
                    isDarkMode ? 'bg-black/20 border-white/5' : 'bg-stone-50 border-stone-100'
                  }`}>
                    <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-1">Table</span>
                    <span className="text-xl font-black">#{selectedOrder.table}</span>
                  </div>
                  <div className={`p-4 rounded-2xl border transition-colors ${
                    isDarkMode ? 'bg-black/20 border-white/5' : 'bg-stone-50 border-stone-100'
                  }`}>
                    <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-1">Source</span>
                    <span className="text-xl font-black truncate block capitalize">{selectedOrder.source}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className={`p-5 rounded-[1.5rem] border transition-all ${
                    isDarkMode ? 'bg-[#2a2c2e] border-white/5' : 'bg-stone-50 border-stone-100 hover:bg-stone-100'
                  }`}>
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black border ${
                         isDarkMode ? 'bg-stone-900 border-white/5 text-[#D4AF37]' : 'bg-white border-stone-100 text-[#E1261C] shadow-sm'
                       }`}>
                         {item.quantity}
                       </div>
                       <div>
                         <h4 className={`font-bold text-lg uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{item.name}</h4>
                         {item.note && (
                           <p className="text-xs text-red-400 italic font-medium tracking-wide">★ {item.note}</p>
                         )}
                       </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`p-8 border-t transition-colors ${
                isDarkMode ? 'bg-black/20 border-white/5' : 'bg-stone-50/80 border-stone-100'
              }`}>
                {selectedOrder.status === 'new' && (
                  <button className="w-full bg-[#E1261C] text-white py-6 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-[#4E342E] transition-all shadow-xl shadow-[#E1261C]/20 active:scale-[0.98]">
                    Start Preparing
                  </button>
                )}
                {selectedOrder.status === 'preparing' && (
                  <button className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 active:scale-[0.98]">
                    Mark as Done
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
