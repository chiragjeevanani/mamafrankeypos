import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function QuantityStepper({ value, onChange, min = 0, compact = false }) {
  const handleIncrement = () => onChange(value + 1);
  const handleDecrement = () => value > min && onChange(value - 1);

  return (
    <div className={`inline-flex items-center bg-charcoal-50 dark:bg-white/5 rounded-2xl p-1.5 border border-charcoal-100 dark:border-white/5 ${compact ? 'gap-2' : 'gap-4'}`}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleDecrement}
        className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-charcoal-600 dark:text-white shadow-sm border border-charcoal-100 dark:border-white/5 disabled:opacity-30`}
        disabled={value <= min}
      >
        <Minus size={compact ? 14 : 18} />
      </motion.button>

      <span className={`${compact ? 'text-xs px-1' : 'text-sm px-2'} font-black text-charcoal-900 dark:text-white tabular-nums`}>
         <AnimatePresence mode="wait">
            <motion.span
               key={value}
               initial={{ y: 10, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: -10, opacity: 0 }}
               className="inline-block"
            >
               {value}
            </motion.span>
         </AnimatePresence>
      </span>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleIncrement}
        className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl bg-charcoal-900 dark:bg-brand-500 flex items-center justify-center text-white dark:text-charcoal-900 shadow-lg`}
      >
        <Plus size={compact ? 14 : 18} />
      </motion.button>
    </div>
  );
}
