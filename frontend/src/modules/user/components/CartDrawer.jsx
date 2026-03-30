import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { QuantityStepper } from './QuantityStepper';

export function CartDrawer({ isOpen, onClose }) {
  const { items, total, itemCount, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white z-[101] shadow-drawer flex flex-col border-l border-charcoal-900/10 dark:border-white/5"
          >
            <div className="flex items-center justify-between p-6 border-b border-charcoal-900/10 dark:border-white/5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-brand-500" size={24} />
                <h2 className="text-xl font-display font-bold">Your Basket</h2>
                <span className="bg-brand-500 text-charcoal-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {itemCount}
                </span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-charcoal-900/5 dark:hover:bg-white/5 rounded-full transition-colors text-charcoal-400">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={40} className="text-white/10" />
                  </div>
                  <p className="text-charcoal-400 font-medium">Your basket is waiting for delicacies.</p>
                  <button onClick={onClose} className="mt-4 text-brand-500 font-bold hover:underline">Browse Menu</button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <motion.div
                      layout
                      key={item.cartId}
                      className="bg-charcoal-900/5 dark:bg-white/5 p-4 rounded-3xl border border-charcoal-900/10 dark:border-white/5 flex gap-4"
                    >
                      <img src={item.image} className="w-16 h-16 rounded-2xl object-cover shrink-0" alt={item.name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2 mb-1">
                          <h4 className="font-bold text-sm truncate text-charcoal-900 dark:text-white">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.cartId)} className="text-charcoal-300 dark:text-white/20 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-[10px] text-charcoal-400 mb-3 truncate italic opacity-60">
                          {item.modifiers?.map(m => m.value).join(', ')}
                        </p>
                        <div className="flex justify-between items-center">
                          <QuantityStepper value={item.quantity} onChange={(q) => updateQuantity(item.cartId, q)} compact />
                          <span className="font-display font-bold text-lg text-brand-500">₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 bg-charcoal-50 dark:bg-charcoal-800 border-t border-charcoal-900/10 dark:border-white/5">
              <div className="flex justify-between mb-6">
                <span className="text-charcoal-500 dark:text-charcoal-400 font-medium font-display uppercase tracking-widest text-xs">Total Amount</span>
                <span className="text-3xl font-bold text-charcoal-900 dark:text-white font-display">₹{total}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { 
                  onClose(); 
                  navigate('/checkout'); 
                }}
                className="w-full bg-brand-500 text-charcoal-900 py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-2 shadow-xl shadow-brand-500/20"
              >
                Checkout Now <ArrowRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
