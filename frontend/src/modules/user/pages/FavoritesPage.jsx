import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Search, 
  Plus, 
  Star 
} from 'lucide-react';
import { BottomNav } from '../components/BottomNav';

const FAVORITES = [
  { id: 1, name: 'Truffle Mushroom Pizza', price: 540, rating: 4.9, category: 'Italian' },
  { id: 2, name: 'Saffron Risotto', price: 420, rating: 4.8, category: 'Main' },
  { id: 3, name: 'Dark Chocolate Fondue', price: 320, rating: 5.0, category: 'Dessert' },
];

export default function FavoritesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white selection:bg-brand-500 selection:text-charcoal-900 transition-colors duration-300">
      <div className="max-w-lg mx-auto px-6 pt-8 pb-40">
        <header className="flex items-center gap-6 mb-12">
           <button 
             onClick={() => navigate(-1)}
             className="w-12 h-12 bg-white border border-charcoal-900/10 dark:bg-white/5 dark:border-white/5 rounded-2xl flex items-center justify-center text-charcoal-400 hover:text-charcoal-900 dark:hover:text-white transition-colors"
           >
              <ArrowLeft size={22} />
           </button>
           <h1 className="text-4xl font-display font-bold tracking-tight">Favorites</h1>
        </header>

        <main className="space-y-6">
          {FAVORITES.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ x: 5 }}
              className="bg-white dark:bg-charcoal-800 rounded-[2.5rem] p-6 border border-charcoal-900/10 dark:border-white/5 shadow-sm flex items-center justify-between group"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500">
                   <Heart size={24} className="fill-brand-500" />
                </div>
                <div>
                   <h3 className="font-bold text-lg group-hover:text-brand-500 transition-colors">{item.name}</h3>
                   <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-charcoal-500 italic">{item.category}</span>
                      <div className="flex items-center gap-1 text-amber-500">
                         <Star size={10} className="fill-amber-500" />
                         <span className="text-[10px] font-bold">{item.rating}</span>
                      </div>
                   </div>
                </div>
              </div>
              <button className="w-12 h-12 bg-charcoal-900 dark:bg-white/5 rounded-2xl flex items-center justify-center text-white dark:text-white group-hover:bg-brand-500 group-hover:text-charcoal-900 transition-all">
                 <Plus size={20} />
              </button>
            </motion.div>
          ))}

          {FAVORITES.length === 0 && (
            <div className="text-center py-20 opacity-20">
               <Heart size={48} className="mx-auto mb-4" />
               <p className="font-black uppercase tracking-widest text-xs">No favorites yet</p>
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
