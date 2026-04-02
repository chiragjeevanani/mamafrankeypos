import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ListOrdered, Plus, Edit2, Trash2, Power, LayoutGrid, ChefHat } from 'lucide-react';
import { KDS_STATIONS } from '../data/kdsMockData';
import { useTheme } from '../../user/context/ThemeContext';

export default function KitchenStations() {
  const { isDarkMode } = useTheme();
  const [stations, setStations] = useState(KDS_STATIONS.filter(s => s.id !== 'all'));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className={`px-8 py-4 border-b shrink-0 flex items-center justify-between transition-colors duration-500 ${
        isDarkMode ? 'bg-[#1a1c1e] border-white/5 shadow-inner' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className={`text-lg font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-[#E1261C]'}`}>
              Kitchen Stations
            </h1>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#8D6E63]">
              Configure & Manage Prep Nodes
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-6 py-2 bg-[#E1261C] text-[#D4AF37] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#4E342E] transition-all shadow-lg shadow-[#E1261C]/20">
          <Plus size={14} strokeWidth={3} />
          Create New Station
        </button>
      </header>

      <main className={`flex-1 overflow-y-auto p-8 no-scrollbar transition-colors ${
        isDarkMode ? 'bg-[#1a1c1e]' : 'bg-stone-50'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {stations.map((station) => (
            <motion.div
              key={station.id}
              whileHover={{ y: -4 }}
              className={`p-6 rounded-3xl border transition-all ${
                isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-stone-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#E1261C]/10 text-[#E1261C] flex items-center justify-center">
                  <ChefHat size={24} />
                </div>
                <div className="flex gap-2">
                  <button className={`p-2 rounded-lg hover:bg-white/5 transition-all ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                    <Edit2 size={16} />
                  </button>
                  <button className={`p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                    <Power size={16} />
                  </button>
                </div>
              </div>

              <h3 className={`text-xl font-black uppercase tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-[#E1261C]'}`}>
                {station.name}
              </h3>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-6">
                ID: {station.id.toUpperCase()} • Status: <span className="text-emerald-600 font-black">Active</span>
              </p>

              <div className="grid grid-cols-2 gap-3 py-4 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-stone-600 uppercase tracking-widest mb-0.5">Assigned Items</span>
                  <span className="font-bold text-sm">24 Products</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-stone-600 uppercase tracking-widest mb-0.5">Station Load</span>
                  <span className="font-bold text-sm text-amber-600">Moderate</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
