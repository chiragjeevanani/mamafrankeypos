
import React, { useState } from 'react';
import { 
  Store, MapPin, TrendingUp, Users, 
  ChevronRight, Plus, Search, Filter,
  Building2, Globe, Clock, Star, X, Save,
  AlertCircle, ShieldAlert, Edit3, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_OUTLETS = [
  { id: 1, name: 'Time to eat Primary - Main Hall', location: 'Indiranagar, Bangalore', manager: 'Anita Verma', staff: 12, revenue: '₹4.2L', rating: 4.8, status: 'active' },
  { id: 2, name: 'Time to eat Express - Food Court', location: 'Phoenix Mall, Bangalore', manager: 'Suresh Kumar', staff: 6, revenue: '₹2.1L', rating: 4.5, status: 'active' },
  { id: 3, name: 'Time to eat Cloud - Kitchen 01', location: 'HSR Layout, Bangalore', manager: 'Vikram Das', staff: 8, revenue: '₹3.8L', rating: 4.2, status: 'busy' },
  { id: 4, name: 'Time to eat Heritage - Flagship', location: 'Jayanagar, Bangalore', manager: 'Rahul Sharma', staff: 20, revenue: '₹6.4L', rating: 4.9, status: 'maintenance' },
];

export default function OutletManagement() {
  const [outlets, setOutlets] = useState(MOCK_OUTLETS);
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    manager: '',
    status: 'active'
  });

  const handleOpenModal = (outlet = null) => {
    if (outlet) {
      setEditingOutlet(outlet);
      setFormData(outlet);
    } else {
      setEditingOutlet(null);
      setFormData({
        name: '',
        location: '',
        manager: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingOutlet) {
      setOutlets(outlets.map(o => o.id === editingOutlet.id ? { ...formData, id: o.id } : o));
    } else {
      const newOutlet = {
        ...formData,
        id: Date.now(),
        staff: 0,
        revenue: '₹0.0L',
        rating: 0.0
      };
      setOutlets([...outlets, newOutlet]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('SECURITY PROTOCOL: Decommission this network node? This action is irreversible and will revoke all local access credentials.')) {
      setOutlets(outlets.filter(o => o.id !== id));
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar max-h-full">
       <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Enterprise Network Control</h1>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Global management of all restaurant branches and outlets</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="h-9 px-4 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
        >
           <Plus size={14} />
           Register New Outlet
        </button>
      </div>

      {/* Global Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Outlets</p>
            <h3 className="text-2xl font-black text-slate-900">{outlets.length} UNITS</h3>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Combined Crew</p>
            <h3 className="text-2xl font-black text-slate-900">
               {outlets.reduce((acc, curr) => acc + (typeof curr.staff === 'number' ? curr.staff : 0), 0)} STAFF
            </h3>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Status</p>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <h3 className="text-sm font-black text-slate-900 uppercase">Synchronized</h3>
            </div>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Network Capacity</p>
            <h3 className="text-2xl font-black text-slate-900">OPTIMAL</h3>
         </div>
      </div>

      {/* Outlet Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {outlets.map(outlet => (
            <div key={outlet.id} className="bg-white border border-slate-100 rounded-sm shadow-sm hover:border-slate-300 transition-all p-8 flex flex-col group relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110 ${
                  outlet.status === 'active' ? 'bg-emerald-500' : 
                  outlet.status === 'busy' ? 'bg-amber-500' : 'bg-rose-500'
               }`} />
               
               <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                        <Building2 size={24} />
                     </div>
                     <div>
                        <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-tight">{outlet.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <MapPin size={10} className="text-slate-400" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{outlet.location}</span>
                        </div>
                     </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest ${
                     outlet.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 
                     outlet.status === 'busy' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                     {outlet.status}
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-4 border-y border-slate-50 py-6 mb-8">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">MTD Revenue</span>
                     <span className="text-[13px] font-black text-slate-900 leading-none">{outlet.revenue || '₹0.0L'}</span>
                  </div>
                  <div className="flex flex-col border-x border-slate-50 px-4">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Personnel</span>
                     <span className="text-[13px] font-black text-slate-900 leading-none">{outlet.staff || 0} Crew</span>
                  </div>
                  <div className="flex flex-col pl-4">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating</span>
                     <div className="flex items-center gap-1.5">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-[13px] font-black text-slate-900 leading-none">{outlet.rating || 0.0}</span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black">
                        {outlet.manager?.charAt(0) || '?'}
                     </div>
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mgr: {outlet.manager}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <button 
                       onClick={() => handleOpenModal(outlet)}
                       className="p-2 text-slate-300 hover:text-slate-900 transition-colors bg-slate-50 rounded-sm border border-slate-100"
                     >
                       <Edit3 size={14} />
                     </button>
                     <button 
                       onClick={() => handleDelete(outlet.id)}
                       className="p-2 text-slate-300 hover:text-rose-600 transition-colors bg-slate-50 rounded-sm border border-slate-100"
                     >
                       <Trash2 size={14} />
                     </button>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Outlet Registration Modal */}
       <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-sm shadow-2xl relative overflow-hidden flex flex-col"
            >
               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-slate-900 text-white rounded-sm flex items-center justify-center">
                        <Store size={16} />
                     </div>
                      <div>
                         <h3 className="text-[13px] font-black uppercase tracking-tight text-slate-900">
                           {editingOutlet ? 'Update Network Node' : 'Register New Network Node'}
                         </h3>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Enterprise Protocol v2.4.0</p>
                      </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={18} /></button>
               </div>

               <form onSubmit={handleSave} className="p-8 space-y-6">
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outlet Name / Designation</label>
                        <input 
                           type="text" 
                           required
                           className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           placeholder="e.g. Time to eat METRO - TERMINAL A"
                        />
                     </div>
                     
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Geographical Mapping</label>
                        <input 
                           type="text" 
                           required
                           className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={formData.location}
                           onChange={(e) => setFormData({...formData, location: e.target.value})}
                           placeholder="e.g. MG ROAD, BANGALORE"
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Branch Manager</label>
                           <input 
                              type="text" 
                              required
                              className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                              value={formData.manager}
                              onChange={(e) => setFormData({...formData, manager: e.target.value})}
                              placeholder="MANAGER NAME"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Service Status</label>
                           <select 
                              className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                              value={formData.status}
                              onChange={(e) => setFormData({...formData, status: e.target.value})}
                           >
                              <option value="active">ACTIVE</option>
                              <option value="busy">BUSY / AT CAPACITY</option>
                              <option value="maintenance">MAINTENANCE</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-sm flex items-start gap-3">
                     <ShieldAlert size={14} className="text-amber-600 mt-0.5 shrink-0" />
                     <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed">
                        Security Notice: New outlet registration triggers global credential resets for assigned personnel and initializes billing ledger mapping.
                     </p>
                  </div>

                   <div className="pt-6 flex items-center gap-3">
                      <button 
                         type="button"
                         onClick={() => setIsModalOpen(false)}
                         className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm"
                      >Abort Registration</button>
                      <button 
                         type="submit"
                         className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                         <Save size={14} />
                         {editingOutlet ? 'Update Node' : 'Establish Node'}
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
