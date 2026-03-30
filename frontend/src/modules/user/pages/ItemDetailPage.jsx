import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Clock, ShoppingBag, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { QuantityStepper } from '../components/QuantityStepper';
import { useCart } from '../context/CartContext';
import { MENU_ITEMS } from '../data/mockData';

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const item = MENU_ITEMS.find((i) => i.id === id);

  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState({});
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!item) return <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white flex items-center justify-center font-display text-2xl">Item not found</div>;

  const handleModifierSelect = (groupLabel, optionId) => {
    setSelectedModifiers(prev => ({ ...prev, [groupLabel]: optionId }));
  };

  const currentPrice = item.price + Object.entries(selectedModifiers).reduce((acc, [group, optId]) => {
     const modGroup = item.modifiers.find(m => m.group === group);
     const option = modGroup?.options.find(o => o.id === optId);
     return acc + (option?.price || 0);
  }, 0);

  const handleAddToCart = () => {
    const modArray = Object.entries(selectedModifiers).map(([group, val]) => ({ group, value: val }));
    addToCart(item, quantity, modArray, currentPrice - item.price);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white selection:bg-brand-500 selection:text-charcoal-900 transition-colors duration-300">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-brand-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto pb-32">
        {/* Header Photo */}
        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-b-[4rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
          <img 
            src={item.image} 
            className="w-full h-full object-cover"
            alt={item.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cream-50 dark:from-charcoal-900 via-transparent to-black/20" />
          
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-10 left-6 w-12 h-12 bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-2xl flex items-center justify-center text-charcoal-900 dark:text-white border border-charcoal-900/10 dark:border-white/10"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="absolute bottom-10 left-8 right-8">
             <div className="flex gap-2 mb-4">
                {item.isVeg ? (
                  <span className="bg-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-green-500/30 backdrop-blur-md">Vegetarian</span>
                ) : (
                  <span className="bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-500/30 backdrop-blur-md">Meat Lovers</span>
                )}
                {item.isBestSeller && (
                  <span className="bg-brand-500/20 text-brand-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-brand-500/30 backdrop-blur-md">Top Rated</span>
                )}
             </div>
             <h1 className="text-5xl font-display font-bold leading-[0.9] tracking-tighter mb-4">{item.name}</h1>
             <div className="flex items-center gap-6 text-white/40">
                <div className="flex items-center gap-1.5">
                   <Star size={14} className="text-brand-500 fill-brand-500" />
                   <span className="text-sm font-black text-white/80">{item.rating}</span>
                </div>
                <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest">
                   <Clock size={14} /> {item.prepTime}
                </div>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pt-10">
          <div className="flex justify-between items-baseline mb-8">
             <p className="text-charcoal-700 dark:text-charcoal-300 font-medium leading-relaxed italic opacity-90 text-lg">
               {item.description}
             </p>
          </div>

          <div className="h-[1px] bg-white/5 w-full mb-12" />

          {/* Options */}
          <div className="space-y-12">
             {item.modifiers.map((mod) => (
               <div key={mod.group}>
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-500">Choose {mod.group}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     {mod.options.map((opt) => {
                       const isSelected = selectedModifiers[mod.group] === opt.id;
                       return (
                         <motion.button
                           key={opt.id}
                           onClick={() => handleModifierSelect(mod.group, opt.id)}
                           whileTap={{ scale: 0.95 }}
                           className={`p-5 rounded-3xl font-bold transition-all border-2 text-left group ${
                             isSelected 
                               ? 'border-brand-500 bg-brand-500/10' 
                               : 'border-white/5 bg-white/5 hover:border-white/10'
                           }`}
                         >
                            <p className={`text-sm mb-1 transition-colors ${isSelected ? 'text-white' : 'text-charcoal-400'}`}>{opt.label}</p>
                            {opt.price > 0 ? (
                               <span className="text-[10px] font-black uppercase tracking-widest text-brand-500">+₹{opt.price}</span>
                            ) : (
                               <span className="text-[10px] font-black uppercase tracking-widest text-charcoal-600">Standard</span>
                            )}
                         </motion.button>
                       );
                     })}
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-charcoal-900/80 backdrop-blur-3xl border-t border-charcoal-900/10 dark:border-white/5 p-5 z-50 transition-colors duration-300">
         <div className="max-w-lg mx-auto flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <QuantityStepper value={quantity} onChange={setQuantity} min={1} compact />
            </div>
            
            <motion.button
              onClick={handleAddToCart}
              whileTap={{ scale: 0.97 }}
              className="flex-1 bg-brand-500 text-charcoal-900 py-4 rounded-[1.2rem] font-black flex items-center justify-center gap-3 shadow-2xl shadow-brand-500/20"
            >
              <AnimatePresence mode="wait">
                 {addedToCart ? (
                    <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center gap-2">
                       <Check size={20} strokeWidth={4} /> Added
                    </motion.div>
                 ) : (
                    <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center gap-2">
                      Add to Basket · ₹{currentPrice * quantity}
                    </motion.div>
                 )}
              </AnimatePresence>
            </motion.button>
         </div>
      </div>
    </div>
  );
}
