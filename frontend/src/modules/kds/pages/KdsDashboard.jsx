import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, AlertTriangle, Settings, Bell, RefreshCw, ChefHat, Filter, Moon, Sun } from 'lucide-react';
import { KDS_STATIONS, INITIAL_KDS_ORDERS } from '../data/kdsMockData';
import { KdsOrderCard } from '../components/KdsOrderCard';
import { useOrders } from '../../../context/OrderContext';
import { useTheme } from '../../user/context/ThemeContext';

export default function KdsDashboard() {
  const [activeStation, setActiveStation] = useState('all');
  const { orders, updateOrderStatus } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { isDarkMode, toggleTheme } = useTheme();

  // Consider orders not marked as 'ready' for the active queue
  const activeOrders = orders.filter(o => o.status !== 'ready');

  const filteredOrders = activeStation === 'all' 
    ? activeOrders 
    : activeOrders.filter(o => o.station === activeStation || !o.station);

  const summary = {
    total: activeOrders.length,
    new: activeOrders.filter(o => o.status === 'new').length,
    delayed: activeOrders.filter(o => {
      const elapsed = (Date.now() - new Date(o.startTime).getTime()) / 1000;
      return elapsed > 600;
    }).length
  };

  const handleComplete = (orderId) => {
    updateOrderStatus(orderId, 'ready');
    setSelectedOrder(null);
  };

  return (
    <div className={`h-full transition-colors duration-500 flex flex-col font-sans overflow-hidden ${
      isDarkMode ? 'bg-[#181a1c] text-stone-100' : 'bg-stone-50 text-stone-900'
    }`}>
      {/* Control Bar */}
      <div className={`border-b transition-colors duration-500 px-5 py-2.5 flex items-center justify-between gap-4 shrink-0 ${
        isDarkMode ? 'bg-black/20 border-white/6' : 'bg-white border-stone-100 shadow-sm'
      }`}>
        {/* Station Filter */}
        <div className="flex items-center gap-2 overflow-hidden">
          <Filter size={14} className="text-[#D4AF37] shrink-0 hidden sm:block" />
          <div className={`flex p-1 rounded-xl border transition-all overflow-x-auto no-scrollbar ${
            isDarkMode ? 'bg-black/30 border-white/6' : 'bg-stone-100 border-stone-200'
          }`}>
            {KDS_STATIONS.map((station) => (
              <button
                key={station.id}
                onClick={() => setActiveStation(station.id)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeStation === station.id 
                  ? (isDarkMode ? 'bg-[#5D4037] text-white shadow-md' : 'bg-[#5D4037] text-white shadow-md') 
                  : (isDarkMode ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-700')
                }`}
              >
                {station.name}
              </button>
            ))}
          </div>
        </div>
         
        {/* Summary Stats */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>New</span>
              <span className="text-base font-black text-blue-500 tabular-nums">{summary.new}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Late</span>
              <span className="text-base font-black text-rose-500 tabular-nums">{summary.delayed}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Total</span>
              <span className={`text-base font-black tabular-nums ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>{summary.total}</span>
            </div>
          </div>
          
          <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
            <RefreshCw size={11} className="animate-spin text-[#D4AF37]" />
            Sync Live
          </div>
        </div>
      </div>

      {/* Order Grid */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <ChefHat size={64} strokeWidth={1} className="mb-4 text-[#5D4037]" />
            <h2 className="text-2xl font-black uppercase tracking-tighter text-[#5D4037]">Kitchen Clear</h2>
            <p className="text-xs font-bold mt-2">All orders have been fulfilled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
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

      {/* Order Details Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed top-0 right-0 h-full w-full sm:max-w-lg transition-colors duration-500 border-l z-[101] flex flex-col shadow-2xl ${
                isDarkMode ? 'bg-[#1a1c1e] border-white/8' : 'bg-white border-stone-200'
              }`}
            >
              {/* Drawer Header */}
              <div className={`p-5 border-b transition-colors ${
                isDarkMode ? 'border-white/6' : 'border-stone-100'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className={`p-2 rounded-lg transition-all border ${
                      isDarkMode ? 'bg-white/5 border-white/6 text-stone-400 hover:bg-white/10' : 'bg-stone-100 border-stone-200 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    <RefreshCw size={16} className="rotate-45" />
                  </button>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-0.5 block">Detail View</span>
                    <h2 className={`text-xl font-black tracking-tighter uppercase transition-colors ${
                      isDarkMode ? 'text-white' : 'text-[#5D4037]'
                    }`}>Order #{selectedOrder.orderNum}</h2>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: 'Table', value: `#${selectedOrder.table}` },
                    { label: 'Channel', value: selectedOrder.source },
                    { label: 'Station', value: selectedOrder.station || 'Mains' },
                  ].map(({ label, value }) => (
                    <div key={label} className={`p-3 rounded-xl border transition-colors ${
                      isDarkMode ? 'bg-black/20 border-white/6' : 'bg-stone-50 border-stone-100'
                    }`}>
                      <span className={`text-[9px] font-black uppercase mb-1 block tracking-widest ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>{label}</span>
                      <span className={`text-base font-black transition-colors truncate block ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar">
                <h3 className={`text-[9px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Item List</h3>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className={`border p-3.5 rounded-xl flex items-center justify-between group transition-all ${
                    isDarkMode ? 'bg-[#252729] border-white/6 hover:bg-[#2e3032]' : 'bg-stone-50 border-stone-100 hover:bg-stone-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black border ${
                        isDarkMode ? 'bg-stone-900 text-[#D4AF37] border-white/6' : 'bg-white text-[#5D4037] border-stone-200 shadow-sm'
                      }`}>
                        {item.quantity}
                      </div>
                      <div className="min-w-0">
                        <h4 className={`text-sm font-bold uppercase tracking-tight leading-none mb-1 truncate transition-colors ${
                          isDarkMode ? 'text-white' : 'text-stone-800'
                        }`}>{item.name}</h4>
                        {item.note && (
                          <div className="flex items-center gap-1.5 text-red-400">
                            <AlertTriangle size={11} className="shrink-0" />
                            <span className="text-[10px] font-bold uppercase italic tracking-wide truncate">{item.note}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button className={`p-2 rounded-lg transition-all border shrink-0 ${
                      isDarkMode ? 'bg-stone-900 text-stone-500 hover:text-[#D4AF37] border-white/6' : 'bg-white text-stone-400 hover:text-[#5D4037] border-stone-200'
                    }`}>
                      <RefreshCw size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Action Footer */}
              <div className={`p-5 border-t transition-colors ${
                isDarkMode ? 'border-white/6 bg-black/30' : 'border-stone-100 bg-stone-50'
              }`}>
                <button 
                  onClick={() => handleComplete(selectedOrder.id)}
                  className="w-full bg-[#5D4037] text-white py-4 rounded-xl font-black text-base uppercase tracking-widest shadow-xl shadow-[#5D4037]/25 hover:bg-[#4E342E] transition-all active:scale-[0.98]"
                >
                  ✓ Mark as Complete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
