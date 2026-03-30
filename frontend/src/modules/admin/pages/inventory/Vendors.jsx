
import React, { useState } from 'react';
import { Truck, Plus, Search, Filter, Phone, Mail, Globe, Shield, Edit2, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminModal from '../../components/ui/AdminModal';

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  const [vendors, setVendors] = useState([
    { id: 1, name: 'Premium Grains Co.', contact: 'Rajesh Kumar', category: 'Dry Grocery', rating: 4.8, status: 'Active' },
    { id: 2, name: 'Ocean Fresh Seafood', contact: 'Sarah D\'Souza', category: 'Meat & Seafood', rating: 4.5, status: 'Active' },
    { id: 3, name: 'Valley Farm Dairy', contact: 'Amit Singh', category: 'Dairy Products', rating: 3.9, status: 'Review Needed' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    category: 'Dry Grocery',
    status: 'Active'
  });

  const handleOpenModal = (vendor = null) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData(vendor);
    } else {
      setEditingVendor(null);
      setFormData({ name: '', contact: '', category: 'Dry Grocery', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingVendor) {
      setVendors(vendors.map(v => v.id === editingVendor.id ? { ...v, ...formData } : v));
    } else {
      setVendors([...vendors, { ...formData, id: Date.now(), rating: 4.0 }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('PROTOCOL: Proceed with record termination?')) {
      setVendors(vendors.filter(v => v.id !== id));
    }
  };

  const filteredVendors = vendors.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between underline decoration-transparent">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Supply Chain</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 underline decoration-transparent">Supply Chain Protocol & Compliance</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all outline-none"
        >
          <Plus size={14} />
          Onboard Vendor
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-4 flex gap-4 underline decoration-transparent">
        <div className="relative flex-1 group underline decoration-transparent underline decoration-transparent">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="SEARCH ENROLLED VENDORS..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none underline decoration-transparent shadow-sm underline decoration-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 underline decoration-transparent">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="bg-white border border-slate-100 rounded-sm p-6 hover:shadow-2xl hover:border-slate-300 transition-all group overflow-hidden relative underline decoration-transparent">
            <div className="flex items-start justify-between mb-6 underline decoration-transparent">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-sm flex items-center justify-center shadow-lg shadow-slate-900/10 underline decoration-transparent">
                <Truck size={24} />
              </div>
              <div className="flex flex-col items-end gap-2 underline decoration-transparent">
                <div className={`px-2 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest ${vendor.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} underline decoration-transparent`}>
                  {vendor.status}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all underline decoration-transparent">
                  <button 
                    onClick={() => handleOpenModal(vendor)}
                    className="p-1 px-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-sm text-[8px] font-black uppercase tracking-widest border border-slate-100 outline-none"
                  >Edit</button>
                  <button 
                    onClick={() => handleDelete(vendor.id)}
                    className="p-1 px-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-sm text-[8px] font-black uppercase tracking-widest border border-slate-100 outline-none"
                  >Delete</button>
                </div>
              </div>
            </div>
            
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{vendor.name}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 underline decoration-transparent">{vendor.category}</p>
            
            <div className="space-y-3 mb-6 border-t border-slate-50 pt-4 underline decoration-transparent">
              <div className="flex items-center gap-3 text-slate-500 underline decoration-transparent">
                <Shield size={14} className="text-slate-900" />
                <span className="text-[10px] font-black uppercase tracking-widest underline decoration-transparent">{vendor.contact}</span>
              </div>
              <div className="flex gap-4 underline decoration-transparent">
                <button className="flex-1 h-9 bg-slate-50 text-slate-900 rounded-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors outline-none">
                  <Phone size={12} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Call</span>
                </button>
                <button className="flex-1 h-9 bg-slate-50 text-slate-900 rounded-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors outline-none">
                  <Mail size={12} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Mail</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-4 underline decoration-transparent">
              <div className="flex items-center gap-1 underline decoration-transparent">
                {[1,2,3,4,5].map((s) => (
                  <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= vendor.rating ? 'bg-blue-600' : 'bg-slate-100'} underline decoration-transparent`} />
                ))}
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none underline decoration-transparent">View Contracts</span>
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendor ? 'Update Vendor Entity' : 'Vendor Onboarding Protocol'}
        subtitle="Supply Chain Integrity & Procurement Registry"
        onSubmit={handleSave}
      >
        <div className="space-y-4 underline decoration-transparent">
          <div className="space-y-2 underline decoration-transparent">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Designation</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. PREMIUM GRAINS CO."
            />
          </div>
          <div className="space-y-2 underline decoration-transparent">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Contact Person</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
              value={formData.contact}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
              placeholder="Full Name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 underline decoration-transparent">
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Category</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Dry Grocery">Dry Grocery</option>
                <option value="Meat & Seafood">Meat & Seafood</option>
                <option value="Dairy Products">Dairy Products</option>
                <option value="Produce">Fresh Produce</option>
              </select>
            </div>
            <div className="space-y-2 underline decoration-transparent">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Status</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Active">Operational</option>
                <option value="Review Needed">Audit Pending</option>
                <option value="Inactive">Blacklisted</option>
              </select>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
