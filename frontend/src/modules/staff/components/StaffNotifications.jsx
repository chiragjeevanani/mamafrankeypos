import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, ShoppingBag, ArrowRight, X } from 'lucide-react';

export function StaffNotifications() {
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate a new order arriving from the Customer App after 5 seconds
    const timer = setTimeout(() => {
      setNotification({
        id: Date.now(),
        table: '4',
        items: '2x Paneer Tikka, 1x Coke',
        timestamp: 'Just now'
      });
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  if (!notification) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        onClick={() => {
          navigate('/staff/alerts');
          setNotification(null);
        }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-6 cursor-pointer"
      >
        <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-2xl flex items-center gap-5 border border-white/10">
           <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center text-slate-900 shrink-0 shadow-lg shadow-teal-500/20">
              <ShoppingBag size={24} />
           </div>
           
           <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">New QR Order</span>
                 <div className="w-1 h-1 rounded-full bg-slate-500" />
                 <span className="text-[10px] font-bold text-slate-500">{notification.timestamp}</span>
              </div>
              <h4 className="text-lg font-black tracking-tight mb-1">Table #{notification.table}</h4>
              <p className="text-slate-400 text-xs font-medium truncate">{notification.items}</p>
           </div>

           <button 
             onClick={(e) => {
               e.stopPropagation();
               setNotification(null);
             }}
             className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
           >
              <X size={16} />
           </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
