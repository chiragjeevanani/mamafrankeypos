
import React, { useState } from 'react';
import { 
  Map, LayoutGrid, Users, History, 
  Plus, Search, Filter, Layers, 
  Monitor, Coffee, Utensils, Wine
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_TABLES = [
  { id: 1, name: 'T-01', capacity: 2, status: 'available', x: '15%', y: '20%', type: 'booth' },
  { id: 2, name: 'T-02', capacity: 2, status: 'occupied', x: '15%', y: '45%', type: 'booth' },
  { id: 3, name: 'T-03', capacity: 4, status: 'available', x: '40%', y: '20%', type: 'standard' },
  { id: 4, name: 'T-04', capacity: 4, status: 'billing', x: '40%', y: '45%', type: 'standard' },
  { id: 5, name: 'T-05', capacity: 6, status: 'occupied', x: '40%', y: '75%', type: 'large' },
  { id: 6, name: 'T-06', capacity: 2, status: 'available', x: '70%', y: '20%', type: 'bar' },
  { id: 7, name: 'T-07', capacity: 2, status: 'available', x: '70%', y: '40%', type: 'bar' },
  { id: 8, name: 'T-08', capacity: 2, status: 'available', x: '70%', y: '60%', type: 'bar' },
];

export default function TableLayout() {
  const [selectedZone, setSelectedZone] = useState('MAIN HALL');

  return (
    <div className="h-full flex flex-col bg-[#F4F4F7] animate-in fade-in duration-500 overflow-hidden">
      {/* Page Header */}
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Table Layout & Occupancy</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Dashboard for Table Status & Service Flow</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-50 p-1 border border-slate-100 rounded">
              {['MAIN HALL', 'BALCONY', 'VIP LOUNGE'].map(zone => (
                <button 
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${selectedZone === zone ? 'bg-[#E1261C] text-white shadow-md shadow-slate-900/10' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  {zone}
                </button>
              ))}
            </div>
            <button className="h-9 w-9 bg-white border border-slate-200 rounded flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm">
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-8 px-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-emerald-500 shadow-sm" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-amber-500 shadow-sm animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-blue-500 shadow-sm" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Billing in Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-rose-500 shadow-sm" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Out of Service</span>
          </div>
        </div>
      </header>

      {/* Floor Plan Area */}
      <div className="flex-1 relative p-12 overflow-hidden bg-[#F8F9FA]">
        {/* Floor Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        {/* Visual Boundaries */}
        <div className="absolute inset-x-20 top-20 bottom-20 border-4 border-dashed border-slate-200/50 rounded-3xl" />
        
        {/* Tables */}
        <div className="relative w-full h-full max-w-5xl mx-auto">
          {MOCK_TABLES.map(table => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              style={{ left: table.x, top: table.y }}
              className={`absolute cursor-pointer flex flex-col items-center gap-2 group transition-all`}
            >
              {/* Table Object */}
              <div 
                className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-all bg-white relative ${
                  table.status === 'available' ? 'border-emerald-500/30 group-hover:border-emerald-500 shadow-emerald-500/5' : 
                  table.status === 'occupied' ? 'border-amber-500 bg-amber-50 shadow-amber-500/10' : 
                  'border-blue-500 bg-blue-50 shadow-blue-500/10'
                } shadow-xl`}
              >
                {table.status === 'occupied' && <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full border-2 border-white animate-pulse" />}
                <div className="flex flex-col items-center">
                  <span className={`text-[11px] font-black tracking-tight ${table.status !== 'available' ? 'text-slate-900' : 'text-slate-400'}`}>
                    {table.name}
                  </span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[...Array(table.capacity)].map((_, i) => (
                      <div key={i} className={`w-1 h-1 rounded-full ${table.status !== 'available' ? 'bg-[#E1261C]/20' : 'bg-slate-300'}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Tooltip Label */}
              <div className="px-2 py-0.5 bg-[#E1261C] rounded-full opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0 absolute -bottom-8 whitespace-nowrap z-10 shadow-lg">
                <span className="text-[8px] font-black text-white uppercase tracking-widest">{table.capacity} PAX • {table.type}</span>
              </div>
            </motion.div>
          ))}

          {/* Environmental Elements */}
          <div className="absolute left-[85%] top-[10%] w-24 h-40 bg-slate-100/50 border border-slate-200 rounded-lg flex flex-col items-center justify-center gap-2">
            <Monitor size={24} className="text-slate-300" />
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">KITCHEN STATION</span>
          </div>

          <div className="absolute left-[10%] top-[85%] w-32 h-12 bg-[#E1261C] text-white rounded flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20">
            <LayoutGrid size={16} />
            <span className="text-[9px] font-black uppercase tracking-widest">BILLING COUNTER</span>
          </div>
        </div>
      </div>

      {/* Quick Action Footer */}
      <footer className="h-20 bg-white border-t border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-8">
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Occupancy</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[62%] h-full bg-blue-600 rounded-full" />
                </div>
                <span className="text-[11px] font-black text-slate-900 uppercase">62% CAPACITY</span>
              </div>
           </div>
           <div className="w-px h-8 bg-slate-100" />
           <div className="flex items-center gap-6">
              {[
                { icon: Coffee, label: 'Table Turn' },
                { icon: Utensils, label: 'Avg Pacing' },
                { icon: Wine, label: 'VIP Presence' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center text-slate-400">
                    <item.icon size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-900 uppercase leading-none mb-1">{item.label}</p>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Healthy Flow</span>
                  </div>
                </div>
              ))}
           </div>
        </div>
        <button className="h-10 px-6 bg-stone-50 text-[#E1261C] border border-stone-100 p-2.5 py-1.2 rounded-md text-[10px] font-black hover:bg-stone-100 transition-colors flex items-center gap-1.5 uppercase tracking-wider shadow-sm">
          <Layers size={14} />
          Edit Layout
        </button>
      </footer>
    </div>
  );
}
