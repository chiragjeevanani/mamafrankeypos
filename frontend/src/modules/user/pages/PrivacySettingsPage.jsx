import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, FileText, ChevronRight } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';

export default function PrivacySettingsPage() {
  const navigate = useNavigate();

  const settings = [
    { icon: Lock, label: 'Password & Security', sub: 'Change your login credentials' },
    { icon: EyeOff, label: 'Data visibility', sub: 'Control what others see' },
    { icon: FileText, label: 'Privacy Policy', sub: 'How we handle your data' },
  ];

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white selection:bg-brand-500 transition-colors duration-300">
      <div className="max-w-lg mx-auto px-6 pt-8 pb-40">
        <header className="flex items-center gap-6 mb-12">
           <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white dark:bg-white/5 border border-charcoal-900/10 rounded-2xl flex items-center justify-center">
              <ArrowLeft size={22} />
           </button>
           <h1 className="text-4xl font-display font-bold tracking-tight">Privacy</h1>
        </header>

        <main className="space-y-8">
           <div className="bg-brand-500 rounded-[2.5rem] p-8 text-charcoal-900 flex items-center gap-6 shadow-xl shadow-brand-500/10 border-b-8 border-black/10">
              <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center">
                 <ShieldCheck size={32} strokeWidth={2.5} />
              </div>
              <div>
                 <p className="font-black uppercase text-[10px] tracking-widest opacity-60 mb-1">Status</p>
                 <h2 className="text-2xl font-bold leading-none">Your data is <br />Protected</h2>
              </div>
           </div>

           <div className="bg-white dark:bg-charcoal-800 rounded-[2.5rem] border border-charcoal-900/10 dark:border-white/5 overflow-hidden shadow-sm">
              {settings.map((item, idx) => (
                <button 
                  key={idx}
                  className={`w-full p-6 flex items-center justify-between ${idx !== settings.length - 1 ? 'border-b border-charcoal-900/5 dark:border-white/5' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-charcoal-900/5 dark:bg-white/5 rounded-xl flex items-center justify-center text-charcoal-500">
                      <item.icon size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">{item.label}</p>
                      <p className="text-[10px] text-charcoal-400 font-medium italic">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-charcoal-300" />
                </button>
              ))}
           </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
