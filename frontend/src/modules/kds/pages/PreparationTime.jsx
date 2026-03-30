import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Target, Clock, AlertCircle, Save } from 'lucide-react';
import { useTheme } from '../../user/context/ThemeContext';

export default function PreparationTime() {
  const { isDarkMode } = useTheme();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className={`px-8 py-4 border-b shrink-0 flex items-center justify-between transition-colors duration-500 ${
        isDarkMode ? 'bg-[#1a1c1e] border-white/5 shadow-inner' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className={`text-lg font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-[#5D4037]'}`}>
              Preparation Time
            </h1>
            <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">
              Configure SLOs & Prep Thresholds
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-6 py-2 bg-[#D4AF37] text-[#5D4037] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#C5A028] transition-all shadow-lg shadow-[#D4AF37]/20">
          <Save size={14} strokeWidth={3} />
          Save Configuration
        </button>
      </header>

      <main className={`flex-1 overflow-y-auto p-8 no-scrollbar transition-colors ${
        isDarkMode ? 'bg-[#1a1c1e]' : 'bg-stone-50'
      }`}>
        <div className="max-w-4xl space-y-12">
          {/* Global Target */}
          <section>
            <h2 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] mb-6 px-1">Global Targets</h2>
            <div className={`p-8 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-stone-100 shadow-sm'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-3 block">Ideal Window</label>
                  <div className="flex items-end gap-3">
                    <input type="number" defaultValue="12" className={`text-4xl font-black bg-transparent border-b-2 outline-none w-24 ${isDarkMode ? 'border-white/10 text-white' : 'border-stone-200 text-[#5D4037]'}`} />
                    <span className="text-xl font-black text-stone-400 mb-1">MINS</span>
                  </div>
                </div>
                <div>
                    <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-3 block">Warning Spike</label>
                    <div className="flex items-end gap-3">
                      <input type="number" defaultValue="18" className={`text-4xl font-black bg-transparent border-b-2 outline-none w-24 border-amber-500/30 text-amber-600`} />
                      <span className="text-xl font-black text-stone-400 mb-1">MINS</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-3 block">Critical Breach</label>
                    <div className="flex items-end gap-3">
                      <input type="number" defaultValue="25" className={`text-4xl font-black bg-transparent border-b-2 outline-none w-24 border-red-500/30 text-red-600`} />
                      <span className="text-xl font-black text-stone-400 mb-1">MINS</span>
                    </div>
                  </div>
              </div>
            </div>
          </section>

          {/* Station Specifics */}
          <section>
            <h2 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] mb-6 px-1">Station Performance SLOs</h2>
            <div className={`rounded-[2.5rem] border overflow-hidden transition-all ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-stone-100 shadow-sm'}`}>
              <table className="w-full text-left">
                <thead>
                  <tr className={`border-b transition-colors ${isDarkMode ? 'border-white/5 bg-black/20' : 'bg-stone-50 border-stone-100'}`}>
                    <th className="px-8 py-5 text-[9px] font-black text-stone-500 uppercase tracking-widest">Station Name</th>
                    <th className="px-8 py-5 text-[9px] font-black text-stone-500 uppercase tracking-widest">Target</th>
                    <th className="px-8 py-5 text-[9px] font-black text-stone-500 uppercase tracking-widest">Avg Actual</th>
                    <th className="px-8 py-5 text-[9px] font-black text-stone-500 uppercase tracking-widest text-right">Drift</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-white/5' : 'divide-stone-50'}`}>
                  {[
                    { name: 'GRILL STATION', target: '15m', avg: '14.2m', drift: '-0.8m', color: 'emerald' },
                    { name: 'MAIN KITCHEN', target: '20m', avg: '22.5m', drift: '+2.5m', color: 'red' },
                    { name: 'SALAD & COLD', target: '10m', avg: '8.4m', drift: '-1.6m', color: 'emerald' },
                    { name: 'BEVERAGES', target: '5m', avg: '4.8m', drift: '-0.2m', color: 'emerald' },
                  ].map((row, idx) => (
                    <tr key={idx} className={`transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-stone-50'}`}>
                      <td className={`px-8 py-6 font-black text-xs uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{row.name}</td>
                      <td className="px-8 py-6 text-sm font-bold text-stone-500">{row.target}</td>
                      <td className={`px-8 py-6 text-sm font-black ${isDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>{row.avg}</td>
                      <td className={`px-8 py-6 text-sm font-black text-right ${
                        row.color === 'emerald' ? 'text-emerald-500' : 'text-red-500'
                      }`}>{row.drift}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
