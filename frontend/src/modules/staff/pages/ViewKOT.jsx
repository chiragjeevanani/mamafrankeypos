import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit3, Clock, ChevronRight, Trash2, X, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { usePos } from '../../../modules/pos/context/PosContext';

export default function ViewKOT() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, carOrders } = usePos();
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Try to find the order in both tables and car orders
  const order = orders[id] || carOrders[id];
  const lastKOT = order?.kots?.[order.kots.length - 1];

  return (
    <div className="min-h-screen bg-staff-bg flex flex-col items-center">
      <div className="w-full max-w-lg bg-staff-card min-h-screen flex flex-col shadow-2xl relative overflow-hidden">
        {/* Red Header as per mockup */}
        <header className="bg-staff-primary px-6 py-6 flex items-center gap-4 shrink-0 shadow-lg relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-staff-card/10 rounded-full text-white transition-colors"
          >
             <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase">Table No {id}</h1>
        </header>

        {/* KOT Number and Actions */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-staff-border bg-staff-card sticky top-0 z-10 shadow-sm transition-all duration-300">
           <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest text-staff-text-muted">Current Session</span>
              <h2 className="text-lg font-black text-staff-text-primary tracking-tight">
                KOT No. {lastKOT?.id || '--'}
              </h2>
           </div>
           
           <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate(`/staff/table/${id}`)}
                className="p-3 bg-staff-bg rounded-2xl text-staff-text-primary hover:bg-slate-100 transition-colors shadow-sm"
              >
                 <Edit3 size={18} />
              </button>
              <button 
                onClick={() => setShowCancelModal(true)}
                className="p-3 bg-staff-error/10 rounded-2xl text-staff-error hover:bg-rose-100 transition-colors shadow-sm"
              >
                 <Trash2 size={18} />
              </button>
           </div>
        </div>

        {/* Dishes List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {!lastKOT ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
               <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center mb-4">
                  <Clock size={24} className="text-staff-text-muted" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-staff-text-muted">No KOT found for this table</p>
            </div>
          ) : (
            <>
              <div className="bg-staff-bg/50 rounded-[2rem] border border-staff-border p-6 space-y-4 shadow-sm">
                {lastKOT.items.map((item, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx} 
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-staff-card border border-staff-border flex items-center justify-center text-[10px] font-black text-staff-text-primary shadow-sm group-hover:scale-110 transition-transform">
                       {item.quantity}x
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-bold text-staff-text-primary leading-tight">{item.name}</p>
                       <p className="text-[9px] font-black uppercase tracking-widest text-staff-text-muted">Portion Defined</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-staff-card border border-staff-border flex items-center justify-center text-slate-300">
                       <ChevronRight size={14} />
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Previous KOT Summary (Subtle) */}
              {order.kots.length > 1 && (
                <div className="pt-8 px-2">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-staff-text-muted mb-4 text-center">Previous KOTs in this session</h3>
                   <div className="space-y-3">
                      {order.kots.slice(0, -1).reverse().map((kot) => (
                        <div key={kot.id} className="flex items-center justify-between p-4 bg-staff-card border border-staff-border rounded-2xl opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer shadow-sm">
                           <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-staff-text-primary">KOT #{kot.id}</span>
                              <span className="text-[10px] font-bold text-staff-text-muted">• {kot.time}</span>
                           </div>
                           <span className="text-xs font-black text-teal-600">₹{kot.total}</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-8 bg-staff-card border-t border-staff-border shrink-0">
           <button 
             onClick={() => navigate(`/staff/table/${id}`)}
             className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all"
           >
              Add More Items
           </button>
        </div>
      </div>

      {/* Cancel KOT Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowCancelModal(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative w-full max-w-xs bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col border-t-[4px] border-staff-primary"
             >
                <div className="p-6 flex flex-col items-center text-staff-text-primary relative bg-white border-b border-staff-border">
                   <div className="w-12 h-12 bg-staff-primary/10 rounded-xl flex items-center justify-center mb-3 text-staff-primary shadow-sm">
                      <AlertCircle size={24} />
                   </div>
                   <h3 className="text-base font-black uppercase tracking-tight">Cancel KOT</h3>
                   <p className="text-[9px] font-black uppercase tracking-widest text-staff-text-muted mt-1">Management Pin Required</p>
                   <button 
                     onClick={() => setShowCancelModal(false)}
                     className="absolute top-4 right-4 p-1.5 bg-slate-50 rounded-lg text-staff-text-muted hover:bg-slate-100 transition-colors"
                   >
                      <X size={14} />
                   </button>
                </div>

                <div className="p-6 space-y-5">
                   <div className="space-y-3">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-staff-text-muted ml-1">Password *</label>
                         <input 
                           type="password" 
                           placeholder="Enter staff password"
                           className="w-full bg-[#FDF2F2] border border-staff-primary/5 rounded-xl py-3 px-5 text-xs font-medium focus:ring-4 focus:ring-staff-primary/5 focus:border-staff-primary transition-all outline-none text-staff-text-primary"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-staff-text-muted ml-1">Cancel Reason *</label>
                         <textarea 
                           rows={2}
                           placeholder="Enter cancellation reason..."
                           className="w-full bg-[#FDF2F2] border border-staff-primary/5 rounded-xl py-3 px-5 text-xs font-medium focus:ring-4 focus:ring-staff-primary/5 focus:border-staff-primary transition-all outline-none resize-none text-staff-text-primary"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setShowCancelModal(false)}
                        className="py-4 bg-slate-50 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest text-staff-text-muted hover:bg-slate-100 transition-colors border border-slate-100"
                      >
                         Back
                      </button>
                      <button 
                        onClick={() => {
                          alert('KOT Cancelled Successfully');
                          setShowCancelModal(false);
                        }}
                        className="py-4 bg-staff-primary rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest text-white shadow-xl shadow-staff-primary/20 hover:opacity-90 transition-all font-bold"
                      >
                         Confirm
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
