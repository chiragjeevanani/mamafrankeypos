
import React from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, 
  MapPin, ShoppingBag, Clock, DollarSign,
  PieChart, Activity, Globe, Zap,
  Download, Calendar, Filter, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsDashboard() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
       {/* Intelligence Header */}
       <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Intelligence & Frameworks</h1>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Deep visual analysis of business units and market protocols</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex bg-white p-1 border border-slate-200 rounded-sm">
              <button className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-sm rounded-sm">Period View</button>
              <button className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Matrix View</button>
           </div>
           <button className="h-9 px-4 bg-white border border-slate-200 text-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
              <Download size={14} />
              Export Intelligence
           </button>
        </div>
      </div>

      {/* Primary KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
            { label: 'Network Revenue', val: '₹42.8L', trend: '+24%', color: 'blue', icon: DollarSign },
            { label: 'Customer Retention', val: '68.2%', trend: '+4.1%', color: 'emerald', icon: Users },
            { label: 'Avg Ticket Size', val: '₹1,420', trend: '-2.5%', color: 'amber', icon: ShoppingBag },
            { label: 'Protocol Efficiency', val: '94.8%', trend: '+0.4%', color: 'purple', icon: Zap },
         ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm relative overflow-hidden group">
               <div className={`absolute top-0 right-0 w-24 h-24 bg-${kpi.color}-50/50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110`} />
               <kpi.icon size={20} className={`text-${kpi.color}-500 mb-4`} />
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
               <h3 className="text-2xl font-black text-slate-900">{kpi.val}</h3>
               <div className="flex items-center gap-1 mt-2">
                  <span className={`text-[9px] font-black uppercase ${kpi.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                     {kpi.trend} vs Prev Period
                  </span>
               </div>
            </div>
         ))}
      </div>

      {/* Visual Analytics Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Sales Velocity */}
         <div className="bg-white border border-slate-100 rounded-sm shadow-sm p-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
               <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Velocity Mapping</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Growth progression across 12-month window</p>
               </div>
               <BarChart3 size={20} className="text-slate-200" />
            </div>
            
            <div className="h-64 flex items-end justify-between gap-3 px-2">
               {[40, 65, 52, 85, 45, 95, 70, 55, 80, 60, 40, 90].map((h, i) => (
                  <div key={i} className="flex-1 group relative flex flex-col items-center h-full justify-end">
                     <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        <div className="bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-sm shadow-xl">
                           UNIT {h}
                        </div>
                     </div>
                     <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05 }}
                        className="w-full bg-slate-100 rounded-t-sm group-hover:bg-slate-900 transition-colors"
                     />
                  </div>
               ))}
            </div>
            <div className="flex items-center justify-between px-2 pt-4 border-t border-slate-50">
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Q1 PROTOCOL</span>
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Q2 PROTOCOL</span>
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Q3 PROTOCOL</span>
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Q4 PROTOCOL</span>
            </div>
         </div>

         {/* Distribution Radar */}
         <div className="bg-white border border-slate-100 rounded-sm shadow-sm p-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
               <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Demographic Distribution</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel and Revenue density per region</p>
               </div>
               <PieChart size={20} className="text-slate-200" />
            </div>

            <div className="space-y-6 flex-1 py-4">
               {[
                  { label: 'Secondary Metros', val: 45, color: 'blue' },
                  { label: 'Global Network', val: 32, color: 'emerald' },
                  { label: 'Strategic Hubs', val: 18, color: 'amber' },
                  { label: 'Protocol Nodes', val: 5, color: 'slate' },
               ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-900 tracking-tight">{item.label}</span>
                        <span className="text-[10px] font-black text-slate-400">{item.val}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${item.val}%` }}
                           transition={{ delay: 0.5 + idx * 0.1 }}
                           className={`h-full bg-${item.color}-500`}
                        />
                     </div>
                  </div>
               ))}
            </div>
            
            <div className="bg-slate-900 p-4 rounded-sm flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Activity size={16} className="text-emerald-400" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">Global Synchronization Successful</span>
               </div>
               <ChevronRight size={14} className="text-slate-500" />
            </div>
         </div>
      </div>
    </div>
  );
}
