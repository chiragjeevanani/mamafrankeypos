import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { StaffNavbar } from '../components/StaffNavbar';
import { useNavigate } from 'react-router-dom';

export default function AddCustomer() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      navigate('/staff/customers');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-6 py-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-slate-100 rounded-2xl text-slate-900 group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">New Guest</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 1: Registration</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full bg-white shadow-xl shadow-slate-200/50 p-6 pb-32">
        {isSubmitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center text-emerald-500 mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Guest Registered!</h2>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Redirecting to directory...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                <div className="relative group">
                  <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Phone Number</label>
                <div className="relative group">
                  <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                  <input 
                    required
                    type="tel" 
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                  <input 
                    type="email" 
                    placeholder="guest@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-900/20"
            >
              Complete Registration
            </motion.button>
          </form>
        )}
      </main>

      <StaffNavbar activeTab="customers" />
    </div>
  );
}

