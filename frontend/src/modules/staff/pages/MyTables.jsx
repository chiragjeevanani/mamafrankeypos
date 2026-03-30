import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Map, Users, Clock, Plus, Filter, Sparkles } from 'lucide-react';
import { usePos } from '../../../modules/pos/context/PosContext';
import { TABLE_SECTIONS } from '../../../modules/pos/data/tablesMockData';
import { StaffNavbar } from '../components/StaffNavbar';
import { StaffNotifications } from '../components/StaffNotifications';

export default function MyTables() {
  const { orders } = usePos();
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  // Flatten all tables from all sections for the staff app display
  const displayTables = useMemo(() => {
    const allTables = TABLE_SECTIONS.flatMap(section => section.tables);
    return allTables.map(t => {
      const order = orders[t.id];
      let status = t.status === 'blank' ? 'available' : t.status;
      if (order) {
        if (order.status === 'running-kot') status = 'occupied';
        if (order.status === 'printed') status = 'occupied'; 
      }
      return { ...t, status, order };
    });
  }, [orders]);

  const filteredTables = filter === 'all' ? displayTables : displayTables.filter(t => t.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-emerald-500';
      case 'occupied': return 'bg-orange-500';
      case 'reserved': return 'bg-blue-500';
      case 'cleaning': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'available': return 'bg-emerald-50/50 border-emerald-100';
      case 'occupied': return 'bg-orange-50/50 border-orange-100';
      case 'reserved': return 'bg-blue-50/50 border-blue-100';
      case 'cleaning': return 'bg-rose-50/50 border-rose-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <StaffNotifications />
      
      <div className="flex-1 max-w-lg mx-auto w-full bg-white shadow-xl shadow-slate-200/50 min-h-screen relative pb-32">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-6 py-6">
          <div className="flex flex-col gap-6 mb-6">
             <div className="flex items-center justify-between">
                <div className="flex flex-col">
                   <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Floor Map</span>
                   </div>
                   <h1 className="text-xl font-black text-slate-900 tracking-tight">Table Management</h1>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
                   <Map size={18} />
                </div>
             </div>
             
             <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200 flex-1">
                  {['all', 'available', 'occupied'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 font-bold'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          <div className="relative group">
             <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-900" />
             <input 
               type="text" 
               placeholder="Search table or guest..."
               className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl py-3.5 pl-14 pr-6 text-xs font-medium outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all placeholder:text-slate-300"
             />
          </div>
        </header>

      <main className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTables.map((table) => (
              <motion.div
                key={table.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/staff/table/${table.id}`)}
                className={`relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-slate-900/5 ${getStatusBg(table.status)}`}
              >
                <div className="flex justify-between items-start mb-6">
                   <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-900 leading-none mb-1">{table.name}</span>
                      <div className="flex items-center gap-1.5 opacity-60">
                         <Users size={12} className="text-slate-400" />
                         <span className="text-[10px] font-bold text-slate-500 uppercase">{table.capacity || 4} Pax</span>
                      </div>
                   </div>
                   <div className={`w-3 h-3 rounded-full ${getStatusColor(table.status)} shadow-lg shadow-current/20`} />
                </div>

                {table.order ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Order</span>
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase italic animate-pulse ${table.order.status === 'printed' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                         {table.order.status}
                       </span>
                    </div>
                    <div className="flex items-end justify-between">
                       <div className="flex flex-col">
                          <span className="text-lg font-black text-slate-900 tracking-tighter">
                            ₹{table.order.kots?.reduce((acc, k) => acc + k.total, 0) || 0}
                          </span>
                          <div className="flex items-center gap-1 text-slate-400">
                             <Clock size={10} />
                             <span className="text-[9px] font-bold">
                               {new Date(table.order.sessionStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 mt-auto border-t border-dashed border-slate-200 flex flex-col items-center">
                    <button className="w-full flex items-center justify-center gap-2 bg-white/80 border border-slate-200 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition-all">
                       <Plus size={14} /> Open Tab
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      <StaffNavbar activeTab="tables" />
      </div>
    </div>
  );
}
