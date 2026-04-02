import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { ALL_STAFF as STAFF_USERS } from '../../pos/data/staff';

export default function StaffLogin() {
  const [staffId, setStaffId] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate auth
    setTimeout(() => {
      const foundStaff = STAFF_USERS.find(s => s.id === staffId || s.name.toLowerCase().includes(staffId.toLowerCase()));
      if (foundStaff && pin === foundStaff.pin) {
        localStorage.setItem('staff_access', JSON.stringify(foundStaff));
        navigate('/staff/dashboard');
      } else {
        setError('Invalid Staff ID or PIN.');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 flex items-center justify-center p-6 font-sans transition-colors duration-300">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-md w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-primary-red rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <ShieldCheck size={40} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900 dark:text-white tracking-tight">Staff Portal</h1>
          <p className="text-charcoal-500 font-medium text-sm mt-2 font-display">Operations Management System v4.0</p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-200"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Staff Identifier</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder="Enter ID (e.g. S102)"
                  className="w-full bg-white dark:bg-charcoal-800 border border-charcoal-900/10 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary-red/10 transition-all font-medium text-charcoal-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-charcoal-400 ml-1">Secure PIN</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" size={18} />
                <input 
                  type="password" 
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  maxLength={4}
                  className="w-full bg-white dark:bg-charcoal-800 border border-charcoal-900/10 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary-red/10 transition-all font-bold tracking-widest text-charcoal-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-xs font-bold text-center italic"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full bg-primary-yellow hover:bg-yellow-soft text-neutral-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-primary-yellow/10 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-neutral-black/30 border-t-neutral-black rounded-full animate-spin" />
              ) : (
                <>Authorize Access <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-8 border-t border-charcoal-900/5 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary-red" />
              <span className="text-[9px] font-black text-charcoal-400 uppercase tracking-tighter italic">Terminal ID: KMS-992</span>
            </div>
            <button className="text-[9px] font-black text-primary-red uppercase tracking-widest hover:underline italic">Forgot Access?</button>
          </div>
        </motion.div>

        <p className="text-center mt-10 text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.4em]">
           Time to eat Operations &copy; 2026
        </p>
        </div>
      </div>
    </div>
  );
}
