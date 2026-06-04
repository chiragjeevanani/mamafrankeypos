import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, ArrowRight, ShieldCheck, HelpCircle, AlertCircle } from 'lucide-react';
import api from '../../../utils/api';
import { usePos } from '../../pos/context/PosContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { refreshMenu, fetchStoreSettings } = usePos();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/auth/admin/login', { email, password });
      localStorage.setItem('admin_access', data.token);
      localStorage.setItem('user_info', JSON.stringify(data));
      setIsLoading(false);
      
      // Fetch required data directly after login to prevent empty state on first load
      await refreshMenu();
      await fetchStoreSettings();

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-charcoal-900 text-charcoal-900 dark:text-white flex items-center justify-center p-6 selection:bg-brand-500 font-sans">
      <div className="w-full max-w-sm">
        <header className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-charcoal-900 dark:bg-brand-500 rounded-[2rem] mx-auto mb-6 flex items-center justify-center shadow-2xl"
          >
            <ShieldCheck size={40} className="text-brand-500 dark:text-charcoal-900" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-display font-black tracking-tight text-charcoal-900 dark:text-white uppercase leading-none">Security Portal</h1>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 bg-brand-500/10 dark:bg-brand-500/20 rounded-full border border-brand-500/10">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-500">Restricted Admin Access</p>
          </div>
        </header>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-charcoal-800 rounded-[3rem] p-10 border border-charcoal-900/5 dark:border-white/5 shadow-2xl relative overflow-hidden"
        >
          {/* Security Pattern Overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3"
              >
                <AlertCircle size={16} className="text-rose-500" />
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">{error}</p>
              </motion.div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-400 ml-1">Admin Identity</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@restaurant.com"
                  className="w-full bg-slate-50 dark:bg-charcoal-900 border border-charcoal-900/5 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-400 ml-1">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-charcoal-900 border border-charcoal-900/5 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-charcoal-900 dark:bg-brand-500 text-white dark:text-charcoal-900 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-charcoal-900/30 dark:border-t-charcoal-900 rounded-full animate-spin" />
              ) : (
                <>Sign In Securely <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-charcoal-900/5 dark:border-white/5 flex items-center justify-between opacity-50">
             <div className="flex items-center gap-2">
                <ShieldAlert size={12} className="text-amber-500" />
                <span className="text-[8px] font-black uppercase tracking-tighter">Level 4 Clearance</span>
             </div>
             <button className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-brand-500 hover:underline">
                <HelpCircle size={10} /> Support
             </button>
          </div>
        </motion.div>

        <footer className="mt-12 text-center opacity-40">
           <p className="text-[9px] font-bold text-charcoal-500 uppercase tracking-[0.4em]">
             System Node: ADMIN-X1
           </p>
        </footer>
      </div>
    </div>
  );
}
