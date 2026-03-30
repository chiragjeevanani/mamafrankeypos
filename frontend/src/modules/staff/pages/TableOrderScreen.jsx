import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Plus, Minus, ShoppingCart, Trash2, Send } from 'lucide-react';
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

  const addToOrder = (item) => {
    // Visual feedback
    setFeedback(item.id);
    setTimeout(() => setFeedback(null), 800);

    setCurrentOrder(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <div className="w-full max-w-lg bg-white min-h-screen flex flex-col shadow-2xl relative overflow-hidden">
        {/* Menu Side */}
        <div className="flex-[3] flex flex-col h-[60vh] md:h-full bg-white border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden">
          <header className="p-6 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => navigate(-1)} className="p-3 bg-slate-100 rounded-2xl text-slate-900 group">
                 <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase">{tableId.replace('t', 'Table ')}</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Items to Order</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                />
              </div>
            </div>
          </header>

          <div className="flex overflow-x-auto p-3 gap-2 no-scrollbar bg-slate-50 sticky top-0 z-10 shrink-0">
             {CATEGORIES.map((cat) => (
               <button
                 key={cat.id}
                 onClick={() => setActiveCategory(cat.id)}
                 className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
                   activeCategory === cat.id 
                   ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                   : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
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
                 onClick={() => addToOrder(item)}
                 className="bg-slate-50 border border-slate-200 rounded-[2rem] p-4 flex flex-col items-center text-center group cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-slate-900/5 hover:border-slate-300 transition-all relative overflow-hidden"
               >
                 <AnimatePresence>
                   {feedback === item.id && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 z-20 bg-emerald-500/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4"
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

                 <div className="w-full aspect-square rounded-[1.5rem] overflow-hidden mb-4 bg-slate-200">
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                 </div>
                 <h3 className="text-xs font-bold text-slate-900 mb-1">{item.name}</h3>
                 <p className="text-lg font-black text-teal-600">₹{item.price}</p>
                 <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                       Add to Basket
                    </span>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>


        {/* Cart Side */}
        <div className="flex-[2] bg-slate-900 flex flex-col h-[40vh] md:h-full shadow-2xl overflow-hidden">
           <div className="p-8 border-b border-white/5 shrink-0">
              <div className="flex items-center justify-between mb-2">
                 <h2 className="text-2xl font-black text-white">Guest Order</h2>
                 <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-teal-400">
                    <ShoppingCart size={20} />
                 </div>
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Table {table?.number} • {currentOrder.length} Items</p>
           </div>

           <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {currentOrder.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                   <div className="w-20 h-20 border-2 border-dashed border-white/10 rounded-full flex items-center justify-center mb-4">
                      <Minus size={24} className="text-white" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Basket is empty</p>
                </div>
              ) : (
                <AnimatePresence>
                  {currentOrder.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white font-black overflow-hidden">
                         <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                         <p className="text-teal-400 font-black text-sm">₹{item.price * item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1">
                         <button 
                           onClick={() => updateQuantity(item.id, -1)}
                           className="w-8 h-8 rounded-lg bg-white/5 text-white flex items-center justify-center hover:bg-white/10"
                         >
                            <Minus size={14} />
                         </button>
                         <span className="w-8 text-center text-sm font-black text-white">{item.quantity}</span>
                         <button 
                           onClick={() => updateQuantity(item.id, 1)}
                           className="w-8 h-8 rounded-lg bg-white/5 text-white flex items-center justify-center hover:bg-white/10"
                         >
                            <Plus size={14} />
                         </button>
                      </div>
                      <button 
                        onClick={() => removeFromOrder(item.id)}
                        className="ml-2 p-2 text-white/20 hover:text-red-400 transition-colors"
                      >
                         <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
           </div>

           <div className="p-8 bg-black/30 border-t border-white/5 backdrop-blur-xl shrink-0">
              <div className="flex justify-between items-end mb-8">
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Bill</p>
                    <p className="text-3xl font-black text-white tracking-tighter">₹{total}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tax Incl.</p>
                    <p className="text-xs font-bold text-teal-400 underline decoration-dotted underline-offset-4">18% GST</p>
                 </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={currentOrder.length === 0}
                onClick={() => {
                  placeKOT(tableId, currentOrder, total, staff);
                  alert(`KOT Sent for Table ${id}!`);
                  navigate(-1);
                }}
                className="w-full bg-teal-500 text-slate-900 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-teal-400 transition-all disabled:opacity-30 disabled:grayscale"
              >
                 Confirm & Send KOT <Send size={18} />
              </motion.button>
           </div>
        </div>
      </div>
    </div>
  );
}
