import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { QuantityStepper } from '../components/QuantityStepper';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft, Tag, AlertCircle } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';

export default function CartPage() {
  const { items, total, removeFromCart, updateQuantity, itemCount } = useCart();
  const navigate = useNavigate();

  const subtotal = total;
  const taxes = Math.floor(subtotal * 0.18);
  const grandTotal = subtotal + taxes;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white flex flex-col items-center justify-center p-8 text-center transition-colors duration-300">
          <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/5"
          >
             <ShoppingBag size={56} className="text-charcoal-900/10 dark:text-white/10" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold mb-4 tracking-tight">Your basket is empty</h1>
          <p className="text-charcoal-500 max-w-xs mx-auto mb-12 font-medium leading-relaxed italic opacity-80">
            "A hungry stomach is a blank canvas. Let's paint it with flavors."
          </p>
          <motion.button 
             whileTap={{ scale: 0.95 }}
             className="bg-brand-500 text-charcoal-900 px-10 py-5 rounded-2xl font-black shadow-2xl"
             onClick={() => navigate('/menu')}
          >
             Explore Our Menu
          </motion.button>
          <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white selection:bg-brand-500 selection:text-charcoal-900 transition-colors duration-300">
      <div className="max-w-lg mx-auto px-6 pt-8 pb-40">
        <header className="flex items-center gap-6 mb-12">
           <button 
             onClick={() => navigate('/menu')}
             className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-charcoal-400 hover:text-white transition-colors"
           >
              <ArrowLeft size={22} />
           </button>
           <div>
              <h1 className="text-4xl font-display font-bold tracking-tight">Your Basket</h1>
              <p className="text-brand-500 font-black mt-1 uppercase text-[10px] tracking-[0.2em]">{itemCount} DISHES SELECTED</p>
           </div>
        </header>

        <div className="space-y-4 mb-10">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.cartId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white/5 p-5 rounded-[2.5rem] border border-white/5 flex gap-5 group"
              >
                <img src={item.image} className="w-24 h-24 rounded-3xl object-cover shrink-0" alt={item.name} />
                
                <div className="flex-1 flex flex-col min-w-0 pt-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-base font-bold text-white truncate pr-2">{item.name}</h3>
                    <span className="font-display font-bold text-lg text-brand-500">₹{item.price * item.quantity}</span>
                  </div>
                  
                  <p className="text-[10px] text-charcoal-500 italic mb-4 truncate opacity-60">
                    {item.modifiers.length > 0 ? item.modifiers.map(m => m.value).join(', ') : 'Standard Regular'}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                     <QuantityStepper value={item.quantity} onChange={(q) => updateQuantity(item.cartId, q)} compact />
                     <motion.button
                       whileTap={{ scale: 0.8 }}
                       onClick={() => removeFromCart(item.cartId)}
                       className="text-white/10 hover:text-red-500 transition-colors p-2"
                     >
                       <Trash2 size={18} />
                     </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <button 
            onClick={() => navigate('/menu')}
            className="w-full py-6 border-2 border-dashed border-white/5 rounded-[2.5rem] flex items-center justify-center gap-3 text-charcoal-500 font-black uppercase text-[10px] tracking-widest hover:border-brand-500/30 hover:text-brand-500 transition-all group"
          >
             Add more delicacies <span className="group-hover:rotate-90 transition-transform">✦</span>
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-charcoal-800 rounded-[3rem] p-10 border border-white/5 shadow-2xl">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-500 mb-8 flex items-center gap-2">
              <Tag size={12} className="text-brand-500" /> Bill Summary
           </h3>
           
           <div className="space-y-5 mb-10">
              <div className="flex justify-between font-medium text-charcoal-400 text-sm">
                 <span>Items Total</span>
                 <span className="text-white">₹{subtotal}</span>
              </div>
              <div className="flex justify-between font-medium text-charcoal-400 text-sm">
                 <span>Taxes & Fees (18%)</span>
                 <span className="text-white">₹{taxes}</span>
              </div>
              <div className="h-[1px] bg-white/5 w-full" />
              <div className="flex justify-between text-3xl font-display font-bold text-white pt-2">
                 <span>To Pay</span>
                 <span className="text-brand-500">₹{grandTotal}</span>
              </div>
           </div>

           <div className="bg-brand-500/5 rounded-2xl p-4 flex gap-3 text-brand-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-10 border border-brand-500/10">
              <AlertCircle size={16} className="shrink-0" />
              <p>Estimated preparation time is 22 mins. High volume orders may take slightly longer.</p>
           </div>

           <Link to="/checkout" className="block w-full">
              <motion.button 
                 whileTap={{ scale: 0.97 }}
                 className="w-full bg-brand-500 text-charcoal-900 py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20 group"
              >
                 Proceed to Secure Checkout <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
           </Link>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
