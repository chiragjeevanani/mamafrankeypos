
import React, { useState } from 'react';
import { 
  Table, Search, Filter, Plus, 
  MoreVertical, Edit2, Trash2, Users,
  Monitor, Layout, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_TABLES_LIST = [
  { id: 1, name: 'Table 1', capacity: 2, zone: 'Main Hall', status: 'available' },
  { id: 2, name: 'Table 2', capacity: 2, zone: 'Main Hall', status: 'occupied' },
  { id: 3, name: 'Table 3', capacity: 4, zone: 'Main Hall', status: 'available' },
  { id: 4, name: 'Table 4', capacity: 4, zone: 'Main Hall', status: 'billing' },
  { id: 5, name: 'Table 5', capacity: 6, zone: 'Balcony', status: 'occupied' },
  { id: 6, name: 'Table 6', capacity: 2, zone: 'VIP Lounge', status: 'available' },
];

export default function TableList() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Table Management Registry</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure Table Settings & Capacity Information</p>
          </div>
          <button className="h-10 px-6 bg-[#5D4037] text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 outline-none">
            <Plus size={14} />
            Add New Table
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH BY TABLE NAME OR ZONE..."
              className="w-full bg-slate-50 border border-slate-100 rounded py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all underline decoration-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="h-10 px-4 bg-white border border-slate-200 text-slate-400 rounded text-[10px] font-black uppercase tracking-widest hover:text-slate-900 flex items-center gap-2 transition-all outline-none">
            <Filter size={14} />
            Filters
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOCK_TABLES_LIST.map(table => (
            <motion.div 
              key={table.id}
              whileHover={{ y: -4 }}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:border-blue-300 hover:shadow-xl hover:shadow-[#5D4037]/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                    table.status === 'available' ? 'bg-emerald-50 text-emerald-500' :
                    table.status === 'occupied' ? 'bg-amber-50 text-amber-500' :
                    'bg-blue-50 text-blue-500'
                  }`}>
                    <Layout size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{table.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded">{table.zone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <button className="text-slate-200 hover:text-slate-900 transition-colors">
                      <MoreVertical size={16} />
                   </button>
                   <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                     table.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                     table.status === 'occupied' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' :
                     'bg-blue-50 text-[#5D4037] border-blue-100'
                   }`}>
                     {table.status}
                   </span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Seating Capacity</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-900">{table.capacity} PERSONS</span>
                </div>
                
                  <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Monitor size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Activity Status</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${table.status === 'available' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="text-[10px] font-black text-slate-900 uppercase">{table.status === 'available' ? 'Available' : 'Active'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <button className="flex items-center justify-center gap-2 py-2.5 bg-[#5D4037] text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md">
                  <Edit2 size={12} />
                  Edit Table
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-400 border border-slate-200 rounded text-[9px] font-black uppercase tracking-widest hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all">
                  <Trash2 size={12} />
                  Remove Table
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
