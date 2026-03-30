
import React, { useState } from 'react';
import { Users, Plus, Search, Filter, Shield, MoreVertical, Edit2, Trash2, Key, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';

export default function StaffList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [staff, setStaff] = useState([
    { id: 1, name: 'Ananya Mishra', role: 'Head Chef', access: 'Elevated', status: 'On-Duty', email: 'ananya@rms.com' },
    { id: 2, name: 'Rahul Khanna', role: 'Floor Manager', access: 'Standard', status: 'On-Duty', email: 'rahul@rms.com' },
    { id: 3, name: 'Siddharth Roy', role: 'System Admin', access: 'Root', status: 'Off-Duty', email: 'sid@rms.com' },
    { id: 4, name: 'Priya Verma', role: 'Cashier', access: 'Restricted', status: 'On-Duty', email: 'priya@rms.com' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Floor Manager',
    access: 'Standard',
    status: 'On-Duty'
  });

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingStaff(member);
      setFormData(member);
    } else {
      setEditingStaff(null);
      setFormData({ name: '', email: '', role: 'Floor Manager', access: 'Standard', status: 'On-Duty' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingStaff) {
      setStaff(staff.map(s => s.id === editingStaff.id ? { ...formData, id: s.id } : s));
    } else {
      setStaff([...staff, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('PROTOCOL: Proceed with personnel termination record?')) {
      setStaff(staff.filter(s => s.id !== id));
    }
  };

  const filteredStaff = staff.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.role.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 underline decoration-transparent">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Personnel Registry</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 underline decoration-transparent">Operational Force & Access Design</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all outline-none"
        >
          <Plus size={14} />
          Enroll New Staff
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-4 flex flex-col md:flex-row gap-4 underline decoration-transparent shadow-sm">
        <div className="relative flex-1 group underline decoration-transparent">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="FILTER PERSONNEL..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none underline decoration-transparent underline decoration-transparent shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="h-10 px-4 border border-slate-100 text-slate-500 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all outline-none">
          <Filter size={14} />
          Protocol Selection
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm overflow-hidden underline decoration-transparent overflow-x-auto shadow-sm underline decoration-transparent">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Identity</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Role Designation</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Access Tier</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Unit Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStaff.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50 transition-colors underline decoration-transparent group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 underline decoration-transparent">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black underline decoration-transparent">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex flex-col underline decoration-transparent">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-tight underline decoration-transparent">{member.name}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 underline decoration-transparent">{member.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 underline decoration-transparent">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest underline decoration-transparent underline decoration-transparent">{member.role}</span>
                </td>
                <td className="px-6 py-4 underline decoration-transparent">
                  <div className="flex items-center gap-2 underline decoration-transparent text-blue-600">
                    <Key size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest underline decoration-transparent">{member.access}</span>
                  </div>
                </td>
                <td className="px-6 py-4 underline decoration-transparent">
                  <div className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest ${member.status === 'On-Duty' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'} underline decoration-transparent`}>
                    <div className={`w-1 h-1 rounded-full ${member.status === 'On-Duty' ? 'bg-emerald-500' : 'bg-slate-400'} underline decoration-transparent`} />
                    {member.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-right underline decoration-transparent">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all underline decoration-transparent">
                    <button 
                      onClick={() => handleOpenModal(member)}
                      className="p-2 text-slate-400 hover:text-slate-900 transition-colors outline-none"
                    ><Edit2 size={14} /></button>
                    <button 
                      onClick={() => handleDelete(member.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors outline-none"
                    ><Trash2 size={14} /></button>
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
        title={editingStaff ? 'Update Personnel Record' : 'Enroll Personnel Unit'}
        subtitle="Access Protocol & Operational Designation"
        onSubmit={handleSave}
      >
        <div className="space-y-4 underline decoration-transparent">
          <div className="grid grid-cols-2 gap-4 underline decoration-transparent">
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Designation</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Identity</label>
              <input 
                type="email" 
                required
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@rms.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 underline decoration-transparent">
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Role</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="Head Chef">Head Chef</option>
                <option value="Floor Manager">Floor Manager</option>
                <option value="System Admin">System Admin</option>
                <option value="Cashier">Cashier</option>
                <option value="Server">Server</option>
              </select>
            </div>
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Tier Protocol</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.access}
                onChange={(e) => setFormData({...formData, access: e.target.value})}
              >
                <option value="Restricted">Restricted Access</option>
                <option value="Standard">Standard Protocol</option>
                <option value="Elevated">Elevated Clearance</option>
                <option value="Root">Full System Root</option>
              </select>
            </div>
          </div>
          <div className="space-y-2 underline decoration-transparent">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Status</label>
            <div className="flex gap-2 underline decoration-transparent">
              {['On-Duty', 'Off-Duty'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData({...formData, status})}
                  className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-sm border transition-all ${
                    formData.status === status 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                  } underline decoration-transparent`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
