import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShoppingBag, Clock, ArrowRight, Trash2, CheckCircle, Sparkles } from 'lucide-react';
import { StaffNavbar } from '../components/StaffNavbar';

const MOCK_ALERTS = [
  {
    id: 1,
    type: 'order',
    title: 'New QR Order',
    message: 'Table #4 just placed a new order for 3 items.',
    time: '2 mins ago',
    unread: true,
    table: '4'
  },
  {
    id: 2,
    type: 'kitchen',
    title: 'Order Delayed',
    message: 'Table #2: Paneer Tikka is taking longer than expected.',
    time: '15 mins ago',
    unread: false,
    table: '2'
  },
  {
    id: 3,
    type: 'service',
    title: 'Water Requested',
    message: 'Table #7 has requested water.',
    time: '20 mins ago',
    unread: false,
    table: '7'
  }
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  const markAllRead = () => {
    setAlerts(alerts.map(a => ({ ...a, unread: false })));
  };

  const deleteAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <div className="flex-1 max-w-lg mx-auto w-full bg-white shadow-xl shadow-slate-200/50 min-h-screen relative pb-32">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Bell size={14} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Operation Alerts</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Staff Notifications</h1>
            </div>
            <button 
              onClick={markAllRead}
              className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all"
            >
              Mark all as read
            </button>
          </div>
        </header>

        <main className="p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {alerts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center opacity-30"
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <CheckCircle size={32} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">All caught up!</p>
              </motion.div>
            ) : (
              alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`relative p-5 rounded-[2rem] border transition-all ${
                    alert.unread 
                    ? 'bg-blue-50/50 border-blue-100 shadow-sm' 
                    : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      alert.type === 'order' ? 'bg-emerald-100 text-emerald-600' : 
                      alert.type === 'kitchen' ? 'bg-orange-100 text-orange-600' : 
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {alert.type === 'order' ? <ShoppingBag size={20} /> : <Bell size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-slate-900 truncate pr-4">{alert.title}</h4>
                        <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{alert.time}</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed mb-3">
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-all">
                          Take Action <ArrowRight size={10} />
                        </button>
                        <button 
                          onClick={() => deleteAlert(alert.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {alert.unread && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </main>

        <StaffNavbar activeTab="notifications" />
      </div>
    </div>
  );
}
