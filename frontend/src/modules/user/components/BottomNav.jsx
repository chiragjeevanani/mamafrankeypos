import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  User,
  UtensilsCrossed,
  ClipboardList,
  Sparkles
} from 'lucide-react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();

  const navItems = [
    { icon: UtensilsCrossed, label: 'Menu', path: '/menu' },
    { icon: ShoppingBag, label: 'Cart', path: '/cart', badge: itemCount },
    { icon: ClipboardList, label: 'Orders', path: '/my-orders' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-sm">
      <nav className="bg-white/90 dark:bg-charcoal-800/80 backdrop-blur-3xl border border-charcoal-900/10 dark:border-white/10 rounded-[2.5rem] px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
        
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.label}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.9 }}
              className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 ${
                isActive ? 'text-brand-500' : 'text-charcoal-500 hover:text-charcoal-700 dark:hover:text-charcoal-300'
              }`}
            >
              <item.icon
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -bottom-1 w-1 h-1 bg-brand-500 rounded-full"
                />
              )}

              <AnimatePresence>
                {item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, y: 10 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-900 text-[8px] font-black rounded-full flex items-center justify-center border-2 border-cream-50 dark:border-charcoal-900"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
