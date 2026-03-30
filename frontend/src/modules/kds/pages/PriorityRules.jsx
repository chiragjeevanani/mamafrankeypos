import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Users, ShoppingBag, ArrowUpCircle, Info, Save } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

export default function PriorityRules() {
  const { isDarkMode } = useTheme();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className={`px-8 py-4 border-b shrink-0 flex items-center justify-between transition-colors duration-500 ${
        isDarkMode ? 'bg-[#1a1c1e] border-white/5 shadow-inner' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className={`text-lg font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-[#5D4037]'}`}>
              Priority Rules
            </h1>
            <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">
              Define Auto-Prioritization Logic
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-6 py-2 bg-[#5D4037] text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#4E342E] transition-all shadow-lg shadow-[#5D4037]/20">
          <Save size={14} strokeWidth={3} />
          Deploy Rules
        </button>
      </header>

      <main className={`flex-1 overflow-y-auto p-8 no-scrollbar transition-colors ${
        isDarkMode ? 'bg-[#1a1c1e]' : 'bg-stone-50'
      }`}>
        <div className="max-w-3xl space-y-8">
          <div className={`p-6 rounded-[2rem] border flex items-start gap-4 mb-10 transition-colors ${
            isDarkMode ? 'bg-[#D4AF37]/5 border-[#D4AF37]/20' : 'bg-[#D4AF37]/10 border-[#D4AF37]/30 shadow-sm'
          }`}>
            <Info className="text-[#D4AF37] shrink-0" size={24} />
            <div>
              <h4 className="text-sm font-black text-[#5D4037] uppercase tracking-widest mb-1">How rules work</h4>
              <p className={`text-xs font-bold uppercase tracking-wide leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                Rules are evaluated from top to bottom. The first rule that matches an order will apply the specified priority boost.
              </p>
            </div>
          </div>

          {[
            { id: 1, title: 'VIP & High Loyalty Customers', icon: Users, desc: 'Priority +100 (Immediate Action Required)', active: true },
            { id: 2, title: 'Dine-In Hot Mains', icon: Zap, desc: 'Priority +50 (Before Takeaway/Online)', active: true },
            { id: 3, title: 'Scheduled Orders (Pre-orders)', icon: ShoppingBag, desc: 'Priority +25 (Based on Target Time)', active: false },
            { id: 4, title: 'Small Orders (1-2 items)', icon: ArrowUpCircle, desc: 'Priority +10 (Fast fulfillment throughput)', active: true }
          ].map((rule) => (
            <div 
              key={rule.id}
              className={`p-6 rounded-[2rem] border flex items-center justify-between transition-all ${
                isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-stone-100 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  rule.active 
                    ? (isDarkMode ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-[#5D4037]/10 text-[#5D4037]') 
                    : 'bg-stone-500/10 text-stone-500 opacity-30 shadow-inner'
                }`}>
                  <rule.icon size={24} />
                </div>
                <div>
                  <h3 className={`text-lg font-black uppercase tracking-tight mb-1 transition-colors ${
                    rule.active ? (isDarkMode ? 'text-white' : 'text-stone-800') : 'text-stone-400'
                  }`}>
                    {rule.title}
                  </h3>
                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                    {rule.desc}
                  </p>
                </div>
              </div>

              <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all relative ${
                rule.active ? 'bg-[#D4AF37]' : 'bg-stone-700 shadow-inner'
              }`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${
                  rule.active ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
