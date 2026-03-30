
import React, { useState } from 'react';
import { 
  Users, Search, Filter, Plus, 
  Star, Phone, Mail, History,
  MoreVertical, Edit2, ShieldCheck,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_CUSTOMERS = [
  { id: 'CUST-001', name: 'Chirag Jeevanani', phone: '98765 43210', email: 'chirag@example.com', visits: 12, points: 2450, tier: 'GOLD' },
  { id: 'CUST-002', name: 'Ananya Mishra', phone: '98765 43211', email: 'ananya@example.com', visits: 5, points: 840, tier: 'SILVER' },
  { id: 'CUST-003', name: 'Rahul Khanna', phone: '98765 43212', email: 'rahul@example.com', visits: 24, points: 5120, tier: 'PLATINUM' },
  { id: 'CUST-004', name: 'Priya Verma', phone: '98765 43213', email: 'priya@example.com', visits: 1, points: 100, tier: 'BRONZE' },
];

export default function CustomerList() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Customer Directory</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Customer Profiles & Loyalty Rewards</p>
          </div>
          <button className="h-10 px-6 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 outline-none">
            <Plus size={14} />
            Add New Customer
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH BY CUSTOMER NAME, PHONE, OR ID..."
              className="w-full bg-slate-50 border border-slate-100 rounded py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all underline decoration-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="h-10 px-4 bg-white border border-slate-200 text-slate-400 rounded text-[10px] font-black uppercase tracking-widest hover:text-slate-900 flex items-center gap-2 transition-all outline-none">
            <Filter size={14} />
            Data Segments
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {MOCK_CUSTOMERS.map(cust => (
            <motion.div 
              key={cust.id}
              whileHover={{ y: -4 }}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:border-blue-300 hover:shadow-xl hover:shadow-blue-600/5 transition-all group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 opacity-[0.03] -mr-12 -mt-12 rounded-full transition-all group-hover:scale-110 ${
                cust.tier === 'PLATINUM' ? 'bg-slate-900' : 
                cust.tier === 'GOLD' ? 'bg-amber-500' : 'bg-blue-500'
              }`} />
              
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight mb-1">{cust.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                        cust.tier === 'PLATINUM' ? 'bg-slate-900 text-white border-slate-900' :
                        cust.tier === 'GOLD' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {cust.tier} Tier
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-1 text-slate-200 hover:text-slate-900 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="space-y-3 border-t border-slate-50 pt-4">
                <div className="flex items-center gap-3 text-slate-400">
                  <Phone size={12} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest underline decoration-transparent">+91 {cust.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail size={12} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate underline decoration-transparent">{cust.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-50">
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Loyalty Stats</p>
                    <span className="text-[11px] font-black text-slate-900">{cust.visits} TOTAL VISITS</span>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Points</p>
                    <div className="flex items-center justify-end gap-1 px-1.5 py-0.5 bg-blue-50 rounded-sm border border-blue-100 inline-flex">
                       <Star size={10} className="text-blue-500 fill-blue-500/20" />
                       <span className="text-[10px] font-black text-blue-600">{cust.points}</span>
                    </div>
                 </div>
              </div>

              <div className="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <button className="flex-1 py-2 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2">
                  <CreditCard size={12} />
                  POS Link
                </button>
                <button className="p-2 bg-slate-50 text-slate-400 border border-slate-200 rounded hover:text-slate-900 transition-all">
                  <History size={14} />
                </button>
                <button className="p-2 bg-slate-50 text-slate-400 border border-slate-200 rounded hover:text-slate-900 transition-all">
                  <Edit2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
