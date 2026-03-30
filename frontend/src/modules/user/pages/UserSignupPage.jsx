import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function UserSignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate signup
    setTimeout(() => {
      localStorage.setItem('user_token', 'mock_user_jwt_token');
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => navigate('/menu'), 2000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-brand-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-500/30">
            <CheckCircle2 size={48} className="text-charcoal-900" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-display font-bold text-charcoal-900 dark:text-white mb-2">Welcome to the Family!</h2>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-charcoal-500 italic">Prepping your table in 2 seconds...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white flex flex-col p-6 selection:bg-brand-500 selection:text-charcoal-900">
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center py-12">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-display font-bold tracking-tight">Create Account</h1>
          <p className="text-charcoal-500 text-sm mt-2">Join us for a premium dining experience</p>
        </header>

        <main>
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-500 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" size={18} />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full bg-white dark:bg-charcoal-800 border border-charcoal-900/10 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" size={18} />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="hello@example.com"
                  className="w-full bg-white dark:bg-charcoal-800 border border-charcoal-900/10 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-500 ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" size={18} />
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white dark:bg-charcoal-800 border border-charcoal-900/10 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-500 ml-1">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" size={18} />
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </main>

        <footer className="mt-12 text-center">
          <p className="text-xs text-charcoal-500">
            Already a member? {' '}
            <Link to="/login" className="text-brand-500 font-black uppercase tracking-widest text-[10px] hover:underline ml-1">Sign In</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
