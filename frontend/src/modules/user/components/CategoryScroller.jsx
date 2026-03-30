import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export function CategoryScroller({ categories, activeCategory, onSelect }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const activeEl = containerRef.current?.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  return (
    <div 
      ref={containerRef}
      className="flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-4 -my-2"
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <motion.button
            key={cat.id}
            data-active={isActive}
            onClick={() => onSelect(cat.id)}
            whileTap={{ scale: 0.95 }}
            className={`relative px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap border-2 ${
              isActive 
                ? 'text-charcoal-900 border-brand-500' 
                : 'text-charcoal-500 border-white/5 bg-white/5 hover:border-white/10 hover:text-charcoal-300'
            }`}
          >
            <span className="relative z-10">{cat.label}</span>
            
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-brand-500 shadow-[0_8px_20px_rgba(255,122,0,0.3)] rounded-xl"
                transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
