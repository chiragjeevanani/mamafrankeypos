import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Send, 
  CheckCircle2,
  Utensils,
  User,
  Zap,
  Coffee
} from 'lucide-react';
import { BottomNav } from '../components/BottomNav';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [category, setCategory] = useState('food');

  const categories = [
    { id: 'food', icon: Utensils, label: 'Food' },
    { id: 'service', icon: User, label: 'Service' },
    { id: 'ambiance', icon: Coffee, label: 'Ambiance' },
    { id: 'speed', icon: Zap, label: 'Speed' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => navigate('/profile'), 2000);
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
           <h1 className="text-4xl font-display font-bold tracking-tight">Feedback</h1>
        </header>

        <main className="bg-white dark:bg-charcoal-800 rounded-[3rem] p-10 border border-charcoal-900/10 dark:border-white/5 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-24 h-24 bg-brand-500 rounded-[2.5rem] flex items-center justify-center text-charcoal-900 mb-8 shadow-2xl shadow-brand-500/30">
                  <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-display font-bold mb-2">Thank You!</h2>
                <p className="text-xs font-black uppercase tracking-widest text-charcoal-500 italic">Your feedback helps us grow.</p>
              </motion.div>
            ) : (
              <motion.form 
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12"
              >
                {/* Star Rating */}
                <div className="text-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-400 mb-6">How was your meal?</p>
                   <div className="flex justify-center gap-2">
                     {[1, 2, 3, 4, 5].map((star) => (
                       <button
                         key={star}
                         type="button"
                         onMouseEnter={() => setHoverRating(star)}
                         onMouseLeave={() => setHoverRating(0)}
                         onClick={() => setRating(star)}
                         className="transition-transform active:scale-90"
                       >
                         <Star 
                           size={40} 
                           strokeWidth={2.5}
                           className={`${
                             (hoverRating || rating) >= star 
                             ? 'fill-brand-500 text-brand-500' 
                             : 'text-charcoal-200 dark:text-charcoal-700'
                           } transition-colors`}
                         />
                       </button>
                     ))}
                   </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-400 text-center">Specific Feedback</p>
                  <div className="grid grid-cols-4 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all ${
                          category === cat.id 
                          ? 'bg-brand-500 text-charcoal-900 shadow-lg shadow-brand-500/20' 
                          : 'bg-charcoal-900/5 dark:bg-white/5 text-charcoal-500'
                        }`}
                      >
                        <cat.icon size={20} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-4">
                  <textarea 
                    placeholder="Tell us more about your experience..."
                    className="w-full bg-charcoal-900/5 dark:bg-white/5 border border-charcoal-900/10 dark:border-white/5 rounded-3xl p-6 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white dark:focus:bg-charcoal-800 transition-all min-h-[150px] resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={rating === 0}
                  className="w-full bg-charcoal-900 dark:bg-brand-500 text-white dark:text-charcoal-900 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-500/20 hover:scale-[1.02] transition-all disabled:opacity-20"
                >
                  Submit Feeling <Send size={16} className="inline-block ml-3" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

