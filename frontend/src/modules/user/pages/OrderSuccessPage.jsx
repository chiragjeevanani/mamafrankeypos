import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Star, Heart, Share2 } from 'lucide-react';

export default function OrderSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white flex flex-col items-center justify-center p-8 overflow-hidden relative transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-brand-500/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 text-center max-w-sm w-full">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="w-32 h-32 bg-brand-500 rounded-[2.5rem] flex items-center justify-center mb-10 mx-auto shadow-2xl shadow-brand-500/30 border-b-8 border-black/20"
        >
          <CheckCircle2 size={64} className="text-charcoal-900" strokeWidth={3} />
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
        >
          <h1 className="text-5xl font-display font-bold mb-4 tracking-tighter leading-tight">ORDER <br />CONFIRMED</h1>
          <p className="text-charcoal-600 dark:text-charcoal-400 font-medium mb-12 italic opacity-90 dark:opacity-80 px-4">
             "Your order is now a mission for our chefs. Get ready for a flavor explosion!"
          </p>
        </motion.div>

        <div className="space-y-4 mb-16">
           <motion.button
             whileTap={{ scale: 0.95 }}
             onClick={() => navigate('/order-tracking')}
             className="w-full bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-900 py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-2 shadow-xl group border-b-4 border-black/20 dark:border-charcoal-200"
           >
             Track Progress <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
           </motion.button>
           
           <motion.button
             whileTap={{ scale: 0.95 }}
             onClick={() => navigate('/menu')}
             className="w-full bg-charcoal-900/5 dark:bg-white/5 border border-charcoal-900/10 dark:border-white/10 text-charcoal-600 dark:text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px]"
           >
             Back to Main Menu
           </motion.button>
        </div>

        {/* Loyalty Reward Preview */}
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.8 }}
           className="bg-brand-500/10 p-6 rounded-[2rem] border border-brand-500/20 backdrop-blur-md"
        >
           <div className="flex items-center gap-3 mb-3">
              <Star size={16} className="text-brand-500 fill-brand-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-400">+45 Points Earned</span>
           </div>
           <p className="text-[10px] text-charcoal-600 dark:text-charcoal-500 font-bold uppercase tracking-widest leading-relaxed">
             You are 2 orders away from a <span className="text-charcoal-900 dark:text-white">Free Dessert!</span>
           </p>
        </motion.div>
      </div>

      {/* Floating Icons */}
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-[20%] right-[15%] opacity-10">
         <Heart size={48} />
      </motion.div>
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute bottom-[20%] left-[15%] opacity-10">
         <Share2 size={48} />
      </motion.div>
    </div>
  );
}
