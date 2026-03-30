import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Ticket, 
  Copy, 
  Calendar,
  Sparkles,
  Percent
} from 'lucide-react';
import { BottomNav } from '../components/BottomNav';

const MOCK_OFFERS = [
  { id: 1, title: 'Weekend Feast', code: 'FEAST50', disc: '50% OFF', desc: 'Valid on orders above ₹1500', exp: 'Ends Mar 20' },
  { id: 2, title: 'First Bite', code: 'NEWBIE', disc: '₹200 OFF', desc: 'Special discount for first order', exp: 'Lifetime' },
  { id: 3, title: 'Beverage Boost', code: 'DRINK20', disc: '20% OFF', desc: 'Valid on all mocktails & sodas', exp: 'Ends Today' },
];

export default function OffersPage() {
  const navigate = useNavigate();

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert('Code Copied!');
  };

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
           <h1 className="text-4xl font-display font-bold tracking-tight">Offers</h1>
        </header>

        <main className="space-y-6">
          {MOCK_OFFERS.map((offer) => (
            <motion.div
              key={offer.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-charcoal-800 rounded-[2.5rem] p-8 border border-charcoal-900/10 dark:border-white/5 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-charcoal-900 shadow-xl shadow-brand-500/20">
                    <Percent size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold leading-none mb-1">{offer.title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-500 italic">{offer.exp}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-charcoal-900 dark:text-white tracking-tighter">{offer.disc}</p>
                </div>
              </div>

              <p className="text-xs font-medium text-charcoal-500 leading-relaxed mb-8 pr-12">
                {offer.desc}
              </p>

              <div className="flex gap-3 relative z-10">
                <div className="flex-1 bg-charcoal-900/5 dark:bg-white/5 border border-dashed border-charcoal-900/20 dark:border-white/20 rounded-2xl px-6 py-4 flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest font-mono">{offer.code}</span>
                  <Ticket size={16} className="text-charcoal-400" />
                </div>
                <button 
                  onClick={() => copyToClipboard(offer.code)}
                  className="bg-charcoal-900 dark:bg-brand-500 text-white dark:text-charcoal-900 px-6 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <Copy size={18} />
                </button>
              </div>
            </motion.div>
          ))}

          <div className="bg-brand-500/10 border-2 border-dashed border-brand-500/20 rounded-[2.5rem] p-10 flex flex-col items-center text-center gap-4">
             <Sparkles className="text-brand-500" size={32} />
             <div>
                <p className="text-xs font-black uppercase tracking-widest text-charcoal-900 dark:text-white py-1">More Secret Deals?</p>
                <p className="text-[10px] text-charcoal-500 font-medium italic">They appear when you least expect them. Keep feasting!</p>
             </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

