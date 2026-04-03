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
    <div className="min-h-screen bg-staff-bg flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-staff-card/95 backdrop-blur-xl border-b border-staff-border px-6 py-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-slate-100 rounded-2xl text-staff-text-primary group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-staff-text-primary tracking-tight mb-1">New Guest</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-staff-text-muted">Step 1: Registration</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full bg-staff-card shadow-xl shadow-staff-primary/10 p-6 pb-32">
        {isSubmitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-staff-success/10 rounded-[2.5rem] flex items-center justify-center text-staff-success mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-xl font-black text-staff-text-primary mb-2">Guest Registered!</h2>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Redirecting to directory...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-staff-text-muted ml-4">Full Name</label>
                <div className="relative group">
                  <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-staff-text-muted group-focus-within:text-staff-text-primary transition-colors" />
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-staff-bg border border-staff-border rounded-3xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-staff-card transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-staff-text-muted ml-4">Phone Number</label>
                <div className="relative group">
                  <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-staff-text-muted group-focus-within:text-staff-text-primary transition-colors" />
                  <input 
                    required
                    type="tel" 
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-staff-bg border border-staff-border rounded-3xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-staff-card transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-staff-text-muted ml-4">Email Address</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-staff-text-muted group-focus-within:text-staff-text-primary transition-colors" />
                  <input 
                    type="email" 
                    placeholder="guest@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-staff-bg border border-staff-border rounded-3xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-staff-card transition-all"
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-5 bg-staff-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-900/20"
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

