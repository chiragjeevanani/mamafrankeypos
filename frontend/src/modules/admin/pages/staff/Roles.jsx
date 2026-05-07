import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Save, X, Settings, ShoppingCart, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../utils/api';
import { playClickSound } from '../../../pos/utils/sounds';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {
      canCreateOrder: true,
      canCancelOrder: false,
      canApplyDiscount: false,
      canSettleBill: true,
      canVoidKOT: false,
      canManageMenu: false,
      canManageStaff: false,
      canViewReports: false,
      canManageSettings: false,
      canManageTables: false,
    }
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/roles');
      setRoles(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch security matrices');
      setLoading(false);
    }
  };

  const handleOpenModal = (role = null) => {
    setFormError('');
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: {
          canCreateOrder: true,
          canCancelOrder: false,
          canApplyDiscount: false,
          canSettleBill: true,
          canVoidKOT: false,
          canManageMenu: false,
          canManageStaff: false,
          canViewReports: false,
          canManageSettings: false,
          canManageTables: false,
        }
      });
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (key) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setError('');

    if (!formData.name.trim()) {
      setFormError('Role name is required.');
      return;
    }

    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole._id}`, { ...formData, name: formData.name.trim() });
      } else {
        await api.post('/roles', { ...formData, name: formData.name.trim() });
      }
      await fetchRoles();
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save role');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('PROTOCOL: Proceed with security matrix deletion? This will impact all personnel assigned to this layer.')) {
      try {
        await api.delete(`/roles/${id}`);
        fetchRoles();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete role');
      }
    }
  };

  const permissionCategories = [
    {
      title: 'POS Operations',
      icon: ShoppingCart,
      perms: [
        { key: 'canCreateOrder', label: 'Create Orders/KOT' },
        { key: 'canCancelOrder', label: 'Cancel/Void Orders' },
        { key: 'canApplyDiscount', label: 'Apply Discounts' },
        { key: 'canSettleBill', label: 'Settle Bills' },
        { key: 'canVoidKOT', label: 'Void Printed KOT' },
      ]
    },
    {
      title: 'Admin Control',
      icon: Settings,
      perms: [
        { key: 'canManageMenu', label: 'Menu Management' },
        { key: 'canManageStaff', label: 'Staff & Security' },
        { key: 'canViewReports', label: 'Financial Reports' },
        { key: 'canManageSettings', label: 'System Settings' },
        { key: 'canManageTables', label: 'Table/Section Config' },
      ]
    }
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar max-h-full">
      <div className="flex items-center justify-between underline decoration-transparent">
        <div>
          <h1 className="text-2xl font-black text-stone-800 tracking-tight uppercase">Security Matrices</h1>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mt-1">Permission Architectures & Access Shields</p>
        </div>
        <button 
          onClick={() => { playClickSound(); handleOpenModal(); }}
          className="h-10 px-6 bg-[#E1261C] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-stone-900/10 active:scale-95 transition-all outline-none"
        >
          <Plus size={14} />
          Define New Role
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-[11px] font-bold uppercase tracking-wider">
           <Shield size={16} />
           {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
             <div className="w-8 h-8 border-4 border-stone-100 border-t-[#E1261C] rounded-full animate-spin" />
             <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Scanning Security Layers...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="col-span-full py-20 text-center text-stone-400 font-bold uppercase tracking-widest text-[10px]">
            No roles configured
          </div>
        ) : roles.map((role) => (
          <div key={role._id} className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-[#E1261C]/30 transition-all group overflow-hidden relative shadow-sm">
            <div className="absolute top-0 right-0 p-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={() => { playClickSound(); handleOpenModal(role); }}
                className="p-2 hover:bg-stone-50 text-stone-400 hover:text-stone-900 rounded-lg transition-all outline-none border border-transparent hover:border-stone-100"
              ><Edit2 size={14} /></button>
              {!role.isSystemRole && (
                <button 
                  onClick={() => { playClickSound(); handleDelete(role._id); }}
                  className="p-2 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition-all outline-none border border-transparent hover:border-rose-100"
                ><Trash2 size={14} /></button>
              )}
            </div>
            
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-[#E1261C]">
                  <Shield size={20} />
               </div>
               <div>
                  <h4 className="text-sm font-black text-stone-800 uppercase tracking-tight leading-none mb-1">{role.name}</h4>
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{role.isSystemRole ? 'System Integrity Layer' : 'Custom Defined Layer'}</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 mb-6">
               {Object.entries(role.permissions).slice(0, 4).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${val ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                     <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider truncate">
                        {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                     </span>
                  </div>
               ))}
               <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-[#E1261C] uppercase tracking-widest">+ {Object.values(role.permissions).filter(v => v).length - 4} More</span>
               </div>
            </div>

            <button 
              onClick={() => { playClickSound(); handleOpenModal(role); }}
              className="w-full py-2.5 bg-stone-50 text-stone-800 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-stone-900 hover:text-white transition-all outline-none border border-stone-100"
            >
              Modify Security Matrix
            </button>
          </div>
        ))}
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
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col"
            >
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#2C2C2C]">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#E1261C] text-white rounded-lg flex items-center justify-center">
                         <Shield size={16} />
                      </div>
                      <div>
                         <h3 className="text-[13px] font-black uppercase tracking-tight text-white">
                            {editingRole ? 'Configure Security Matrix' : 'Initialize New Access Layer'}
                         </h3>
                         <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Authorization Protocol v4.0</p>
                      </div>
                   </div>
                   <button onClick={() => { playClickSound(); setIsModalOpen(false); }} className="p-2 text-stone-500 hover:text-white transition-colors"><X size={18} /></button>
                </div>

                <form onSubmit={handleSave} className="flex flex-col h-[70vh]">
                  <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                    {formError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3">
                        <AlertCircle size={16} className="text-rose-500" />
                        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">{formError}</p>
                      </div>
                    )}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Role Designation</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-stone-50 border border-stone-200 p-4 text-[13px] font-black uppercase outline-none focus:ring-2 focus:ring-[#E1261C]/20 focus:border-[#E1261C] rounded-xl transition-all"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g. FLOOR SUPERVISOR"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Description</label>
                        <textarea
                          rows="3"
                          className="w-full bg-stone-50 border border-stone-200 p-4 text-[12px] font-bold rounded-xl outline-none focus:ring-2 focus:ring-[#E1261C]/20 focus:border-[#E1261C] transition-all"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Short summary of this role and when to use it"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       {permissionCategories.map((cat, idx) => (
                          <div key={idx} className="space-y-4">
                             <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                                <cat.icon size={14} className="text-[#E1261C]" />
                                <h5 className="text-[11px] font-black uppercase tracking-widest text-stone-800">{cat.title}</h5>
                             </div>
                             <div className="space-y-2.5">
                                {cat.perms.map(perm => (
                                   <div 
                                      key={perm.key} 
                                      onClick={() => { playClickSound(); handleTogglePermission(perm.key); }}
                                      className="flex items-center justify-between p-3 bg-stone-50 rounded-xl cursor-pointer hover:bg-stone-100 transition-all border border-transparent hover:border-stone-200 group"
                                   >
                                      <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">{perm.label}</span>
                                      <div className={`w-8 h-4 rounded-full transition-all relative ${formData.permissions[perm.key] ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                                         <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${formData.permissions[perm.key] ? 'left-4.5' : 'left-0.5'}`} />
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       ))}
                    </div>
                  </div>

                  <div className="p-6 border-t border-stone-100 bg-stone-50/50 flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => { playClickSound(); setIsModalOpen(false); }}
                      className="flex-1 py-3.5 bg-white border border-stone-200 text-stone-500 text-[11px] font-black uppercase tracking-widest rounded-xl hover:text-stone-800 transition-all shadow-sm"
                    >Abort Configuration</button>
                    <button 
                      type="submit"
                      onClick={playClickSound}
                      className="flex-1 py-3.5 bg-[#E1261C] text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-stone-900/15 flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-black"
                    >
                      <Save size={16} />
                      Commit Changes
                    </button>
                  </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
