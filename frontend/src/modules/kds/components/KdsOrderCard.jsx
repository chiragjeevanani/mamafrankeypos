import { motion } from 'framer-motion';
import { Clock, AlertCircle, ShoppingBag, Hash, CheckCircle } from 'lucide-react';
import { useKdsTimer } from '../hooks/useKdsTimer';
import { useTheme } from '../../user/context/ThemeContext';

export function KdsOrderCard({ order, onClick }) {
  const { formatTime, isDelayed } = useKdsTimer(order.startTime);
  const { isDarkMode } = useTheme();

  const getStatusInfo = (status) => {
    switch (status) {
      case 'new': return { color: 'bg-blue-600', text: 'New', border: 'border-blue-600/30' };
      case 'preparing': return { color: 'bg-[#E1261C]', text: 'Preparing', border: 'border-[#E1261C]/30' };
      case 'delayed': return { color: 'bg-red-700', text: 'Delayed', border: 'border-red-700/40' };
      case 'ready': return { color: 'bg-emerald-700', text: 'Ready', border: 'border-emerald-700/30' };
      default: return { color: 'bg-stone-600', text: status, border: 'border-stone-600/20' };
    }
  };

  const statusInfo = getStatusInfo(order.status);
  const effectiveStatusColor = isDelayed ? 'bg-red-700' : statusInfo.color;

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      onClick={() => onClick(order)}
      className={`border rounded-2xl overflow-hidden cursor-pointer flex flex-col shadow-lg transition-all duration-200 ${
        isDarkMode 
          ? `bg-[#212325] ${statusInfo.border}` 
          : `bg-white border-stone-200 hover:border-stone-300 hover:shadow-xl`
      }`}
    >
      {/* Header — compact */}
      <div className={`${effectiveStatusColor} px-4 py-3 flex items-center gap-2.5 overflow-hidden`}>
        <div className="flex-shrink-0 w-8 h-8 bg-white/15 border border-white/10 rounded-lg flex items-center justify-center text-white">
          <Hash size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-white leading-none mb-0.5 truncate">
            #{order.orderNum}
          </h3>
          <p className="text-[10px] font-bold text-white/75 uppercase tracking-widest truncate">
            {order.source}
          </p>
        </div>
        <div className="flex-shrink-0 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
          <span className="text-[10px] font-black text-white uppercase tracking-wide leading-none whitespace-nowrap">
            {order.table.startsWith('T') ? order.table : `T${order.table}`}
          </span>
        </div>
      </div>

      {/* Body — compact typography */}
      <div className="p-4 flex-1 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-black text-xs border transition-colors shrink-0 ${
              isDarkMode ? 'bg-[#2e3032] text-[#D4AF37] border-white/8' : 'bg-stone-100 text-[#E1261C] border-stone-200'
            }`}>
              {item.quantity}x
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-bold leading-tight uppercase tracking-tight transition-colors ${
                isDarkMode ? 'text-stone-100' : 'text-stone-800'
              }`}>{item.name}</h4>
              {item.note && (
                <div className="mt-1 flex items-start gap-1.5 text-red-500">
                  <AlertCircle size={11} className="mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold uppercase italic leading-tight">{item.note}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer — compact */}
      <div className={`px-4 py-3 border-t flex items-center justify-between mt-auto transition-colors ${
        isDarkMode ? 'bg-black/30 border-white/6' : 'bg-stone-50 border-stone-100'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${effectiveStatusColor} animate-pulse`} />
          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
            isDarkMode ? 'text-stone-400' : 'text-stone-500'
          }`}>
            {isDelayed ? 'Delayed' : statusInfo.text}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 font-mono text-sm font-black transition-colors ${
          isDelayed ? 'text-red-400' : (isDarkMode ? 'text-[#D4AF37]' : 'text-[#8D6E63]')
        }`}>
          <Clock size={13} />
          <span>{formatTime}</span>
        </div>
      </div>
    </motion.div>
  );
}
