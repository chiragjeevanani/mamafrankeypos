
import React, { useState } from 'react';
import { 
  Users, Search, Filter, Mail, 
  Phone, Star, ChevronRight, Gift,
  TrendingUp, Activity, Smartphone, Award,
  Plus, X, Save, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_CUSTOMERS = [
  { id: 1, name: 'Vikram Sethi', phone: '9876540001', visits: 12, rating: 4.8, type: 'VIP', lastVisit: '2 days ago' },
  { id: 2, name: 'Ananya Roy', phone: '9876540002', visits: 5, rating: 4.2, type: 'Regular', lastVisit: '1 week ago' },
  { id: 3, name: 'Kushal Taneja', phone: '9876540003', visits: 24, rating: 5.0, type: 'Platinum', lastVisit: 'Yesterday' },
  { id: 4, name: 'Sonal Mittal', phone: '9876540004', visits: 2, rating: 3.8, type: 'Guest', lastVisit: '1 month ago' },
];

export default function CustomerManagement() {
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'Regular'
  });

  const filteredCustomers = customers.filter(cust => 
    cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cust.phone.includes(searchQuery)
  );

  const handleSave = (e) => {
    e.preventDefault();
    const newCustomer = {
      ...formData,
      id: Date.now(),
      visits: 0,
      rating: 0.0,
      lastVisit: 'Just joined'
    };
    setCustomers([newCustomer, ...customers]);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar max-h-full">
       <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">CRM & Retention Center</h1>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Management of customer profiles, loyalty tiering, and feedback metrics</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => window.alert('LOYALTY PROTOCOL v2.4 initialized. Accessing configuration matrix...')}
             className="h-9 px-4 bg-white border border-slate-200 text-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"
           >
              <Gift size={14} />
              Loyalty Config
           </button>
        </div>
      </div>

      {/* Retention KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Registered Units</p>
            <h3 className="text-2xl font-black text-slate-900">{customers.length.toString().padStart(2, '0')} Units</h3>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Retention Protocol</p>
            <h3 className="text-2xl font-black text-slate-900 text-blue-500">62.4%</h3>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Star Rating</p>
            <div className="flex items-center gap-2 mt-1">
               <Star size={16} className="text-amber-400 fill-amber-400" />
               <h3 className="text-2xl font-black text-slate-900">4.7 / 5</h3>
            </div>
         </div>
         <div className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">NPS Protocol</p>
            <h3 className="text-2xl font-black text-slate-900">HIGH FLOW</h3>
         </div>
      </div>

      {/* Customer Registry */}
      <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden min-h-[400px]">
         <div className="p-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
               <div className="max-w-xs w-full relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name, phone or ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 py-1.5 pl-9 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-slate-900/10 placeholder:text-slate-300 rounded-sm" 
                  />
               </div>
            </div>
            <div className="flex items-center gap-3">
               <button className="h-8 px-3 text-slate-400 hover:text-slate-900 transition-colors text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Filter size={12} />
                  Tier Filter
               </button>
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="h-8 px-3 bg-slate-900 text-white rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all"
               >
                  <Plus size={12} />
                  Add Profile
               </button>
            </div>
         </div>

         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Customer Profile</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Tier Level</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap text-right">Order Velocity</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap text-center">Protocol Rating</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap text-right">Last Interaction</th>
                     <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap text-right">Ops</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredCustomers.map(cust => (
                     <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-400 uppercase">
                                 {cust.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[11px] font-black uppercase text-slate-900 tracking-tight">{cust.name}</span>
                                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{cust.phone}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center md:text-left">
                           <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest ${
                              cust.type === 'VIP' ? 'bg-amber-50 text-amber-600' :
                              cust.type === 'Platinum' ? 'bg-blue-50 text-blue-600' :
                              cust.type === 'Regular' ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 text-slate-300'
                           }`}>
                              {cust.type}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className="text-[11px] font-black text-slate-900">{cust.visits} Orders</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center justify-center gap-1">
                              <span className="text-[10px] font-black text-slate-900">{cust.rating}</span>
                              <Star size={10} className="text-amber-400 fill-amber-400" />
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                           <div className="flex items-center justify-end gap-2">
                              <Activity size={10} className="text-slate-300" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cust.lastVisit}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 text-slate-400 hover:text-blue-500 transition-all"><Mail size={12} /></button>
                              <ChevronRight size={14} className="text-slate-200" />
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Customer Modal */}
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
                        <Users size={16} />
                     </div>
                     <div>
                        <h3 className="text-[13px] font-black uppercase tracking-tight text-slate-900">Initialize Customer Profile</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">CRM Protocol v2.4.0</p>
                     </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={18} /></button>
               </div>

               <form onSubmit={handleSave} className="p-8 space-y-6">
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Identity Name</label>
                        <input 
                           type="text" 
                           required
                           className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           placeholder="FULL NAME"
                        />
                     </div>
                     
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Link Protocol</label>
                        <input 
                           type="text" 
                           required
                           className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={formData.phone}
                           onChange={(e) => setFormData({...formData, phone: e.target.value})}
                           placeholder="98765 XXXXX"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loyalty Tier Designation</label>
                        <select 
                           className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                           value={formData.type}
                           onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                           <option>Regular</option>
                           <option>VIP</option>
                           <option>Platinum</option>
                           <option>Guest</option>
                        </select>
                     </div>
                  </div>

                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-sm flex items-center gap-3">
                     <Award size={16} className="text-emerald-500" />
                     <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest leading-relaxed">
                        Notice: Profile initialization will sync with billing terminal and reward points history.
                     </p>
                  </div>

                  <div className="pt-6 flex items-center gap-3">
                     <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm"
                     >Abort</button>
                     <button 
                        type="submit"
                        className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                     >
                        <Save size={14} />
                        Create Profile
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
