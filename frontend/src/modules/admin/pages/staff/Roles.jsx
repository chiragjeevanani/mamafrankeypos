
import React, { useState } from 'react';
import { Shield, Plus, Search, Filter, Lock, Unlock, CheckSquare, Edit2, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';

export default function Roles() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [roles, setRoles] = useState([
    { id: 1, name: 'Root Administrator', permissions: 'Full Access', users: 2, level: 'Level-1' },
    { id: 2, name: 'Floor Supervisor', permissions: 'Operations + Auth', users: 4, level: 'Level-2' },
    { id: 3, name: 'Kitchen Coordinator', permissions: 'KDS + Inventory', users: 5, level: 'Level-3' },
    { id: 4, name: 'Service Staff', permissions: 'Order Entry Only', users: 12, level: 'Level-4' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    permissions: '',
    level: 'Level-4'
  });

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({ name: role.name, permissions: role.permissions, level: role.level });
    } else {
      setEditingRole(null);
      setFormData({ name: '', permissions: '', level: 'Level-4' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...formData } : r));
    } else {
      setRoles([...roles, { ...formData, id: Date.now(), users: 0 }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('PROTOCOL: Proceed with security matrix deletion?')) {
      setRoles(roles.filter(r => r.id !== id));
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between underline decoration-transparent">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase underline decoration-transparent">Security Matrices</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 underline decoration-transparent">Permission Architectures & Shield Logic</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none"
        >
          <Plus size={14} />
          Define New Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 underline decoration-transparent">
        {roles.map((role) => (
          <div key={role.id} className="bg-white border border-slate-100 rounded-sm p-6 hover:border-slate-300 transition-all group overflow-hidden relative shadow-sm underline decoration-transparent">
            <div className="absolute top-0 right-0 p-3 flex gap-1 underline decoration-transparent">
              <button 
                onClick={() => handleOpenModal(role)}
                className="p-1 hover:bg-slate-50 text-slate-300 hover:text-slate-900 rounded-sm transition-all outline-none"
              ><Edit2 size={12} /></button>
              <button 
                onClick={() => handleDelete(role.id)}
                className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-sm transition-all outline-none"
              ><Trash2 size={12} /></button>
            </div>
            
            <div className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-2 px-2 py-0.5 bg-blue-50 inline-block rounded-sm underline decoration-transparent">{role.level}</div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4 underline decoration-transparent">{role.name}</h4>
            
            <div className="space-y-4 mb-6 underline decoration-transparent">
              <div className="flex items-center gap-2 underline decoration-transparent">
                <Lock size={12} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none underline decoration-transparent">{role.permissions}</span>
              </div>
              <div className="flex items-center gap-2 underline decoration-transparent">
                <CheckSquare size={12} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none underline decoration-transparent">{role.users} Active Users</span>
              </div>
            </div>

            <button 
              onClick={() => handleOpenModal(role)}
              className="w-full py-2 bg-slate-50 text-slate-900 text-[8px] font-black uppercase tracking-widest rounded-sm hover:bg-slate-900 hover:text-white transition-all outline-none"
            >
              Modify Permissions
            </button>
          </div>
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? 'Modify Security Matrix' : 'Define New Permission Layer'}
        subtitle="Access Protocol & Authorization Shield"
        onSubmit={handleSave}
      >
        <div className="space-y-4 underline decoration-transparent">
          <div className="space-y-2 underline decoration-transparent">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Designation</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. FLOOR SUPERVISOR"
            />
          </div>
          <div className="space-y-2 underline decoration-transparent">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permission Scope Summary</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.permissions}
              onChange={(e) => setFormData({...formData, permissions: e.target.value})}
              placeholder="e.g. Operations + Authorization"
            />
          </div>
          <div className="space-y-2 underline decoration-transparent">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Level Protocol</label>
            <select 
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.level}
              onChange={(e) => setFormData({...formData, level: e.target.value})}
            >
              <option value="Level-1">Level-1 (Root Access)</option>
              <option value="Level-2">Level-2 (Admin Ops)</option>
              <option value="Level-3">Level-3 (Dept Head)</option>
              <option value="Level-4">Level-4 (Service Node)</option>
            </select>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
