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
  const [selectedTableForOptions, setSelectedTableForOptions] = useState(null);
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
      case 'available': return 'bg-staff-success';
      case 'occupied': return 'bg-staff-secondary';
      case 'reserved': return 'bg-staff-primary';
      case 'cleaning': return 'bg-staff-error';
      default: return 'bg-staff-text-muted';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'available': return 'bg-staff-card border-staff-success/20';
      case 'occupied': return 'bg-staff-bg border-staff-secondary/40';
      case 'reserved': return 'bg-staff-bg border-staff-primary/20';
      case 'cleaning': return 'bg-staff-bg border-staff-error/20';
      default: return 'bg-staff-bg border-staff-border';
    }
  };

  return (
    <div className="min-h-screen bg-staff-bg flex flex-col font-staff">
      <StaffNotifications />
      
      <div className="flex-1 max-w-lg mx-auto w-full bg-staff-card shadow-xl shadow-staff-primary/5 min-h-screen relative pb-32">
        <header className="sticky top-0 z-40 bg-staff-card/95 backdrop-blur-xl border-b border-staff-border px-6 py-6">
          <div className="flex flex-col gap-6 mb-6">
             <div className="flex items-center justify-between">
                <div className="flex flex-col">
                   <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-staff-success animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-staff-text-muted">Live Floor Map</span>
                   </div>
                   <h1 className="text-xl font-black text-staff-text-primary tracking-tight">Table Management</h1>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-staff-primary text-staff-text-white flex items-center justify-center shadow-lg shadow-staff-primary/20">
                   <Map size={18} />
                </div>
             </div>
             
             <div className="flex items-center gap-3">
                <div className="bg-staff-bg p-1 rounded-2xl flex border border-staff-border flex-1">
                  {['all', 'available', 'occupied'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        filter === f ? 'bg-staff-card text-staff-text-primary shadow-sm' : 'text-staff-text-muted font-bold'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          <div className="relative group">
             <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-staff-text-muted transition-colors group-focus-within:text-staff-text-primary" />
             <input 
               type="text" 
               placeholder="Search table or guest..."
               className="w-full bg-staff-bg border border-staff-border rounded-2xl py-3.5 pl-14 pr-6 text-xs font-medium outline-none focus:ring-4 focus:ring-staff-primary/5 focus:bg-staff-card transition-all placeholder:text-staff-text-muted/40"
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
                onClick={() => {
                  if (table.order) {
                    setSelectedTableForOptions(table);
                  } else {
                    navigate(`/staff/table/${table.id}`);
                  }
                }}
                className={`relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-staff-primary/5 ${getStatusBg(table.status)}`}
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
                  <div className="pt-4 mt-auto border-t border-dashed border-staff-border flex flex-col items-center">
                    <button className="w-full flex items-center justify-center gap-2 bg-staff-card border border-staff-border py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-staff-text-primary hover:bg-staff-primary hover:text-staff-text-white transition-all">
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

      {/* Table Options Bottom Sheet */}
      <AnimatePresence>
        {selectedTableForOptions && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedTableForOptions(null)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ y: '100%' }}
               animate={{ y: 0 }}
               exit={{ y: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 300 }}
               className="relative w-full max-w-lg bg-white rounded-t-[3rem] overflow-hidden shadow-2xl p-8"
             >
                <div className="flex flex-col items-center mb-8">
                   <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-6" />
                   <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Options for</span>
                      <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Table {selectedTableForOptions.name}</h3>
                   </div>
                </div>

                <div className="space-y-3">
                   {[
                     { label: 'View KOT(s)', onClick: () => navigate(`/staff/table/${selectedTableForOptions.id}/kots`) },
                     { label: 'Move Table', onClick: () => alert('Coming Soon!') },
                     { label: 'Print Bill', onClick: () => alert('Coming Soon!') },
                     { label: 'Print Bill & Take Payment', onClick: () => navigate(`/staff/table/${selectedTableForOptions.id}/settle`) },
                     { label: 'Get Pin', onClick: () => alert('Coming Soon!') }
                   ].map((opt, i) => (
                     <button
                       key={i}
                       onClick={() => {
                         opt.onClick();
                         setSelectedTableForOptions(null);
                       }}
                       className="w-full bg-staff-bg border border-staff-border transition-all py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest text-staff-text-primary flex items-center justify-center gap-3 group"
                     >
                        {opt.label}
                     </button>
                   ))}
                </div>

                <button 
                  onClick={() => setSelectedTableForOptions(null)}
                  className="w-full mt-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                >
                   Cancel
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
