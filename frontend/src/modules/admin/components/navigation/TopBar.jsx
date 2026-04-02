
import React, { useState } from 'react';
import { Search, Bell, UserCircle, RefreshCw, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClickSound } from '../../../pos/utils/sounds';

export default function TopBar() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-14 bg-[#2C2C2C] border-b border-white/8 flex items-center justify-between px-6 shrink-0 relative z-40 shadow-md">
      <div className="flex-1 flex items-center">
        {/* Intelligence Search */}
        <div className="max-w-xs w-full relative">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-white/8 border border-white/15 rounded focus-within:bg-white/12 focus-within:border-white/30 transition-all">
            <Search size={14} className="text-white/60" />
            <input 
              type="text" 
              placeholder="System search... (⌘K)" 
              className="bg-transparent border-none outline-none text-[11px] font-bold uppercase tracking-wider text-white placeholder:text-white/40 w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
           <button 
             onClick={() => { playClickSound(); setShowNotifications(!showNotifications); }}
             className={`p-2 transition-colors relative rounded ${showNotifications ? 'text-white bg-white/12' : 'text-white/70 hover:text-white hover:bg-white/8'}`}
           >
              <Bell size={18} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-[#FFD600] rounded-full border border-[#2C2C2C]" />
           </button>
           
           <AnimatePresence>
             {showNotifications && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 10 }}
                 className="absolute top-full right-0 mt-2 w-72 bg-[#2C2C2C] border border-white/12 shadow-2xl rounded overflow-hidden"
               >
                   <div className="p-3 bg-[#222222] border-b border-white/8 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Notifications</span>
                      <button onClick={() => setShowNotifications(false)} className="text-white/40 hover:text-white transition-colors">
                        <X size={14} />
                      </button>
                   </div>
                   <div className="p-5 text-center">
                      <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">No unread alerts</p>
                   </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>
 
        <div className="h-6 w-px bg-white/15" />

        <div className="flex items-center gap-3">
           <div className="text-right hidden sm:block">
              <p className="text-[11px] font-black uppercase tracking-tight leading-none text-white">Chiraag J.</p>
              <p className="text-[9px] text-[#FFD600] font-bold uppercase tracking-widest mt-1">Super Admin</p>
           </div>
           <div 
             className="w-8 h-8 rounded bg-[#E1261C]/40 border border-[#E1261C]/60 flex items-center justify-center text-white/80 shadow-inner cursor-pointer hover:bg-[#E1261C]/60 transition-all"
             onClick={playClickSound}
           >
              <UserCircle size={20} />
           </div>
        </div>
      </div>
    </header>
  );
}
