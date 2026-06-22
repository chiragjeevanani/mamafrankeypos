import React, { useState } from 'react';
import { 
  History, Shield, Search, Filter, 
  ChevronRight, Download, Calendar,
  User, Database, Globe, AlertTriangle,
  Clock, Activity, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../utils/api';
import { playClickSound } from '../../pos/utils/sounds';
import { exportToCSV } from '../../../utils/csvExport';

export default function AuditLogs() {
  const today = new Date().toISOString().split('T')[0];
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalEvents: 0, criticalExceptions: 0 });
  
  // Advanced Filters
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    moduleName: 'ALL'
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('startDate', filters.startDate);
      params.append('endDate', filters.endDate);
      if (filters.moduleName !== 'ALL') {
        params.append('moduleName', filters.moduleName);
      }

      const [logsRes, summaryRes] = await Promise.all([
        api.get(`/audit?${params.toString()}`),
        api.get('/audit/summary')
      ]);
      
      setLogs(logsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLogs();
  }, [filters]);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.staff?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.ipAddress || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.details || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    if (logs.length === 0) {
      alert("No logs available to export.");
      return;
    }

    // Define CSV Headers
    const headers = ["Timestamp", "Actor", "Role", "Action", "Module", "Details", "IP Address"];
    
    // Map logs to CSV rows
    const csvRows = filteredLogs.map(log => [
      new Date(log.createdAt).toLocaleString(),
      log.staff?.name || 'SYSTEM',
      log.staff?.role || 'KERNEL',
      log.action,
      log.module,
      log.details || '',
      log.ipAddress || '::1'
    ]);

    exportToCSV([headers, ...csvRows], `MamaFrankey_AuditLog_${new Date().toISOString().split('T')[0]}.csv`);
    
    playClickSound();
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar max-h-full">
       {/* Security Header */}
       <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Shield size={16} className="text-slate-900" />
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Activity Logs</h1>
           </div>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Permanent history of all system events and user actions</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleExport}
             className="h-9 px-4 bg-white border border-slate-200 text-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"
           >
              <Download size={14} />
              Export Logs
           </button>
        </div>
      </div>

      {/* Registry Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Events recorded</p>
            <h3 className="text-2xl font-black text-slate-900">{summary.totalEvents}</h3>
         </div>
         <div className={`bg-white p-6 border border-slate-100 rounded-sm shadow-sm border-l-2 ${summary.criticalExceptions > 0 ? 'border-l-rose-500 bg-rose-50/10' : 'border-l-orange-500'}`}>
            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${summary.criticalExceptions > 0 ? 'text-rose-600' : 'text-orange-500'}`}>Critical Exceptions</p>
            <h3 className={`text-2xl font-black ${summary.criticalExceptions > 0 ? 'text-rose-700' : 'text-slate-900'}`}>{String(summary.criticalExceptions).padStart(2, '0')} Events</h3>
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
         <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
               <div className="max-w-xs w-full relative text-slate-400">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search action or user..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 py-2 pl-10 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-slate-900/10 placeholder:text-slate-300 rounded-sm" 
                  />
               </div>
               
               <div className="flex items-center gap-2">
                  <select 
                     value={filters.moduleName}
                     onChange={(e) => setFilters({...filters, moduleName: e.target.value})}
                     className="bg-slate-50 border border-slate-100 h-9 px-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                  >
                     <option value="ALL">All Modules</option>
                     <option value="AUTH">Authentication</option>
                     <option value="ORDERS">Orders</option>
                     <option value="MENU">Menu Management</option>
                     <option value="SYSTEM_SETTINGS">System Settings</option>
                     <option value="ATTENDANCE">Attendance</option>
                  </select>
               </div>

               <div className="flex items-center gap-2">
                  <input 
                     type="date" 
                     value={filters.startDate}
                     onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                     className="bg-slate-50 border border-slate-100 h-9 px-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                  />
                  <span className="text-[10px] font-black text-slate-400">TO</span>
                  <input 
                     type="date" 
                     value={filters.endDate}
                     onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                     className="bg-slate-50 border border-slate-100 h-9 px-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                  />
               </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-sm">
               {loading ? <Activity size={12} className="text-blue-500 animate-spin" /> : <Calendar size={12} className="text-slate-400" />}
               <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{loading ? 'Syncing...' : 'Live View'}</span>
            </div>
         </div>

         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Timestamp</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">User / Role</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Event Interaction</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Module Unit</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Status</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap text-right">Reference IP</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map(log => (
                     <tr key={log._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <Clock size={12} className="text-slate-300" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {new Date(log.createdAt).toLocaleTimeString()}
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                              <span className="text-[11px] font-black uppercase text-slate-900 tracking-tight">{log.staff?.name || 'SYSTEM'}</span>
                              <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">{log.staff?.role || 'KERNEL'}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[11px] font-bold uppercase text-slate-500">{log.action}</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <Database size={10} className="text-slate-300" />
                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{log.module}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600">
                              SUCCESS
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                               <Globe size={10} className="text-slate-300" />
                               <span className="text-[10px] font-bold text-slate-400">{log.ipAddress || '::1'}</span>
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
