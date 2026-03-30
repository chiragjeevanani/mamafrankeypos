import { motion } from 'framer-motion';
import { ChefHat, Bell, UtensilsCrossed, CheckCircle2 } from 'lucide-react';

export function OrderTimeline({ status }) {
  const steps = [
    { id: 'received', label: 'Order Received', icon: Bell },
    { id: 'preparing', label: 'In the Kitchen', icon: ChefHat },
    { id: 'ready', label: 'Ready!', icon: UtensilsCrossed },
    { id: 'served', label: 'Enjoy!', icon: CheckCircle2 },
  ];

  const currentIdx = steps.findIndex(s => s.id === status);

  return (
    <div className="relative pt-8 pb-12 px-2">
      <div className="flex justify-between relative">
        <div className="absolute top-5 left-0 w-full h-[2px] bg-charcoal-900/10 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-500 shadow-[0_0_15px_rgba(255,122,0,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        </div>

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isActive = idx === currentIdx;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group w-20">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isCompleted || isActive ? '#ff7a00' : 'transparent',
                  color: isCompleted || isActive ? '#000000' : 'currentColor',
                }}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${
                  isCompleted || isActive ? 'border-brand-500 shadow-lg shadow-brand-500/20' : 'border-charcoal-900/10 dark:border-white/5 bg-charcoal-900/5 dark:bg-charcoal-900 text-charcoal-400 dark:text-[#4a4a4a]'
                }`}
              >
                <step.icon size={18} />
              </motion.div>
              <div className="mt-4 text-center">
                 <span className={`text-[9px] font-black uppercase tracking-wider leading-tight block ${isActive ? 'text-brand-500' : 'text-charcoal-400 dark:text-charcoal-600'}`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
