import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, CheckCircle2, MapPin, Clock, Hash } from 'lucide-react';
import { useOrders } from '../../../context/OrderContext';
import { StaffNavbar } from '../components/StaffNavbar';

export default function ReadyOrders() {
  const { orders, updateOrderStatus } = useOrders();
  
  // Filter for orders that are ready to be served
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-6 py-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Pickups</h1>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ready to be served</p>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full bg-white shadow-xl shadow-slate-200/50 p-6 pb-32">
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {readyOrders.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center opacity-20"
              >
                <ChefHat size={64} strokeWidth={1} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Everything Is Served</p>
              </motion.div>
            ) : (
              readyOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-emerald-50/50 rounded-[2rem] border-2 border-emerald-100 p-6 overflow-hidden relative"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">
                        {order.table}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Hash size={10} className="text-emerald-600" />
                          <p className="text-xs font-black text-slate-900 leading-none">{order.orderNum}</p>
                        </div>
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Ready for pickup</p>
                      </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-2">
                      <Clock size={10} className="text-emerald-600" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Just Now</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-sm font-bold text-slate-900">{item.quantity}x {item.name}</span>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateOrderStatus(order.id, 'served')}
                    className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Mark as Served
                  </motion.button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      <StaffNavbar activeTab="orders" />
    </div>
  );
}

