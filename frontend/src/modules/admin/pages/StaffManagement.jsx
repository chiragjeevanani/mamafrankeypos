import React, { useState } from 'react';
import { 
  Users, UserPlus, Shield, ShieldCheck, 
  Search, Filter, MoreHorizontal, Edit3, 
  Trash2, Mail, Phone, MapPin, X, Save,
  AlertTriangle, Lock, Unlock, BadgeCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STAFF_USERS } from '../../staff/data/staffMockData';
import { playClickSound } from '../../pos/utils/sounds';

const INITIAL_STAFF = STAFF_USERS.map(u => ({
  id: u.id,
  name: u.name,
  role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
  email: u.email,
  status: u.status === 'online' ? 'On Duty' : 'Off Duty',
  phone: '98765' + Math.floor(Math.random() * 90000 + 10000)
}));

const MOCK_STAFF = [
  ...INITIAL_STAFF,
  { id: 101, name: 'Rahul Sharma', role: 'Kitchen Staff', email: 'rahul@rms.com', status: 'On Duty', phone: '9876543210' },
  { id: 102, name: 'Anita Verma', role: 'Manager', email: 'anita@rms.com', status: 'On Duty', phone: '9876543211' },
  { id: 103, name: 'Vikram Das', role: 'Chef', email: 'vikram@rms.com', status: 'On Duty', phone: '9876543214' },
];

