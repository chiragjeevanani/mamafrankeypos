
import React, { useState } from 'react';
import { 
  History, Shield, Search, Filter, 
  ChevronRight, Download, Calendar,
  User, Database, Globe, AlertTriangle,
  Clock, Activity, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_AUDIT_LOGS = [
  { id: 'LOG-4401', event: 'Menu Update', user: 'Anita Verma', role: 'Admin', module: 'Catalog', time: '10:15 AM', status: 'success', ip: '192.168.1.45' },
  { id: 'LOG-4402', event: 'Staff Suspension', user: 'Rahul Sharma', role: 'Admin', module: 'People', time: '11:20 AM', status: 'critical', ip: '192.168.1.12' },
  { id: 'LOG-4403', event: 'Login Attempt', user: 'Suresh Kumar', role: 'Cashier', module: 'Auth', time: '12:05 PM', status: 'success', ip: '192.168.1.33' },
  { id: 'LOG-4404', event: 'Price Modification', user: 'Anita Verma', role: 'Admin', module: 'Catalog', time: '01:30 PM', status: 'warning', ip: '192.168.1.45' },
  { id: 'LOG-4405', event: 'Fiscal Reset', user: 'System Protocol', role: 'Kernel', module: 'Finance', time: '02:00 PM', status: 'success', ip: '::1' },
];

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState(MOCK_AUDIT_LOGS);

  const filteredLogs = logs.filter(log => 
    log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.ip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    window.alert('SECURITY PROTOCOL: Validating admin credentials for immutable log export...');
    setTimeout(() => {
       window.alert('PROTOCOL SUCCESS: AUDIT_LOG_EXPORT_v2.csv generated and encrypted.');
    }, 1000);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar max-h-full">
       {/* Security Header */}
       <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Shield size={16} className="text-slate-900" />
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Audit & Protocol Logs</h1>
           </div>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Immutable registry of all system interactions and terminal events</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleExport}
             className="h-9 px-4 bg-white border border-slate-200 text-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"
           >
              <Download size={14} />
              Export Protocol
           </button>
        </div>
      </div>

      {/* Registry Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Events recorded</p>
            <h3 className="text-2xl font-black text-slate-900">12,482</h3>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm border-l-orange-500 border-l-2">
            <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">Critical Exceptions</p>
            <h3 className="text-2xl font-black text-slate-900">03 Events</h3>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Indexing Status</p>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <h3 className="text-sm font-black text-slate-900 uppercase">Real-time</h3>
            </div>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Retention Policy</p>
            <h3 className="text-sm font-black text-slate-900 uppercase">365 Days</h3>
         </div>
      </div>

      {/* Protocol List */}
      <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden min-h-[400px]">
         <div className="p-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
               <div className="max-w-xs w-full relative text-slate-400">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search event, user or IP..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 py-2 pl-10 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-slate-900/10 placeholder:text-slate-300 rounded-sm" 
                  />
               </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-sm">
               <Calendar size={12} className="text-slate-400" />
               <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Live View</span>
            </div>
         </div>

         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Timestamp</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Actor Protocol</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Event Interaction</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Module Unit</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Status</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap text-right">Reference IP</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map(log => (
                     <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <Clock size={12} className="text-slate-300" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.time}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                              <span className="text-[11px] font-black uppercase text-slate-900 tracking-tight">{log.user}</span>
                              <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">{log.role}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[11px] font-bold uppercase text-slate-500">{log.event}</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <Database size={10} className="text-slate-300" />
                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{log.module}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
                              log.status === 'success' ? 'bg-emerald-50 text-emerald-600' :
                              log.status === 'critical' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                           }`}>
                              {log.status === 'critical' && <AlertTriangle size={10} />}
                              {log.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                               <Globe size={10} className="text-slate-300" />
                               <span className="text-[10px] font-bold text-slate-400">{log.ip}</span>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-center">
            <button className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2">
               Load Historical Archive
               <Activity size={10} />
            </button>
         </div>
      </div>
    </div>
  );
}
