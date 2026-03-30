
import React, { useState } from 'react';
import { 
  Clock, CheckCircle2, Search, Filter, 
  MoreVertical, Receipt, ChevronRight,
  Timer, AlertCircle, Utensils
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_ACTIVE = [
  { id: '101', table: 'Table 4', items: 3, total: 840, time: '12 MINS', status: 'preparing', items_list: ['Paneer Butter Masala x1', 'Butter Naan x2'] },
  { id: '102', table: 'Table 2', items: 5, total: 1240, time: '8 MINS', status: 'ready', items_list: ['Dal Tadka x1', 'Masala Tea x4'] },
  { id: '103', table: 'Table 7', items: 2, total: 320, time: '22 MINS', status: 'preparing', items_list: ['Veg Manchurian x1', 'Coke x1'] },
  { id: '104', table: 'Takeaway', items: 1, total: 280, time: '4 MINS', status: 'ready', items_list: ['Margherita Pizza x1'] },
];

export default function ActiveOrders() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500">
      {/* Page Header */}
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">Active Order Management</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live KOT Monitoring & Status Tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 px-4 bg-blue-50 text-blue-600 rounded flex items-center gap-2 border border-blue-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">{MOCK_ACTIVE.length} Orders Active</span>
            </div>
            <button className="h-10 px-4 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
              New Order Input
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] relative transition-all ${activeTab === 'all' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            All Active Orders
            {activeTab === 'all' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
          <button 
            onClick={() => setActiveTab('preparing')}
            className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] relative transition-all ${activeTab === 'preparing' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            In Preparation
            {activeTab === 'preparing' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
          <button 
            onClick={() => setActiveTab('ready')}
            className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] relative transition-all ${activeTab === 'ready' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Ready for Service
            {activeTab === 'ready' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        </div>
      </header>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_ACTIVE.filter(order => activeTab === 'all' || order.status === activeTab).map(order => (
            <motion.div 
              key={order.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col group transition-all hover:border-blue-300 hover:shadow-xl hover:shadow-blue-600/5"
            >
              <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-white ${order.status === 'ready' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-900 shadow-slate-900/20'} shadow-lg`}>
                    <Utensils size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-tight text-slate-900">{order.table}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest tracking-tighter">Order #{order.id}</p>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-900">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="p-5 flex-1 space-y-4">
                <div className="space-y-1.5">
                  {order.items_list.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Timer size={12} className={order.status === 'ready' ? 'text-emerald-500' : 'text-blue-500'} />
                    <span className="text-[10px] font-black text-slate-900 uppercase">{order.time} ELAPSED</span>
                  </div>
                  <span className="text-xs font-black text-slate-950">₹{order.total}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                <button className="flex-1 py-2 bg-white border border-slate-200 rounded text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                  Show Details
                </button>
                <button className={`flex-1 py-2 rounded text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-md active:scale-95 ${order.status === 'ready' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/10' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'}`}>
                  {order.status === 'ready' ? 'Finalize Bill' : 'Mark Ready'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
