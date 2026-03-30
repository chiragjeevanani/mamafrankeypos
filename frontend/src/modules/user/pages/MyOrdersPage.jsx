import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Clock, 
  ChevronRight, 
  ChefHat, 
  CheckCircle2, 
  XCircle,
  Hash,
  ArrowRight
} from 'lucide-react';
import { BottomNav } from '../components/BottomNav';

const MOCK_ORDERS = {
  active: [
    { 
      id: 'RK-4092', 
      status: 'preparing', 
      items: 4, 
      total: 1240, 
      time: '12 mins ago',
      estArrival: '15 mins'
    },
    { 
      id: 'RK-4095', 
      status: 'new', 
      items: 2, 
      total: 450, 
      time: '2 mins ago',
      estArrival: '25 mins'
    }
  ],
  history: [
    { id: 'RK-3981', status: 'completed', items: 3, total: 890, date: 'Mar 15, 2024' },
    { id: 'RK-3950', status: 'completed', items: 1, total: 120, date: 'Mar 14, 2024' },
    { id: 'RK-3912', status: 'cancelled', items: 2, total: 560, date: 'Mar 12, 2024' },
  ]
};

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState('active');
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing': return 'text-brand-500 bg-brand-500/10';
      case 'new': return 'text-blue-500 bg-blue-500/10';
      case 'completed': return 'text-emerald-500 bg-emerald-500/10';
      case 'cancelled': return 'text-rose-500 bg-rose-500/10';
      default: return 'text-charcoal-500 bg-charcoal-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white selection:bg-brand-500 selection:text-charcoal-900 transition-colors duration-300">
      <div className="max-w-lg mx-auto px-6 pt-12 pb-40">
        <header className="mb-12">
          <h1 className="text-4xl font-display font-bold tracking-tight mb-8">My Orders</h1>
          
          <div className="bg-white dark:bg-charcoal-800 p-1.5 rounded-[1.5rem] border border-charcoal-900/5 dark:border-white/5 flex gap-1 shadow-sm">
            {['active', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${
                  activeTab === tab ? 'text-charcoal-900 dark:text-white' : 'text-charcoal-400'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="active-tab-bg"
                    className="absolute inset-0 bg-brand-500 dark:bg-brand-500 rounded-xl -z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab} Orders</span>
              </button>
            ))}
          </div>
        </header>

        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {MOCK_ORDERS[activeTab].map((order) => (
                <motion.div
                  key={order.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => activeTab === 'active' && navigate('/order-tracking')}
                  className="bg-white dark:bg-charcoal-800 rounded-[2.5rem] p-6 border border-charcoal-900/10 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-2xl relative overflow-hidden group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-charcoal-900/5 dark:bg-white/5 flex items-center justify-center text-charcoal-500">
                        <Hash size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-charcoal-500">Order ID</p>
                        <p className="font-bold text-sm">{order.id}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-charcoal-900/5 dark:bg-white/5 rounded-2xl">
                      <p className="text-[9px] font-black uppercase tracking-widest text-charcoal-500 mb-1 italic">Bill Amount</p>
                      <p className="text-lg font-black text-brand-500">₹{order.total}</p>
                    </div>
                    <div className="p-4 bg-charcoal-900/5 dark:bg-white/5 rounded-2xl">
                      <p className="text-[9px] font-black uppercase tracking-widest text-charcoal-500 mb-1 italic">
                        {activeTab === 'active' ? 'Est. Arrival' : 'Order Date'}
                      </p>
                      <p className="text-sm font-bold truncate">
                        {activeTab === 'active' ? order.estArrival : order.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-charcoal-400">
                      <ClipboardList size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{order.items} Items</span>
                    </div>
                    {activeTab === 'active' && (
                      <div className="flex items-center gap-2 text-brand-500 font-black text-[9px] uppercase tracking-widest group-hover:gap-3 transition-all">
                        Track Now <ArrowRight size={14} />
                      </div>
                    )}
                  </div>

                  {activeTab === 'active' && (
                    <motion.div 
                      className="absolute bottom-0 left-0 h-1 bg-brand-500"
                      initial={{ width: '30%' }}
                      animate={{ width: order.status === 'preparing' ? '60%' : '10%' }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

