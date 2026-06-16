import React, { useState, useEffect } from 'react';
import { Clock, Search, Monitor, Edit2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../utils/api';
import { playClickSound } from '../../../pos/utils/sounds';

const toLocalDatetimeString = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export default function Attendance() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [formData, setFormData] = useState({
    staffName: '',
    checkIn: '',
    checkOut: '',
    terminal: 'POS-01',
    status: 'In'
  });

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  const fetchAttendance = async (dateVal = selectedDate) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/staff/attendance?date=${dateVal}`);
      setRecords(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load attendance records');
      setLoading(false);
    }
  };

  const handleOpenModal = (record = null) => {
    setFormError('');
    if (record) {
      setEditingRecord(record);
      setFormData({
        staffName: record.staffName,
        checkIn: toLocalDatetimeString(record.checkIn),
        checkOut: record.checkOut ? toLocalDatetimeString(record.checkOut) : '',
        terminal: record.terminal,
        status: record.status
      });
    } else {
      setEditingRecord(null);
      setFormData({ 
        staffName: '', 
        checkIn: toLocalDatetimeString(new Date()), 
        checkOut: '', 
        terminal: 'POS-Terminal', 
        status: 'In' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setError('');

    if (!formData.checkIn) {
      setFormError('Check-in time is required.');
      return;
    }

    if (formData.checkOut && new Date(formData.checkOut) < new Date(formData.checkIn)) {
      setFormError('Check-out cannot be earlier than check-in.');
      return;
    }

    try {
      if (editingRecord) {
        await api.put(`/staff/attendance/${editingRecord._id}`, formData);
        await fetchAttendance(selectedDate);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save attendance updates');
    }
  };

  const filteredRecords = records.filter(r => r.staffName.toLowerCase().includes(searchQuery.toLowerCase()));

  const formatTime = (dateStr) => {
    if (!dateStr || dateStr === '--') return '--';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar max-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-800 tracking-tight uppercase">Staff Attendance</h1>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mt-1">Real-time shift log and status overrides</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 px-4 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            {records.filter(r => r.status === 'In').length} ACTIVE STAFF
          </div>
          <button 
            onClick={() => { playClickSound(); fetchAttendance(selectedDate); }}
            className="h-10 w-10 bg-white border border-stone-200 text-stone-600 rounded-xl flex items-center justify-center shadow-sm hover:bg-stone-50 active:scale-95 transition-all cursor-pointer animate-in"
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
            placeholder="Filter staff members..."
            className="w-full bg-stone-50 border-stone-100 rounded-xl py-3 pl-12 pr-4 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#E1261C]/10 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center">
          <input 
            type="date"
            className="bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#E1261C]/10 cursor-pointer"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
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
              <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Staff Member</th>
              <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Check-In Time</th>
              <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Check-Out Time</th>
              <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Terminal</th>
              <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-stone-100 border-t-[#E1261C] rounded-full animate-spin" />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Syncing Attendance Logs...</span>
                  </div>
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center">
                  <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">No attendance records found</span>
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
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-stone-100 text-stone-400 hover:text-stone-900 rounded-lg transition-all border border-transparent hover:border-stone-200 cursor-pointer"
                    ><Edit2 size={14} /></button>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${record.status === 'In' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-stone-50 text-stone-400 border border-stone-100'}`}>
                      {record.status === 'In' ? 'On Duty' : 'Off Duty'}
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
                      <h3 className="text-[11px] font-black uppercase tracking-widest">Edit Attendance Record</h3>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="text-stone-500 hover:text-white transition-colors cursor-pointer"><X size={18} /></button>
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-6">
                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3">
                      <AlertCircle size={16} className="text-rose-500" />
                      <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">{formError}</p>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Staff Name</label>
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
                          type="datetime-local" 
                          required
                          className="w-full bg-stone-50 border border-stone-200 p-4 text-[13px] font-black uppercase rounded-xl outline-none focus:ring-2 focus:ring-[#E1261C]/10"
                          value={formData.checkIn}
                          onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Status</label>
                        <select 
                          className="w-full bg-stone-50 border border-stone-200 p-4 text-[13px] font-black uppercase rounded-xl outline-none focus:ring-2 focus:ring-[#E1261C]/10 cursor-pointer"
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                          <option value="In">On Duty</option>
                          <option value="Out">Off Duty</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Check-Out</label>
                        <input
                          type="datetime-local"
                          className="w-full bg-stone-50 border border-stone-200 p-4 text-[13px] font-black uppercase rounded-xl outline-none focus:ring-2 focus:ring-[#E1261C]/10"
                          value={formData.checkOut}
                          onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Terminal</label>
                        <input
                          type="text"
                          className="w-full bg-stone-50 border border-stone-200 p-4 text-[13px] font-black uppercase rounded-xl outline-none focus:ring-2 focus:ring-[#E1261C]/10"
                          value={formData.terminal}
                          onChange={(e) => setFormData({...formData, terminal: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3.5 bg-white border border-stone-200 text-stone-500 text-[11px] font-black uppercase tracking-widest rounded-xl hover:text-stone-800 transition-all cursor-pointer"
                    >Cancel</button>
                    <button 
                      type="submit"
                      className="flex-1 py-3.5 bg-[#E1261C] text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-stone-900/10 hover:bg-black transition-all cursor-pointer"
                    >Save Changes</button>
                  </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
