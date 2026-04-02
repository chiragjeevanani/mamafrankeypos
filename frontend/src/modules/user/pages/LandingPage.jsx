import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Table2, ChefHat, Leaf } from 'lucide-react';
import logo from '../../../assets/time-to-eat.jpeg';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white relative overflow-hidden flex flex-col transition-colors duration-300">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0">
        <motion.div
           animate={{
             scale: [1, 1.1, 1],
             opacity: [0.3, 0.4, 0.3],
           }}
           transition={{ duration: 10, repeat: Infinity }}
           className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500 rounded-full blur-[120px]"
        />
        <motion.div
           animate={{
             scale: [1.1, 1, 1.1],
             opacity: [0.2, 0.3, 0.2],
           }}
           transition={{ duration: 8, repeat: Infinity, delay: 1 }}
           className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-orange-400 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-width-4xl w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="h-10 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Logo" className="h-full w-auto object-contain" />
            </div>
            <div className="h-8 w-px bg-charcoal-900/10 dark:bg-white/10" />
            <span className="text-xl font-display font-bold tracking-tight">Time to eat Kitchen</span>
          </motion.div>

          {/* Main Title */}
          <div className="space-y-6 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-6xl sm:text-8xl font-display font-bold leading-[0.9] tracking-tighter">
                FARM TO TABLE <br />
                <span className="text-brand-500">FRESHNESS.</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-charcoal-400 max-w-xl font-medium"
            >
              Experience the symphony of flavors crafted with ingredients sourced directly from local organic farms.
            </motion.p>
          </div>

          {/* Interactive Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: '#ffffff', color: '#121212' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/menu')}
              className="relative p-6 px-8 rounded-[2rem] bg-brand-500 text-charcoal-900 flex flex-col justify-center items-center h-56 transition-all duration-300 group shadow-orange hover:shadow-premium-hover"
            >
              <div className="absolute top-6 left-8">
                <ArrowRight size={32} strokeWidth={2} className="group-hover:translate-x-2 transition-transform duration-300" />
              </div>
              <div className="flex flex-col items-center text-center w-full">
                <h3 className="text-3xl font-bold mb-1 uppercase tracking-wider">Dine In</h3>
                <p className="text-sm font-medium opacity-80">Order now for Table 07</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/menu')}
              className="relative p-6 px-8 rounded-[2rem] bg-[#1a1a1a] border border-white/5 flex flex-col justify-center items-center h-56 backdrop-blur-md group shadow-premium hover:border-white/20 transition-all duration-300"
            >
              <div className="absolute top-6 left-8">
                <Table2 size={32} strokeWidth={2} className="text-charcoal-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="flex flex-col items-center text-center w-full">
                <h3 className="text-3xl font-bold mb-1 uppercase tracking-wider text-white">Pickup</h3>
                <p className="text-sm text-charcoal-400 font-medium group-hover:text-charcoal-300 transition-colors duration-300">Collect from counter</p>
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 p-8 flex flex-col sm:flex-row items-center justify-between border-t border-white/5">
        <div className="flex gap-8 mb-4 sm:mb-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-bold text-charcoal-400 uppercase tracking-widest">Kitchen Open</span>
          </div>
          <div className="flex items-center gap-2">
            <ChefHat size={16} className="text-brand-500" />
            <span className="text-sm text-charcoal-400">Chef Special: Paneer Tikka</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Leaf size={20} className="text-charcoal-600" />
          <span className="text-xs text-charcoal-500 max-w-xs text-right hidden sm:block">
            Our packaging is 100% biodegradable and eco-friendly.
          </span>
        </div>
      </div>
    </div>
  );
}
