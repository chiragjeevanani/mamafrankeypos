import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Plus, Star, Leaf, Flame, Clock, ArrowRight } from 'lucide-react';

export function FoodCard({ item }) {
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(item, 1, [], 0);
    setTimeout(() => setIsAdding(false), 900);
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/item/${item.id}`)}
      className="bg-white border-charcoal-900/10 hover:border-brand-500/30 dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] p-5 border dark:border-white/5 dark:hover:border-white/10 transition-all duration-300 cursor-pointer group shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl"
    >
      <div className="flex gap-5">
        {/* Image Area */}
        <div className="relative w-28 h-36 rounded-[1.5rem] overflow-hidden bg-charcoal-100 dark:bg-charcoal-800 shrink-0">
          <motion.img
            layoutId={`img-${item.id}`}
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          
          <div className="absolute top-2 left-2">
            <div className="bg-black/40 backdrop-blur-md p-1.5 rounded-full ring-1 ring-white/10">
              {item.isVeg ? (
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              )}
            </div>
          </div>
        </div>

        {/* Info Area */}
        <div className="flex-1 flex flex-col pt-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-display font-bold text-charcoal-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
              {item.name}
            </h3>
          </div>

          <p className="text-xs text-charcoal-500 font-medium line-clamp-2 mb-4 leading-relaxed italic opacity-80">
            {item.description}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <div>
               <div className="flex items-center gap-3 text-charcoal-500 dark:text-white/40 mb-1">
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-brand-500 fill-brand-500" />
                    <span className="text-[10px] font-black">{item.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    <span className="text-[10px] font-black">{item.prepTime}</span>
                  </div>
               </div>
               <span className="text-2xl font-display font-bold text-brand-500">
                 ₹{item.price}
               </span>
            </div>

            <motion.button
              onClick={handleQuickAdd}
              whileTap={{ scale: 0.8 }}
              className="w-12 h-12 rounded-[1.25rem] bg-brand-500 text-charcoal-900 flex items-center justify-center shadow-lg shadow-brand-500/20 active:bg-white"
            >
              <AnimatePresence mode="wait">
                {isAdding ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="font-black text-xs">✓</motion.div>
                ) : (
                  <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Plus size={22} strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
