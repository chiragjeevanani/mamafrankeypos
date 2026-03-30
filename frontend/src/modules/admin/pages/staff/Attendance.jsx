
import React, { useState } from 'react';
import { Clock, CheckCircle, Search, Filter, Calendar, MapPin, Monitor, LogIn, LogOut, Edit2, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';

export default function Attendance() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [records, setRecords] = useState([
    { id: 1, name: 'Ananya Mishra', status: 'In', checkIn: '09:00 AM', checkOut: '--', terminal: 'KDS-01' },
    { id: 2, name: 'Rahul Khanna', status: 'In', checkIn: '10:15 AM', checkOut: '--', terminal: 'POS-02' },
    { id: 3, name: 'Priya Verma', status: 'Out', checkIn: '08:00 AM', checkOut: '04:00 PM', terminal: 'POS-01' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    checkIn: '',
    checkOut: '--',
    terminal: 'POS-01',
    status: 'In'
  });

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData(record);
    } else {
      setEditingRecord(null);
      setFormData({ name: '', checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), checkOut: '--', terminal: 'POS-01', status: 'In' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingRecord) {
      setRecords(records.map(r => r.id === editingRecord.id ? { ...formData, id: r.id } : r));
    } else {
      setRecords([...records, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id) => {
    setRecords(records.map(r => {
      if (r.id === id) {
        const isCurrentlyIn = r.status === 'In';
        return {
          ...r,
          status: isCurrentlyIn ? 'Out' : 'In',
          checkOut: isCurrentlyIn ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
          checkIn: !isCurrentlyIn ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : r.checkIn
        };
      }
      return r;
    }));
  };

  const filteredRecords = records.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 underline decoration-transparent">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase underline decoration-transparent">Attendance Pulse</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 underline decoration-transparent">Personnel Shift Synchronization</p>
        </div>
        <div className="flex items-center gap-3 underline decoration-transparent">
          <div className="h-10 px-4 bg-emerald-50 text-emerald-600 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100 underline decoration-transparent shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping underline decoration-transparent" />
            {records.filter(r => r.status === 'In').length} UNITS ACTIVE
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none"
          >
            <LogIn size={14} />
            Manual Override
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-4 flex flex-col md:flex-row gap-4 underline decoration-transparent shadow-sm">
        <div className="relative flex-1 group underline decoration-transparent">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="FILTER ACTIVE PERSONNEL..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none underline decoration-transparent underline decoration-transparent shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm overflow-hidden underline decoration-transparent overflow-x-auto shadow-sm underline decoration-transparent">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Personnel</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Check-In Signal</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Check-Out Signal</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Terminal Node</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50/50 transition-colors underline decoration-transparent group">
                <td className="px-6 py-4">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-tight underline decoration-transparent">{record.name}</span>
                </td>
                <td className="px-6 py-4 underline decoration-transparent">
                  <div className="flex items-center gap-2 text-slate-600 underline decoration-transparent">
                    <Clock size={12} className="text-blue-500" />
                    <span className="text-xs font-bold tracking-tighter underline decoration-transparent">{record.checkIn}</span>
                  </div>
                </td>
                <td className="px-6 py-4 underline decoration-transparent">
                  <span className={`text-xs font-bold tracking-tighter ${record.checkOut === '--' ? 'text-slate-300' : 'text-slate-600'} underline decoration-transparent`}>{record.checkOut}</span>
                </td>
                <td className="px-6 py-4 underline decoration-transparent">
                  <div className="flex items-center gap-2 text-slate-500 underline decoration-transparent">
                    <Monitor size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest underline decoration-transparent underline decoration-transparent">{record.terminal}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right underline decoration-transparent">
                  <div className="flex items-center justify-end gap-3 underline decoration-transparent">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all underline decoration-transparent">
                      <button 
                        onClick={() => handleToggleStatus(record.id)}
                        className={`p-1.5 rounded-sm transition-all outline-none ${record.status === 'In' ? 'hover:bg-red-50 text-slate-400 hover:text-red-600' : 'hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'} underline decoration-transparent`}
                      >
                        {record.status === 'In' ? <LogOut size={14} /> : <LogIn size={14} />}
                      </button>
                      <button 
                        onClick={() => handleOpenModal(record)}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-sm transition-all outline-none"
                      ><Edit2 size={14} /></button>
                    </div>
                    <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest ${record.status === 'In' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'} underline decoration-transparent underline decoration-transparent`}>
                      {record.status === 'In' ? 'Active Shift' : 'Shift End'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? 'Override Attendance Audit' : 'Personnel Manual Inbound'}
        subtitle="Shift Synchronization & Node Assignment"
        onSubmit={handleSave}
      >
        <div className="space-y-4 underline decoration-transparent">
          <div className="space-y-2 underline decoration-transparent">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel Designation</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. ANANYA MISHRA"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 underline decoration-transparent">
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Trigger</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold tracking-tighter uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.checkIn}
                onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                placeholder="--:-- --"
              />
            </div>
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terminal Assignment</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.terminal}
                onChange={(e) => setFormData({...formData, terminal: e.target.value})}
              >
                <option value="POS-01">POS Terminal 01</option>
                <option value="POS-02">POS Terminal 02</option>
                <option value="KDS-01">KDS Node Alpha</option>
                <option value="KDS-02">KDS Node Beta</option>
              </select>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
