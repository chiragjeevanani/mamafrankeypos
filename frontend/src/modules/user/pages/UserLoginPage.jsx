import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react';

export default function UserLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      localStorage.setItem('user_token', 'mock_user_jwt_token');
      setIsLoading(false);
      navigate('/menu');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white flex flex-col p-6 selection:bg-brand-500 selection:text-charcoal-900">
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center py-12">
        <header className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-brand-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-brand-500/20"
          >
            <Lock size={32} strokeWidth={2.5} className="text-charcoal-900" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Welcome Back</h1>
          <p className="text-charcoal-500 text-sm mt-2">Sign in to continue your feast</p>
        </header>

        <main>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full bg-white dark:bg-charcoal-800 border border-charcoal-900/10 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-500">Password</label>
                <button type="button" className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-charcoal-800 border border-charcoal-900/10 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-charcoal-900 dark:bg-brand-500 text-white dark:text-charcoal-900 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-charcoal-900/30 dark:border-t-charcoal-900 rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="relative my-12">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-charcoal-900/10 dark:border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="bg-cream-50 dark:bg-charcoal-900 px-4 text-charcoal-400">Or continue with</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-white dark:bg-charcoal-800 border border-charcoal-900/10 dark:border-white/5 py-4 rounded-2xl flex items-center justify-center hover:bg-charcoal-50 dark:hover:bg-white/5 transition-all">
              <Chrome size={20} />
            </button>
            <button className="flex-1 bg-white dark:bg-charcoal-800 border border-charcoal-900/10 dark:border-white/5 py-4 rounded-2xl flex items-center justify-center hover:bg-charcoal-50 dark:hover:bg-white/5 transition-all">
              <Github size={20} />
            </button>
          </div>
        </main>

        <footer className="mt-12 text-center">
          <p className="text-xs text-charcoal-500">
            Don't have an account? {' '}
            <Link to="/signup" className="text-brand-500 font-black uppercase tracking-widest text-[10px] hover:underline ml-1">Create One</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
