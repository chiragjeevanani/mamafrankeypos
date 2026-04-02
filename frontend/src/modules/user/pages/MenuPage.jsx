import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, SlidersHorizontal, ShoppingBag, Sparkles, Sun, Moon } from 'lucide-react';
import { FoodCard } from '../components/FoodCard';
import { CategoryScroller } from '../components/CategoryScroller';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { MENU_ITEMS, CATEGORIES, RESTAURANT_INFO } from '../data/mockData';
import { CartDrawer } from '../components/CartDrawer';
import { BottomNav } from '../components/BottomNav';
import logo from '../../../assets/time-to-eat.jpeg';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { itemCount, total } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();

  const filteredItems = useMemo(() => {
    let items = MENU_ITEMS;
    if (activeCategory !== 'all') {
      if (activeCategory === 'popular') items = items.filter(i => i.tags.includes('popular'));
      else items = items.filter(i => i.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return items;
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white selection:bg-brand-500 selection:text-charcoal-900 transition-colors duration-300">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-orange-400/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto pb-40">
        {/* Compact Header */}
        <header className="sticky top-0 z-40 bg-cream-50/80 dark:bg-charcoal-900/80 backdrop-blur-3xl border-b border-charcoal-900/10 dark:border-white/5 px-6 pt-4 pb-2 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 opacity-60">
                <MapPin size={10} className="text-brand-500" />
                <span className="text-[9px] font-black uppercase tracking-widest">{RESTAURANT_INFO.table} · Main Hall</span>
              </div>
              <div className="flex items-center gap-2.5">
                <img src={logo} alt="Logo" className="h-9 w-auto object-contain" />
                <h1 className="text-xl font-display font-bold tracking-tight text-charcoal-900 dark:text-white leading-tight border-l border-charcoal-900/10 dark:border-white/10 pl-3">
                  Time to eat <span className="text-brand-500">Kitchen</span>
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-charcoal-900/5 dark:bg-white/5 text-charcoal-600 dark:text-charcoal-300 hover:text-charcoal-900 dark:hover:text-white"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCartOpen(true)}
                className="relative w-12 h-12 rounded-2xl bg-brand-500 text-charcoal-900 flex items-center justify-center shadow-lg shadow-brand-500/20"
              >
                <ShoppingBag size={20} strokeWidth={2.5} />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-900 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-cream-50 dark:border-charcoal-900 transition-colors"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
              </motion.button>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1 group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-500 dark:text-charcoal-400 group-focus-within:text-brand-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find your feast..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-charcoal-900/10 dark:bg-white/5 dark:border-white/5 rounded-xl text-xs font-medium focus:bg-charcoal-900/5 dark:focus:bg-white/10 outline-none transition-all text-charcoal-900 dark:text-white placeholder:text-charcoal-400 dark:placeholder:text-charcoal-500"
              />
            </div>
            <button className="p-3 bg-white border border-charcoal-900/10 dark:bg-white/5 dark:border-white/5 rounded-xl text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-white transition-colors">
              <SlidersHorizontal size={18} />
            </button>
          </div>

          <CategoryScroller
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </header>

        {/* Menu Grid */}
        <main className="px-6 pt-6">
           <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-lg font-display font-bold tracking-tight">Handpicked for you</h2>
              <span className="text-[9px] font-black text-charcoal-500 uppercase tracking-[0.1em]">{filteredItems.length} Dishes</span>
           </div>

           <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                >
                  <FoodCard item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>

        <BottomNav />
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
