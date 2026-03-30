
import React, { useState } from 'react';
import { 
  UserPlus, User, Phone, Mail, 
  MapPin, Calendar, Save, Trash2,
  X, ShieldCheck, CreditCard, Star
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AddCustomer() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    tier: 'BRONZE'
  });

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500 overflow-hidden">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Add New Guest Profile</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fill in details to register a new customer in the system</p>
          </div>
          <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <div className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-lg shadow-xl shadow-slate-900/5 overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
                <UserPlus size={24} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Primary Information</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Customer Details</p>
              </div>
            </div>

            <form className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={12} />
                    Full Customer Name
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="FULL LEGAL NAME"
                    className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-blue-600/10 rounded-md transition-all placeholder:text-slate-300"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Phone size={12} />
                    Mobile Number
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="91+ XXXXX XXXXX"
                    className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-blue-600/10 rounded-md transition-all placeholder:text-slate-300"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={12} />
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    placeholder="USER@DOMAIN.COM"
                    className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-blue-600/10 rounded-md transition-all placeholder:text-slate-300"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} />
                    Date of Birth
                  </label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-blue-600/10 rounded-md transition-all"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Star size={12} />
                    Assign Loyalty Tier
                  </label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-blue-600/10 rounded-md transition-all cursor-pointer"
                    value={formData.tier}
                    onChange={(e) => setFormData({...formData, tier: e.target.value})}
                  >
                    <option value="BRONZE">BRONZE (ENTRY)</option>
                    <option value="SILVER">SILVER (TIER-2)</option>
                    <option value="GOLD">GOLD (PRIVILEGE)</option>
                    <option value="PLATINUM">PLATINUM (ELITE)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded border border-emerald-100 flex items-start gap-4">
                <ShieldCheck size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest leading-relaxed">
                  Consent: The customer agrees to receive promotional updates and participate in the loyalty program.
                </p>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  className="flex-1 py-4 border border-slate-200 text-slate-400 rounded text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-900 hover:bg-slate-50 transition-all outline-none"
                >
                  Discard Profile
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 outline-none active:scale-[0.98]"
                >
                  <Save size={16} />
                  Save Customer Profile
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
