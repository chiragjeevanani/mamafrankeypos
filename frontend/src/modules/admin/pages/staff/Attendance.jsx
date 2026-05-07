import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Search, Filter, Calendar, MapPin, Monitor, LogIn, LogOut, Edit2, Trash2, Save, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../utils/api';
import { playClickSound } from '../../../pos/utils/sounds';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [formData, setFormData] = useState({
    staffName: '',
    checkIn: '',
    checkOut: '',
    terminal: 'POS-01',
    status: 'In'
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/staff/attendance');
      setRecords(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to sync attendance pulse');
      setLoading(false);
    }
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        staffName: record.staffName,
        checkIn: new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
        terminal: record.terminal,
        status: record.status
      });
    } else {
      setEditingRecord(null);
      setFormData({ 
        staffName: '', 
        checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        checkOut: '', 
        terminal: 'POS-Terminal', 
        status: 'In' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await api.put(`/staff/attendance/${editingRecord._id}`, formData);
        fetchAttendance();
      }
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to commit shift override');
    }
  };

  const filteredRecords = records.filter(r => r.staffName.toLowerCase().includes(searchQuery.toLowerCase()));

  const formatTime = (dateStr) => {
    if (!dateStr || dateStr === '--') return '--';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar max-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 underline decoration-transparent">
        <div>
          <h1 className="text-2xl font-black text-stone-800 tracking-tight uppercase">Attendance Pulse</h1>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mt-1">Real-Time Personnel Shift Synchronization</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 px-4 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            {records.filter(r => r.status === 'In').length} UNITS ACTIVE
          </div>
          <button 
            onClick={() => { playClickSound(); fetchAttendance(); }}
            className="h-10 w-10 bg-white border border-stone-200 text-stone-600 rounded-xl flex items-center justify-center shadow-sm hover:bg-stone-50 active:scale-95 transition-all"
          >
            <Clock size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#E1261C] transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="FILTER ACTIVE PERSONNEL..."
            className="w-full bg-stone-50 border-stone-100 rounded-xl py-3 pl-12 pr-4 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#E1261C]/10 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-[11px] font-bold uppercase tracking-wider">
           <AlertCircle size={16} />
           {error}
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50/50 border-b border-stone-100">
              <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Personnel Node</th>
              <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Inbound Signal</th>
              <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Outbound Signal</th>
              <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Terminal Origin</th>
              <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Status Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-stone-100 border-t-[#E1261C] rounded-full animate-spin" />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Syncing Shift Nodes...</span>
                  </div>
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center">
                  <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">No active shift signals detected</span>
                </td>
              </tr>
            ) : filteredRecords.map((record) => (
              <tr key={record._id} className="hover:bg-stone-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black ${record.status === 'In' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-400'}`}>
                      {record.staffName.charAt(0)}
                    </div>
                    <span className="text-[12px] font-black text-stone-800 uppercase tracking-tight">{record.staffName}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2.5 text-stone-600">
                    <div className="p-1.5 bg-blue-50 rounded-md text-blue-500">
                      <Clock size={12} />
                    </div>
                    <span className="text-[11px] font-black tracking-tight">{formatTime(record.checkIn)}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`text-[11px] font-black tracking-tight ${record.checkOut ? 'text-stone-600' : 'text-stone-300'}`}>
                    {record.checkOut ? formatTime(record.checkOut) : '--:-- --'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-stone-500">
                    <Monitor size={14} className="text-stone-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{record.terminal}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => { playClickSound(); handleOpenModal(record); }}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-stone-100 text-stone-400 hover:text-stone-900 rounded-lg transition-all border border-transparent hover:border-stone-200"
                    ><Edit2 size={14} /></button>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${record.status === 'In' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-stone-50 text-stone-400 border border-stone-100'}`}>
                      {record.status === 'In' ? 'Shift Active' : 'Shift Ended'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#2C2C2C]">
                   <div className="flex items-center gap-3 text-white">
                      <Clock size={16} className="text-[#E1261C]" />
                      <h3 className="text-[11px] font-black uppercase tracking-widest">Shift Override Protocol</h3>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="text-stone-500 hover:text-white transition-colors"><X size={18} /></button>
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Personnel Name</label>
                      <input 
                        type="text" 
                        readOnly
                        className="w-full bg-stone-50 border border-stone-200 p-4 text-[13px] font-black uppercase rounded-xl text-stone-400"
                        value={formData.staffName}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Check-In</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-stone-50 border border-stone-200 p-4 text-[13px] font-black uppercase rounded-xl outline-none focus:ring-2 focus:ring-[#E1261C]/10"
                          value={formData.checkIn}
                          onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Status</label>
                        <select 
                          className="w-full bg-stone-50 border border-stone-200 p-4 text-[13px] font-black uppercase rounded-xl outline-none focus:ring-2 focus:ring-[#E1261C]/10"
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                          <option value="In">Shift Active</option>
                          <option value="Out">Shift Ended</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3.5 bg-white border border-stone-200 text-stone-500 text-[11px] font-black uppercase tracking-widest rounded-xl hover:text-stone-800 transition-all"
                    >Abort</button>
                    <button 
                      type="submit"
                      className="flex-1 py-3.5 bg-[#E1261C] text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-stone-900/10 hover:bg-black transition-all"
                    >Commit Override</button>
                  </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
