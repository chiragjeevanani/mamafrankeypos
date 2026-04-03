import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, Banknote, CheckCircle2, Receipt, X, Printer, Download } from 'lucide-react';
import { useState } from 'react';
import { usePos } from '../../../modules/pos/context/PosContext';

export default function SettleBill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, carOrders, settleOrder, clearTable } = usePos();
  const [showInvoice, setShowInvoice] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const order = orders[id] || carOrders[id];
  const totalAmount = order?.kots?.reduce((acc, kot) => acc + kot.total, 0) || 0;

  const handleSettle = (method) => {
    if (method === 'Cash') {
      setShowCashModal(true);
      return;
    }
    
    processPayment(method);
  };

  const processPayment = (method) => {
    settleOrder(id, method);
    setPaymentSuccess(true);
    
    setTimeout(() => {
      clearTable(id);
      navigate('/staff/tables');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-staff-bg flex flex-col items-center font-staff">
      <div className="w-full max-w-lg bg-staff-card min-h-screen flex flex-col shadow-2xl relative overflow-hidden">
        {/* Red Header as per mockup */}
        <header className="bg-staff-primary px-6 py-6 flex items-center justify-between shrink-0 shadow-lg relative z-10 text-staff-text-white">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-staff-card/10 rounded-full transition-colors"
            >
               <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-tight">Table No : {id}</h1>
          </div>
          <button 
            onClick={() => setShowInvoice(true)}
            className="text-xs font-black uppercase tracking-widest bg-staff-card/20 px-4 py-3 rounded-xl hover:bg-staff-card/30 transition-all border border-white/10 active:scale-95"
          >
             View Invoice
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
           {/* Amount Display */}
           <div className="flex flex-col items-center py-10 bg-staff-bg rounded-[3rem] border border-staff-border shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Receipt size={120} />
              </div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-staff-text-muted mb-2">Total Amount Due</p>
              <h2 className="text-6xl font-black text-staff-text-primary tracking-tighter">
                <span className="text-staff-secondary text-3xl mr-1">₹</span>{totalAmount.toFixed(1)}
              </h2>
              <div className="mt-4 flex items-center gap-2 text-staff-text-muted text-[10px] font-bold">
                 <Clock size={12} />
                 <span>Printed {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
           </div>

           {/* Success Notification */}
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-staff-success/10 border border-staff-success/20 rounded-3xl p-6 flex gap-4 items-start shadow-sm"
           >
              <div className="w-10 h-10 bg-staff-success rounded-2xl flex items-center justify-center text-staff-text-white shrink-0 shadow-lg shadow-staff-success/20">
                 <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                 <p className="text-sm font-bold text-staff-text-primary leading-tight">Your bill is printed successfully.</p>
                 <p className="text-xs font-medium text-staff-text-secondary">Please collect it on the assigned printer station.</p>
              </div>
           </motion.div>

           {/* Payment Selection */}
           <div className="space-y-6 pt-4">
              <div className="flex flex-col gap-1 ml-1">
                 <h3 className="text-lg font-black text-staff-text-primary">Collect Payment</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest text-staff-text-muted">Manual Settlement Mode</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 {[
                   { id: 'Card', label: 'Card', icon: <CreditCard size={28} />, color: 'bg-staff-primary' },
                   { id: 'Cash', label: 'Cash', icon: <Banknote size={28} />, color: 'bg-teal-600' }
                 ].map((method) => (
                   <motion.button
                     key={method.id}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => handleSettle(method.id)}
                     className="bg-staff-card border border-staff-border rounded-[2.5rem] p-8 flex flex-col items-center gap-4 hover:border-slate-900 hover:shadow-xl transition-all group"
                   >
                      <div className={`w-16 h-16 ${method.color} text-staff-text-white rounded-3xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
                         {method.icon}
                      </div>
                      <span className="text-sm font-black uppercase tracking-widest text-staff-text-primary">{method.label}</span>
                   </motion.button>
                 ))}
              </div>
           </div>
        </div>

        {/* Cancel Action */}
        <div className="p-8 shrink-0">
           <button 
             onClick={() => navigate(-1)}
             className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-staff-text-muted hover:text-staff-error transition-colors text-center"
           >
              Go Back to Floor Map
           </button>
        </div>
      </div>

      {/* Invoice Review Modal */}
      <AnimatePresence>
        {showInvoice && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowInvoice(false)}
               className="absolute inset-0 bg-staff-primary/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ y: '100%' }}
               animate={{ y: 0 }}
               exit={{ y: '100%' }}
               className="relative w-full max-w-lg bg-staff-card rounded-t-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
             >
                <div className="p-8 border-b border-staff-border flex items-center justify-between bg-staff-bg/50 shrink-0">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-staff-primary rounded-2xl flex items-center justify-center text-staff-text-white shadow-xl shadow-slate-900/20">
                         <Receipt size={24} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-staff-text-primary uppercase italic leading-none mb-1">Final Invoice</h3>
                         <p className="text-[10px] font-black uppercase tracking-widest text-staff-text-muted leading-none">Table {id} • Review Draft</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setShowInvoice(false)}
                     className="p-4 bg-staff-card border border-staff-border rounded-2xl text-staff-text-primary shadow-sm hover:bg-staff-bg transition-colors"
                   >
                      <X size={20} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                   {/* Table Header Section */}
                   <div className="flex items-center justify-between text-staff-text-muted text-[10px] uppercase font-black tracking-widest border-b border-staff-border pb-4">
                      <span>Item Name</span>
                      <div className="flex items-center gap-12">
                         <span className="w-10 text-center">Qty</span>
                         <span className="w-16 text-right">Price</span>
                      </div>
                   </div>

                   {/* Items List */}
                   <div className="space-y-6">
                      {order?.kots?.flatMap(kot => kot.items).map((item, i) => (
                        <div key={i} className="flex items-center justify-between group">
                           <div className="flex flex-col flex-1">
                              <span className="text-sm font-bold text-staff-text-primary group-hover:text-staff-secondary transition-colors">{item.name}</span>
                              <span className="text-[9px] font-black uppercase tracking-widest text-staff-text-muted italic">Hsn 2106 • Service</span>
                           </div>
                           <div className="flex items-center gap-12">
                              <span className="w-10 text-center text-sm font-black text-staff-text-muted">{item.quantity}</span>
                              <span className="w-16 text-right text-sm font-black text-staff-text-primary">₹{item.price * item.quantity}</span>
                           </div>
                        </div>
                      ))}
                   </div>

                   {/* Calculations */}
                   <div className="pt-8 border-t border-staff-border space-y-4">
                      <div className="flex justify-between text-sm font-bold text-slate-500">
                         <span>Subtotal</span>
                         <span>₹{totalAmount.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-500">
                         <span>GST (18%)</span>
                         <span>₹{(totalAmount * 0.18).toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between pt-4 border-t border-staff-border">
                         <span className="text-lg font-black text-staff-text-primary uppercase italic">Grand Total</span>
                         <span className="text-2xl font-black text-staff-secondary tracking-tighter">₹{(totalAmount * 1.18).toFixed(0)}</span>
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-staff-primary flex items-center gap-4 shrink-0">
                   <button className="flex-1 bg-staff-card/10 text-staff-text-white border border-white/10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-staff-card/20 transition-all">
                      <Download size={16} /> Save PDF
                   </button>
                   <button className="flex-1 bg-teal-500 text-staff-text-primary py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-teal-500/20 hover:bg-teal-400 transition-all">
                      <Printer size={16} /> Print Copy
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cash Settlement Modal */}
      <AnimatePresence>
        {showCashModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowCashModal(false)}
               className="absolute inset-0 bg-staff-primary/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative w-full max-w-sm bg-staff-card rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
             >
                <div className="bg-staff-primary p-6 flex flex-col items-center text-staff-text-white relative">
                   <h3 className="text-lg font-black uppercase tracking-tight">Cash</h3>
                   <button 
                     onClick={() => setShowCashModal(false)}
                     className="absolute top-4 right-4 p-2 bg-staff-card/10 rounded-xl hover:bg-staff-card/20 transition-colors"
                   >
                      <X size={16} />
                   </button>
                </div>

                <div className="p-8 space-y-4">
                   <div className="space-y-4">
                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-staff-text-muted ml-1">Customer Paid</label>
                         <input 
                           type="number" 
                           placeholder="0"
                           className="w-full bg-staff-bg border border-staff-border rounded-2xl py-3 px-5 text-sm font-bold focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 transition-all outline-none"
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-staff-text-muted ml-1">Return to Customer</label>
                         <input 
                           type="number" 
                           readOnly
                           placeholder="0"
                           className="w-full bg-slate-100 border border-staff-border rounded-2xl py-3 px-5 text-sm font-bold text-staff-text-muted outline-none"
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-staff-text-muted ml-1">Enter Tip</label>
                         <input 
                           type="number" 
                           placeholder="0"
                           className="w-full bg-staff-bg border border-staff-border rounded-2xl py-3 px-5 text-sm font-bold focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all outline-none"
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-staff-text-muted ml-1">Settlement Amount</label>
                         <input 
                           type="number" 
                           placeholder={totalAmount.toFixed(0)}
                           className="w-full bg-staff-bg border border-staff-border rounded-2xl py-3 px-5 text-sm font-bold focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all outline-none"
                         />
                         <p className="text-[8px] font-bold text-staff-text-muted ml-1 italic mt-1">Are you sure want to settle bill by Cash ?</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mt-6">
                      <button 
                        onClick={() => setShowCashModal(false)}
                        className="py-4 bg-slate-100 rounded-2xl text-[9px] font-black uppercase tracking-widest text-staff-text-muted hover:bg-slate-200 transition-colors"
                      >
                         Cancel
                      </button>
                      <button 
                        onClick={() => {
                          setShowCashModal(false);
                          processPayment('Cash');
                        }}
                        className="py-4 bg-staff-primary rounded-2xl text-[9px] font-black uppercase tracking-widest text-staff-text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all"
                      >
                         Submit
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {paymentSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-staff-primary/40 backdrop-blur-sm"
          >
             <div className="bg-staff-card rounded-[3rem] p-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                  className="w-24 h-24 bg-staff-success rounded-full flex items-center justify-center text-staff-text-white mb-6 shadow-xl shadow-staff-success/20"
                >
                   <CheckCircle2 size={48} />
                </motion.div>
                <h3 className="text-2xl font-black text-staff-text-primary mb-2 uppercase italic tracking-tight">Payment Success!</h3>
                <p className="text-sm font-bold text-staff-text-secondary max-w-[200px]">Transaction completed. Table {id} has been cleared.</p>
                <div className="absolute top-0 left-0 w-full h-2 bg-staff-success" />
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple Clock mock for the timestamp
function Clock({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
