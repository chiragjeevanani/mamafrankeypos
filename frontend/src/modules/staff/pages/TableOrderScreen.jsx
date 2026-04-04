import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Plus, Minus, ShoppingCart, Trash2, Send, X } from 'lucide-react';
import { usePos } from '../../../modules/pos/context/PosContext';
import { POS_MENU_ITEMS as MENU_ITEMS, POS_CATEGORIES as CATEGORIES } from '../../../modules/pos/data/posMenu';
import { useEffect } from 'react';

export default function TableOrderScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Sync ID with POS format (t1, t2 etc)
  const tableId = id;
  
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]?.id || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentOrder, setCurrentOrder] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [staff, setStaff] = useState(null);
  const [selectedItemForVariants, setSelectedItemForVariants] = useState(null);
  const [isOrderViewOpen, setIsOrderViewOpen] = useState(false);
  const [showCustomerInfoModal, setShowCustomerInfoModal] = useState(false);
  const { placeKOT } = usePos();

  useEffect(() => {
    const savedStaff = localStorage.getItem('staff_access');
    if (savedStaff) setStaff(JSON.parse(savedStaff));
  }, []);

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.catId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToOrder = (item, variant = null) => {
    const itemToPlace = variant 
      ? { ...item, name: `${item.name} (${variant.name})`, price: variant.price, variantId: variant.id, id: `${item.id}-${variant.id}` }
      : item;

    // Visual feedback
    setFeedback(item.id);
    setTimeout(() => setFeedback(null), 800);

    setCurrentOrder(prev => {
      const existing = prev.find(i => i.id === itemToPlace.id);
      if (existing) {
        return prev.map(i => i.id === itemToPlace.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...itemToPlace, quantity: 1 }];
    });

    if (variant) setSelectedItemForVariants(null);
  };

  const removeFromOrder = (itemId) => {
    setCurrentOrder(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    setCurrentOrder(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const total = currentOrder.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-staff-bg flex flex-col items-center">
      <div className="w-full max-w-lg bg-staff-card min-h-screen flex flex-col shadow-2xl relative overflow-hidden">
        {/* Menu Side */}
        <div className={`flex flex-col h-screen w-full bg-staff-card transition-all duration-500 ${isOrderViewOpen ? 'hidden md:flex flex-[3] border-r border-staff-border' : 'flex-1'}`}>
          <header className="p-6 border-b border-staff-border bg-staff-card shrink-0">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => navigate(-1)} className="p-3 bg-staff-bg rounded-2xl text-staff-text-primary group">
                 <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h2 className="text-xl font-black text-staff-text-primary uppercase">{tableId.replace('t', 'Table ')}</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-staff-text-muted">Add Items to Order</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-staff-text-muted" />
                <input 
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-staff-bg border border-staff-border rounded-2xl py-3 pl-12 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-staff-primary/5 transition-all"
                />
              </div>
            </div>
          </header>

          <div className="flex overflow-x-auto p-3 gap-2 no-scrollbar bg-staff-bg sticky top-0 z-10 shrink-0">
             {CATEGORIES.map((cat) => (
               <button
                 key={cat.id}
                 onClick={() => setActiveCategory(cat.id)}
                 className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
                   activeCategory === cat.id 
                   ? 'bg-staff-primary border-staff-primary text-white shadow-lg shadow-staff-primary/20' 
                   : 'bg-white text-staff-text-primary/70 border-staff-border hover:border-staff-primary/30'
                 }`}
               >
                 {cat.label || cat.name}
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4 auto-rows-max no-scrollbar">
             {filteredItems.map((item) => (
               <motion.div
                 key={item.id}
                 whileTap={{ scale: 0.96 }}
                 onClick={() => {
                    const dynamicItem = (item.variants && item.variants.length > 0) 
                      ? item 
                      : { 
                        ...item, 
                        variants: [
                          { id: 'half', name: 'Half', price: Math.round(item.price * 0.6 / 5) * 5 }, 
                          { id: 'full', name: 'Full', price: item.price }
                        ] 
                      };
                    setSelectedItemForVariants(dynamicItem);
                  }}
                 className="bg-staff-bg border border-staff-border rounded-2xl p-2.5 space-y-1.5"
               >
                 <AnimatePresence>
                   {feedback === item.id && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 z-20 bg-emerald-500/90 backdrop-blur-sm flex flex-col items-center justify-center  p-4"
                     >
                        <motion.div
                           initial={{ scale: 0.5 }}
                           animate={{ scale: 1 }}
                           transition={{ type: "spring", damping: 12 }}
                           className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 shadow-lg"
                        >
                           <Plus size={20} className="text-emerald-500 stroke-[3px]" />
                        </motion.div>
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Added!</span>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <div className="w-full aspect-[3/2] rounded-lg mb-1.5">
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                 </div>
                 <h3 className="mb-0.5 leading-tight text-[11px] font-black text-staff-text-primary">{item.name}</h3>
                 <p className="text-sm font-black text-staff-primary">₹{item.price}</p>
                 <div className="mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-staff-secondary text-staff-text-primary text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                       Add to Order
                    </span>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>



        {/* Cart Side */}
        <div className={`
          flex-[2] bg-[#FDF2F2] flex flex-col shadow-2xl overflow-hidden transition-all duration-500
          ${isOrderViewOpen ? 'fixed inset-0 z-[60] h-screen w-screen' : 'hidden'}
        `}>
           <div className="p-8 border-t-[6px] border-staff-primary border-b border-staff-border bg-staff-card shrink-0 flex items-center justify-between">
              <div>
                 <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black text-staff-text-primary">Guest Order</h2>
                    {isOrderViewOpen && (
                      <span className="bg-staff-secondary/10 text-staff-text-secondary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-staff-secondary/20">Review Mode</span>
                    )}
                 </div>
                 <p className="text-[10px] font-black text-staff-text-muted uppercase tracking-widest">Table {tableId.replace('t', '')} • {currentOrder.length} Items</p>
              </div>
              
              {isOrderViewOpen ? (
                <button 
                  onClick={() => setIsOrderViewOpen(false)}
                  className="w-12 h-12 bg-staff-bg rounded-2xl flex items-center justify-center text-staff-text-primary hover:bg-slate-100 transition-colors"
                >
                   <X size={24} />
                </button>
              ) : (
                <div className="w-10 h-10 bg-staff-bg rounded-xl flex items-center justify-center text-staff-secondary">
                   <ShoppingCart size={20} />
                </div>
              )}
           </div>

           <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {currentOrder.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                   <div className="w-20 h-20 border-2 border-dashed border-white/10 rounded-full flex items-center justify-center mb-4">
                      <Minus size={24} className="" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-staff-text-muted">Basket is empty</p>
                </div>
              ) : (
                <AnimatePresence>
                  {currentOrder.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      className="bg-white border border-staff-primary/10 p-4 rounded-[2rem] flex items-center gap-3 group shadow-sm"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] flex items-center justify-center text-staff-text-primary font-black overflow-hidden border border-staff-primary/5 shrink-0">
                         <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-sm font-bold text-staff-text-primary leading-tight mb-1 truncate">{item.name}</h4>
                         <p className="text-staff-primary font-black text-sm">₹{item.price * item.quantity}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                         <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-staff-text-primary hover:bg-slate-100 transition-colors shadow-sm"
                            >
                               <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-xs font-black text-staff-text-primary">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-staff-primary flex items-center justify-center text-white hover:opacity-90 shadow-sm transition-all"
                            >
                               <Plus size={12} />
                            </button>
                         </div>
                         <button 
                           onClick={() => removeFromOrder(item.id)}
                           className="text-[10px] font-black uppercase tracking-widest text-staff-error/60 flex items-center gap-1 hover:text-staff-error"
                         >
                            <Trash2 size={10} /> Remove
                         </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
           </div>

           <div className="p-8 bg-staff-card border-t border-staff-border shrink-0">
              <div className="flex justify-between items-end mb-8">
                 <div>
                    <p className="text-[10px] font-black text-staff-text-muted uppercase tracking-widest mb-1">Total Bill</p>
                    <p className="text-3xl font-black text-staff-text-primary tracking-tighter">₹{total}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-staff-text-muted uppercase tracking-widest mb-1">Tax Incl.</p>
                    <p className="text-xs font-bold text-staff-secondary underline decoration-dotted underline-offset-4">18% GST</p>
                 </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={currentOrder.length === 0}
                onClick={() => setShowCustomerInfoModal(true)}
                className="w-full bg-staff-secondary text-staff-text-primary py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-staff-secondary-light transition-all disabled:opacity-30 disabled:grayscale"
              >
                 Confirm & Send KOT <Send size={18} />
              </motion.button>
           </div>
        </div>

        {/* Customer Info Modal */}
        <AnimatePresence>
          {showCustomerInfoModal && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setShowCustomerInfoModal(false)}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
               />
               <motion.div 
                 initial={{ y: '100%' }}
                 animate={{ y: 0 }}
                 exit={{ y: '100%' }}
                 className="relative w-full max-w-lg bg-white rounded-t-[3rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col p-8 border-t-[6px] border-staff-primary"
               >
                  <div className="flex flex-col items-center mb-10">
                     <div className="w-12 h-1.5 bg-slate-100 rounded-full mb-8" />
                     <div className="flex flex-col items-center gap-2">
                        <div className="bg-staff-secondary/10 text-staff-text-secondary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-staff-secondary/20">
                           Session Setup
                        </div>
                        <h3 className="text-xl font-black text-staff-text-primary uppercase tracking-tight">Customer Details</h3>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-staff-text-muted ml-1">Number of Guests (Pax) *</label>
                           <input 
                             type="number" 
                             placeholder="E.g. 4"
                             className="w-full bg-[#FDF2F2] border border-staff-primary/5 rounded-2xl py-4.5 px-6 text-sm font-medium focus:ring-4 focus:ring-staff-primary/5 focus:border-staff-primary transition-all outline-none text-staff-text-primary"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-staff-text-muted ml-1">Customer Name</label>
                           <input 
                             type="text" 
                             placeholder="E.g. John Doe"
                             className="w-full bg-[#FDF2F2] border border-staff-primary/5 rounded-2xl py-4.5 px-6 text-sm font-medium focus:ring-4 focus:ring-staff-primary/5 focus:border-staff-primary transition-all outline-none text-staff-text-primary"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-staff-text-muted ml-1">Phone Number</label>
                           <input 
                             type="tel" 
                             placeholder="E.g. +91 98765 43210"
                             className="w-full bg-[#FDF2F2] border border-staff-primary/5 rounded-2xl py-4.5 px-6 text-sm font-medium focus:ring-4 focus:ring-staff-primary/5 focus:border-staff-primary transition-all outline-none text-staff-text-primary"
                           />
                        </div>
                     </div>

                     <div className="pt-6 flex flex-col gap-4">
                        <button 
                          onClick={() => {
                            placeKOT(tableId, currentOrder, total, staff);
                            setShowCustomerInfoModal(false);
                            alert(`KOT Sent for Table ${id}!`);
                            navigate(-1);
                          }}
                          className="w-full bg-staff-secondary text-staff-text-primary py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-staff-secondary-light transition-all flex items-center justify-center gap-3"
                        >
                           Submit & Send KOT <Send size={18} />
                        </button>
                        <button 
                          onClick={() => setShowCustomerInfoModal(false)}
                          className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-staff-text-muted hover:text-staff-error transition-colors"
                        >
                           Back to Review
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

      {/* Floating View Order Button (Mobile Only) */}
      {currentOrder.length > 0 && !isOrderViewOpen && !selectedItemForVariants && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-40 md:hidden"
        >
          <button 
            onClick={() => setIsOrderViewOpen(true)}
            className="w-full bg-staff-primary border border-white/10 p-4 rounded-[2.5rem] shadow-2xl flex items-center justify-between group overflow-hidden relative text-staff-text-white"
          >
            {/* Glossy Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-staff-secondary rounded-xl flex items-center justify-center text-staff-text-primary shadow-lg shadow-staff-secondary/20">
                 <ShoppingCart size={18} className="stroke-[2.5px]" />
              </div>
              <div className="text-left">
                 <p className="text-sm font-bold italic tracking-tight">{currentOrder.length} Items in Basket</p>
                 <p className="text-[9px] font-bold uppercase tracking-widest text-staff-secondary leading-none">Tap to View Order</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
               <div className="text-right mr-1">
                  <p className="text-base font-bold tracking-tighter">₹{total}</p>
               </div>
               <div className="w-9 h-9 bg-staff-text-white/5 rounded-xl flex items-center justify-center">
                  <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
          </button>
        </motion.div>
      )}

      {/* Variant Selection Modal */}
      <AnimatePresence>
        {selectedItemForVariants && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItemForVariants(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-white rounded-t-[3rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Select Size</p>
                  <h3 className="text-xl font-bold text-slate-900">{selectedItemForVariants.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedItemForVariants(null)}
                  className="p-4 bg-slate-100 rounded-2xl text-slate-900"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
                {selectedItemForVariants.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => addToOrder(selectedItemForVariants, variant)}
                    className="w-full bg-staff-bg border border-staff-border rounded-[2rem] p-5 flex items-center justify-between group hover:bg-staff-primary hover:border-staff-primary transition-all"
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold text-staff-text-primary group-hover:text-staff-text-white transition-colors">{variant.name}</p>
                      <p className="text-[10px] font-medium uppercase tracking-widest text-staff-text-muted group-hover:text-staff-text-white/40 transition-colors">Portion</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-staff-primary group-hover:text-staff-secondary transition-colors">₹{variant.price}</p>
                      <div className="w-10 h-10 bg-staff-primary text-staff-text-white rounded-xl flex items-center justify-center group-hover:bg-staff-card group-hover:text-staff-text-primary transition-all">
                        <Plus size={18} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-center">
                  Prices inclusive of all taxes
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
