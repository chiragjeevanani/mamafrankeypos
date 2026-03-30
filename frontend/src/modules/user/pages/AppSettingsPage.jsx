import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Moon, Languages, Smartphone, ChevronRight } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';

export default function AppSettingsPage() {
  const navigate = useNavigate();

  const options = [
    { icon: Bell, label: 'Notifications', value: 'On' },
    { icon: Moon, label: 'Dark Mode', value: 'System' },
    { icon: Languages, label: 'Language', value: 'English' },
  ];

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white transition-colors duration-300">
      <div className="max-w-lg mx-auto px-6 pt-8 pb-40">
        <header className="flex items-center gap-6 mb-12">
           <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white dark:bg-white/5 border border-charcoal-900/10 rounded-2xl flex items-center justify-center">
              <ArrowLeft size={22} />
           </button>
           <h1 className="text-4xl font-display font-bold tracking-tight">Settings</h1>
        </header>

        <main className="space-y-8">
           <div className="bg-white dark:bg-charcoal-800 rounded-[2.5rem] border border-charcoal-900/10 dark:border-white/5 overflow-hidden shadow-sm">
              {options.map((item, idx) => (
                <button 
                  key={idx}
                  className={`w-full p-8 flex items-center justify-between ${idx !== options.length - 1 ? 'border-b border-charcoal-900/5 dark:border-white/5' : ''}`}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-charcoal-900/5 dark:bg-white/5 rounded-2xl flex items-center justify-center text-charcoal-500">
                      <item.icon size={22} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-base">{item.label}</p>
                      <p className="text-[10px] text-brand-500 font-black uppercase tracking-widest mt-1 italic">{item.value}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-charcoal-300" />
                </button>
              ))}
           </div>

           <div className="p-8 bg-charcoal-900 text-white rounded-[2.5rem] flex items-center gap-6">
              <Smartphone className="text-brand-500 shrink-0" size={32} />
              <div>
                 <p className="text-xs font-bold mb-1">Stay updated!</p>
                 <p className="text-[10px] text-charcoal-500 leading-relaxed font-medium italic">Enable push notifications to get live tracking alerts and secret coupons.</p>
              </div>
           </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