export default function StaffManagement() {
  const [staff, setStaff] = useState(MOCK_STAFF);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Waiter',
    email: '',
    phone: '',
    status: 'On Duty'
  });

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData(member);
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        role: 'Waiter',
        email: '',
        phone: '',
        status: 'On Duty'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingMember) {
      setStaff(staff.map(s => s.id === editingMember.id ? { ...formData, id: s.id } : s));
    } else {
      setStaff([...staff, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this staff member record?')) {
      setStaff(staff.filter(s => s.id !== id));
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 overflow-y-auto no-scrollbar max-h-full">
       <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2.5 mb-1">
             <Users size={18} className="text-[#E1261C]" />
             <h1 className="text-xl font-black uppercase tracking-tight text-stone-800">Staff Management</h1>
           </div>
           <p className="text-xs text-stone-400 font-semibold">Manage your kitchen team, floor staff, and management access</p>
        </div>
         <div className="flex items-center gap-2">
            <button 
              onClick={playClickSound}
              className="h-10 px-4 bg-white text-stone-500 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:text-stone-800 transition-all border border-stone-200 shadow-sm"
            >Roles Setup</button>
            <button 
              onClick={() => { playClickSound(); handleOpenModal(); }}
              className="h-10 px-4 bg-[#E1261C] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-stone-900/10 active:scale-[0.98] transition-all"
            >
               <UserPlus size={14} />
               Add Member
            </button>
         </div>
      </div>

      {/* Staff Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-[#2C2C2C] p-5 rounded-2xl text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Shield size={48} />
            </div>
            <ShieldCheck size={22} className="text-amber-400 mb-3" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#999]">Access Gate</h3>
            <p className="text-lg font-black mt-1">SECURE</p>
            <p className="text-[9px] font-semibold text-[#666] uppercase mt-2">All terminals active</p>
         </div>
         <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-sm flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Total Staff</span>
            <div className="flex items-center gap-2 mt-1">
               <h3 className="text-2xl font-black text-stone-800">{staff.length}</h3>
               <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                 {staff.filter(s => s.status === 'On Duty').length} ACTIVE
               </span>
            </div>
         </div>
         <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-sm flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Active Units</span>
            <h3 className="text-xl font-black text-stone-800 mt-1">5 Depts</h3>
         </div>
         <div className="bg-white p-5 border border-stone-200 rounded-2xl shadow-sm flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Last Roster</span>
            <h3 className="text-xl font-black text-stone-800 mt-1">Updated Now</h3>
         </div>
      </div>

      {/* Staff Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
         {staff.map(member => (
            <div key={member.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:border-[#E1261C]/30 transition-all group relative">
               <div className="flex items-start justify-between mb-5">
                   <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-[#E1261C] font-black group-hover:bg-[#E1261C] group-hover:text-white transition-all shadow-inner border border-stone-200 group-hover:border-transparent">
                          {getInitials(member.name)}
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-stone-800 uppercase tracking-tight leading-none mb-1.5">{member.name}</h4>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-[#E1261C] uppercase tracking-wider bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-lg">{member.role}</span>
                             <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'On Duty' ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
                          </div>
                       </div>
                   </div>
                   <button className="text-stone-300 hover:text-stone-600 transition-colors p-1"><MoreHorizontal size={18} /></button>
               </div>

               <div className="space-y-3 bg-stone-50/50 p-4 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-3 text-stone-400">
                     <Mail size={12} className="shrink-0" />
                     <span className="text-[11px] font-semibold text-stone-600 truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-400">
                     <Phone size={12} className="shrink-0" />
                     <span className="text-[11px] font-semibold text-stone-600">+91 {member.phone}</span>
                  </div>
               </div>

                <div className="grid grid-cols-2 gap-2 mt-5">
                   <button 
                     onClick={() => { playClickSound(); handleOpenModal(member); }}
                     className="py-2.5 bg-stone-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                   >
                      <Edit3 size={12} />
                      Edit Profile
                   </button>
                   <button 
                     onClick={() => { playClickSound(); handleDelete(member.id); }}
                     className="py-2.5 bg-white text-stone-400 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-stone-200 hover:border-rose-100 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                   >
                      <Trash2 size={12} />
                      Terminate
                   </button>
                </div>
            </div>
         ))}
      </div>

      {/* Staff Modal */}
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
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden flex flex-col"
            >
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#2C2C2C]">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#E1261C] text-white rounded-lg flex items-center justify-center">
                         <Users size={16} />
                      </div>
                      <div>
                         <h3 className="text-[13px] font-black uppercase tracking-tight text-white">
                            {editingMember ? 'Update Staff Member' : 'New Staff Onboarding'}
                         </h3>
                         <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Staff Management Access</p>
                      </div>
                   </div>
                   <button onClick={() => { playClickSound(); setIsModalOpen(false); }} className="p-2 text-stone-500 hover:text-white transition-colors"><X size={18} /></button>
                </div>

               <form onSubmit={handleSave} className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                     <div className="space-y-1.5 col-span-2">
                        <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider ml-1">Full Name</label>
                        <input 
                           type="text" 
                           required
                           className="w-full bg-stone-50 border border-stone-200 px-4 py-2.5 text-[12px] font-bold text-stone-800 rounded-xl outline-none focus:ring-2 focus:ring-[#E1261C]/20 focus:border-[#E1261C] transition-all"
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           placeholder="Enter full name..."
                        />
                     </div>
                     
                     <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider ml-1">Role</label>
                        <select 
                           className="w-full bg-stone-50 border border-stone-200 px-3 py-2.5 text-[12px] font-bold text-stone-800 rounded-xl outline-none focus:ring-2 focus:ring-[#E1261C]/20 focus:border-[#E1261C] transition-all"
                           value={formData.role}
                           onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                           <option>Manager</option>
                           <option>Chef</option>
                           <option>Cashier</option>
                           <option>Kitchen Staff</option>
                           <option>Waiter</option>
                        </select>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider ml-1">Duty Status</label>
                        <select 
                           className="w-full bg-stone-50 border border-stone-200 px-3 py-2.5 text-[12px] font-bold text-stone-800 rounded-xl outline-none focus:ring-2 focus:ring-[#E1261C]/20 focus:border-[#E1261C] transition-all"
                           value={formData.status}
                           onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                           <option value="On Duty">Active Service</option>
                           <option value="Off Duty">On Leave / Off Duty</option>
                        </select>
                     </div>

                     <div className="space-y-1.5 col-span-2">
                        <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider ml-1">Email Address</label>
                        <input 
                           type="email" 
                           required
                           className="w-full bg-stone-50 border border-stone-200 px-4 py-2.5 text-[12px] font-bold text-stone-800 rounded-xl outline-none focus:ring-2 focus:ring-[#E1261C]/20 focus:border-[#E1261C] transition-all"
                           value={formData.email}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                           placeholder="staff@restaurant.com"
                        />
                     </div>

                     <div className="space-y-1.5 col-span-2">
                        <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider ml-1">Phone Number</label>
                        <input 
                           type="text" 
                           required
                           className="w-full bg-stone-50 border border-stone-200 px-4 py-2.5 text-[12px] font-bold text-stone-800 rounded-xl outline-none focus:ring-2 focus:ring-[#E1261C]/20 focus:border-[#E1261C] transition-all"
                           value={formData.phone}
                           onChange={(e) => setFormData({...formData, phone: e.target.value})}
                           placeholder="98765 00000"
                        />
                     </div>
                  </div>

                   <div className="pt-4 flex items-center gap-3">
                      <button 
                         type="button"
                         onClick={() => { playClickSound(); setIsModalOpen(false); }}
                         className="flex-1 py-3 bg-white border border-stone-200 text-stone-500 text-[11px] font-bold uppercase tracking-wider rounded-xl hover:text-stone-800 hover:bg-stone-50 transition-all shadow-sm active:scale-[0.98]"
                      >Cancel</button>
                      <button 
                         type="submit"
                         onClick={playClickSound}
                         className="flex-1 py-3 bg-[#E1261C] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl shadow-xl shadow-stone-900/15 flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:bg-[#4E342E]"
                      >
                         <Save size={14} />
                         {editingMember ? 'Update Staff Member' : 'Onboard Member'}
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
