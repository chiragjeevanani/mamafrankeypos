import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Heart, 
  Clock, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Gift,
  MessageSquare
} from 'lucide-react';
import { LoyaltyCard } from '../components/LoyaltyCard';
import { BottomNav } from '../components/BottomNav';

export default function ProfilePage() {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Clock, label: 'Order History', sub: 'View 12 past orders', path: '/my-orders' },
    { icon: Gift, label: 'Promos & Offers', sub: 'Active deals & coupons', path: '/offers' },
    { icon: Heart, label: 'Favorites', sub: 'Your 5 most loved items', path: '/favorites' },
    { icon: ShieldCheck, label: 'Privacy & Security', sub: 'Data protection settings', path: '/privacy' },
    { icon: MessageSquare, label: 'Feedback', sub: 'Rate your experience', path: '/feedback' },
    { icon: Settings, label: 'App Settings', sub: 'Notifications & Appearance', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white selection:bg-brand-500 selection:text-charcoal-900 transition-colors duration-300">
      <div className="max-w-lg mx-auto px-6 pt-8 pb-44">
        <header className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-brand-500 rounded-[1.5rem] flex items-center justify-center text-charcoal-900 shadow-2xl shadow-brand-500/20 border-b-4 border-black/20">
                 <User size={32} strokeWidth={2.5} />
              </div>
              <div>
                 <h1 className="text-3xl font-display font-bold tracking-tight">Rajesh Kumar</h1>
                 <p className="text-brand-500 font-black uppercase text-[10px] tracking-[0.2em] mt-1">Prime Member</p>
              </div>
           </div>
           <button 
             onClick={() => {
               localStorage.removeItem('user_token');
               navigate('/login');
             }}
             className="w-12 h-12 bg-white border border-charcoal-900/10 dark:bg-white/5 dark:border-white/5 rounded-2xl flex items-center justify-center text-charcoal-400 hover:text-charcoal-900 dark:hover:text-white transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none"
           >
              <LogOut size={20} />
           </button>
        </header>

        <main className="space-y-12">
           <div onClick={() => navigate('/loyalty')} className="cursor-pointer">
              <LoyaltyCard points={840} tier="Gold" />
           </div>

           <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-500 mb-8 px-2">Account Dashboard</h3>
              <div className="bg-white dark:bg-charcoal-800 rounded-[2.5rem] border border-charcoal-900/10 dark:border-white/5 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-2xl">
                 {menuItems.map((item, idx) => (
                   <motion.button
                     key={item.label}
                     whileHover={{ backgroundColor: 'var(--hover-bg, rgba(0,0,0,0.02))' }}
                     onClick={() => item.path && navigate(item.path)}
                     className={`group w-full p-6 flex items-center justify-between transition-colors text-left ${
                       idx !== menuItems.length - 1 ? 'border-b border-charcoal-900/10 dark:border-white/5' : ''
                     } hover:bg-charcoal-900/5 dark:hover:bg-white/5`}
                   >
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-charcoal-900/5 dark:bg-white/5 rounded-2xl flex items-center justify-center text-charcoal-500 dark:text-charcoal-400 group-hover:text-brand-500 transition-colors">
                            <item.icon size={22} />
                         </div>
                         <div>
                            <p className="font-bold text-charcoal-900 dark:text-white text-sm group-hover:text-brand-500 transition-colors">{item.label}</p>
                            <p className="text-[10px] text-charcoal-500 font-medium uppercase tracking-widest mt-1 italic opacity-60">{item.sub}</p>
                         </div>
                      </div>
                      <ChevronRight size={18} className="text-charcoal-400 dark:text-charcoal-700 group-hover:translate-x-1 group-hover:text-brand-500 transition-all" />
                   </motion.button>
                 ))}
              </div>
           </div>

           <div className="text-center pt-8">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-charcoal-700">Time to eat Customer v2.4.0</p>
           </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
