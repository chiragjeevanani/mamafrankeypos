import { motion } from 'framer-motion';
import { BottomNav } from './BottomNav';

export function ResponsiveLayout({ children, showNav = true, maxWidth = 'mobile' }) {
  const containerClasses = {
    mobile: 'max-w-lg',
    tablet: 'max-w-4xl',
    kiosk: 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center overflow-x-hidden">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`w-full flex-1 ${containerClasses[maxWidth]} mx-auto pb-safe`}
      >
        {children}
      </motion.main>
      
      {showNav && (
        <div className="w-full max-w-sm fixed bottom-0 left-1/2 -translate-x-1/2 z-[60]">
           <BottomNav />
        </div>
      )}
    </div>
  );
}
