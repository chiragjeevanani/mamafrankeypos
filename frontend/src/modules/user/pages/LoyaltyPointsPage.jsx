import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Zap, 
  Gift, 
  History, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { LoyaltyCard } from '../components/LoyaltyCard';

const RECENT_EARNINGS = [
  { activity: 'Pasta Dinner', date: 'Mar 15', points: '+84' },
  { activity: 'Prime Bonus', date: 'Mar 12', points: '+200' },
  { activity: 'Burger Lunch', date: 'Mar 10', points: '+42' },
];

export default function LoyaltyPointsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white selection:bg-brand-500 selection:text-charcoal-900 transition-colors duration-300">
      <div className="max-w-lg mx-auto px-6 pt-8 pb-40">
        <header className="flex items-center gap-6 mb-12">
           <button 
             onClick={() => navigate(-1)}
             className="w-12 h-12 bg-white border border-charcoal-900/10 dark:bg-white/5 dark:border-white/5 rounded-2xl flex items-center justify-center text-charcoal-400 hover:text-charcoal-900 dark:hover:text-white transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
           >
              <ArrowLeft size={22} />
           </button>
           <h1 className="text-4xl font-display font-bold tracking-tight">Prime Rewards</h1>
        </header>

        <main className="space-y-12">
          <LoyaltyCard points={840} tier="Gold" />

          {/* Points Breakdown */}
          <section>
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-500">Points History</h3>
              <TrendingUp size={14} className="text-brand-500" />
            </div>
            
            <div className="bg-white dark:bg-charcoal-800 rounded-[2.5rem] border border-charcoal-900/10 dark:border-white/5 overflow-hidden shadow-sm">
              {RECENT_EARNINGS.map((item, idx) => (
                <div 
                  key={idx}
                  className={`p-6 flex items-center justify-between ${idx !== RECENT_EARNINGS.length - 1 ? 'border-b border-charcoal-900/5 dark:border-white/5' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500">
                      < Zap size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{item.activity}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-charcoal-400 mt-1 italic">{item.date}</p>
                    </div>
                  </div>
                  <span className="font-black text-brand-500">{item.points}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-500 mb-8 px-2">Gold Tier Benefits</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-charcoal-900 text-white p-6 rounded-[2.5rem] space-y-4 shadow-xl shadow-brand-500/10">
                <Gift className="text-brand-500" />
                <div>
                   <p className="text-xs font-black uppercase tracking-widest mb-1 italic">Free Dessert</p>
                   <p className="text-[9px] text-charcoal-500 font-medium">On every alternate order</p>
                </div>
              </div>
              <div className="bg-white dark:bg-white/5 p-6 rounded-[2.5rem] space-y-4 border border-charcoal-900/5 dark:border-white/5">
                <Award className="text-brand-500" />
                <div>
                   <p className="text-xs font-black uppercase tracking-widest mb-1 italic">VIP Access</p>
                   <p className="text-[9px] text-charcoal-500 font-medium">Skip queue on peak hours</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

