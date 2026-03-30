import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calculator, Delete, ArrowRight, UserCheck, Shield, Zap } from 'lucide-react';

export default function PosLoginPage() {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    document.body.style.backgroundColor = '#0A0A0B';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.overflow = '';
    };
  }, []);

  const handleNumberClick = (num) => {
    if (pin.length < 4) setPin(prev => prev + num);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) return;

    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('pos_access', 'mock_pos_token');
      setIsLoading(false);
      navigate('/pos/tables');
    }, 1500);
  };

  // Keyboard support
  const handleKeyDown = (e) => {
    if (/[0-9]/.test(e.key)) handleNumberClick(e.key);
    if (e.key === 'Backspace') handleDelete();
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div 
      className="h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-4 lg:p-8 selection:bg-brand-500 font-sans overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10">
        
        {/* Left Side: System Information & Branding */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden lg:flex flex-col gap-10"
        >
          <div>
            <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-brand-500/20">
              <Calculator size={32} className="text-charcoal-900" strokeWidth={2.5} />
            </div>
            <h1 className="text-6xl font-display font-black tracking-tighter uppercase leading-none mb-4">
              Terminal <br />
              <span className="text-brand-500 italic">Access</span>
            </h1>
            <p className="text-charcoal-400 font-medium text-lg max-w-md leading-relaxed">
              Secure Point of Sale Gateway. Authorized personnel only. Please enter your terminal PIN to initiate session.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/5">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-charcoal-500 uppercase tracking-widest">Station Status</p>
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Active / Online
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-charcoal-500 uppercase tracking-widest">Network</p>
              <p className="text-white font-bold italic italic font-display">KMS-992-SECURE</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-charcoal-500 uppercase tracking-widest">Firmware</p>
              <p className="text-white font-bold font-display tracking-tight">v4.2.0-stable</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-charcoal-500 uppercase tracking-widest">Hardware</p>
              <p className="text-white font-bold font-display tracking-tight">RTX-900 Terminal</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 w-fit">
            <Shield size={20} className="text-brand-500" />
            <span className="text-xs font-bold text-charcoal-300 uppercase tracking-widest">AES-256 Bit Encrypted Connection</span>
          </div>
        </motion.div>

        {/* Right Side: Keypad Interface */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-[#141416] p-6 lg:p-10 rounded-[3rem] border border-white/5 shadow-2xl relative">
            {/* Mobile-only header */}
            <div className="lg:hidden text-center mb-6">
              <div className="w-10 h-10 bg-brand-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <Calculator size={20} className="text-charcoal-900" />
              </div>
              <h2 className="text-xl font-display font-black tracking-tight uppercase">Terminal Login</h2>
            </div>

            <div className="space-y-6 lg:space-y-8">
              {/* PIN Display */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-charcoal-500 uppercase tracking-widest">Enter Access PIN</span>
                  <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{pin.length} / 4</span>
                </div>
                <div className="flex justify-center gap-5 p-6 bg-black/40 rounded-2xl border border-white/5">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i}
                      className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                        pin.length >= i ? 'bg-brand-500 border-brand-500 scale-125 shadow-lg shadow-brand-500/50' : 'border-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <motion.button
                    key={num}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleNumberClick(num.toString())}
                    className="h-16 lg:h-20 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-2xl font-black hover:bg-brand-500 hover:text-charcoal-900 transition-all duration-300 group"
                  >
                    {num}
                  </motion.button>
                ))}
                <div />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNumberClick('0')}
                  className="h-16 lg:h-20 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-2xl font-black hover:bg-brand-500 hover:text-charcoal-900 transition-all duration-300"
                >
                  0
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="h-16 lg:h-20 flex items-center justify-center text-charcoal-500 hover:text-white transition-colors"
                >
                  <Delete size={28} />
                </motion.button>
              </div>

              <button 
                onClick={handleLogin}
                disabled={isLoading || pin.length !== 4}
                className="w-full bg-brand-500 text-charcoal-900 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-20 disabled:grayscale transition-all duration-500 overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-charcoal-900/30 border-t-charcoal-900 rounded-full animate-spin" />
                  ) : (
                    <>Authorize Terminal <ArrowRight size={18} /></>
                  )}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer System Branding for Mobile */}
      <div className="lg:hidden absolute bottom-8 left-0 w-full text-center">
        <p className="text-[9px] font-bold text-charcoal-600 uppercase tracking-[0.4em]">
           Time to eat-TERMINAL OPERATIONS &copy; 2026
        </p>
      </div>
    </div>
  );
}

