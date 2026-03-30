import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, MapPin, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { OrderTimeline } from '../components/OrderTimeline';
import { BottomNav } from '../components/BottomNav';

export default function OrderTrackingPage() {
  const navigate = useNavigate();
  const orderStatus = 'preparing'; // Mock status

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white selection:bg-brand-500 selection:text-charcoal-900 transition-colors duration-300">
      <div className="max-w-lg mx-auto px-6 pt-8 pb-40">
        <header className="flex items-center gap-6 mb-12">
           <button 
             onClick={() => navigate('/menu')}
             className="w-12 h-12 bg-white border border-charcoal-900/10 dark:bg-white/5 dark:border-white/5 rounded-2xl flex items-center justify-center text-charcoal-400 hover:text-charcoal-900 dark:hover:text-white transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none"
           >
              <ArrowLeft size={22} />
           </button>
           <div>
              <h1 className="text-4xl font-display font-bold tracking-tight">Live Tracker</h1>
              <p className="text-brand-500 font-black mt-1 uppercase text-[10px] tracking-[0.2em]">ORDER #RK-4092</p>
           </div>
        </header>

        <main className="space-y-8">
           {/* Top Status Card */}
           <div className="bg-brand-500 rounded-[2.5rem] p-8 text-charcoal-900 shadow-2xl shadow-brand-500/20 border-b-8 border-black/10">
              <div className="flex justify-between items-start mb-10">
                 <div>
                    <h2 className="text-3xl font-display font-bold leading-tight">Chef is <br />Cooking!</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Estimated Serve: 17:45</p>
                 </div>
                 <div className="w-16 h-16 bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Clock size={32} strokeWidth={2.5} />
                 </div>
              </div>

              <div className="flex gap-4 mt-10">
                 <button className="flex-1 bg-charcoal-900 dark:bg-charcoal-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                    <Phone size={14} /> Call Desk
                 </button>
                 <button className="flex-1 bg-white/90 dark:bg-white text-charcoal-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                    <MessageSquare size={14} /> Message
                 </button>
              </div>
           </div>

           {/* Timeline Section */}
           <section className="bg-white dark:bg-charcoal-800 rounded-[2.5rem] p-6 border border-charcoal-900/10 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-500 mb-12 flex items-center gap-2">
                 <MapPin size={12} className="text-brand-500" /> Milestones
              </h3>
              <OrderTimeline status={orderStatus} />
           </section>

           {/* Support Alert */}
           <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-charcoal-900/10 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex items-start gap-4">
              <div className="w-10 h-10 bg-charcoal-900/5 dark:bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                 <AlertCircle size={20} className="text-charcoal-500" />
              </div>
              <div>
                 <p className="text-xs font-bold text-white mb-1">Need help with your order?</p>
                 <p className="text-[10px] text-charcoal-500 font-medium leading-relaxed italic">
                   If your order is delayed by more than 10 mins, your next drink is on us!
                 </p>
              </div>
           </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
