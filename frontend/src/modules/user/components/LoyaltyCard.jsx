import { motion } from 'framer-motion';
import { Sparkles, Trophy, ChevronRight } from 'lucide-react';

export function LoyaltyCard({ points, tier = 'Gold', nextTierPoints = 1000 }) {
  const progress = (points / nextTierPoints) * 100;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-charcoal-800 p-8 text-charcoal-900 dark:text-white border border-charcoal-900/10 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-2xl"
    >
      <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-brand-500/10 blur-[80px]" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-brand-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-500 dark:text-charcoal-400">Membership</span>
            </div>
            <h3 className="text-4xl font-display font-bold leading-none">{points} <span className="text-base font-sans font-black opacity-30 uppercase tracking-widest ml-1">Pts</span></h3>
          </div>
          <div className="bg-brand-500 text-charcoal-900 px-4 py-1.5 rounded-full flex items-center gap-2">
             <Trophy size={14} strokeWidth={3} />
             <span className="text-[10px] font-black uppercase tracking-widest">{tier} Tier</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-charcoal-500">
            <span>Next milestone: Platinum</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-charcoal-900/5 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="h-full bg-brand-500 shadow-[0_0_10px_rgba(255,122,0,0.5)]"
            />
          </div>
        </div>

        <button className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 hover:text-charcoal-900 dark:hover:text-white transition-colors">
          Explore rewards <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
