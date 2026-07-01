import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Edit3, Trash2, X, Save, CheckCircle, 
  AlertCircle, Store, MapPin, Phone, Hash, Eye, EyeOff 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../utils/api';
import { useBranchContext } from '../../../context/BranchContext';

const EMPTY_FORM = {
  name: '',
  slug: '',
  address: '',
  phone: '',
  city: '',
  state: '',
  pincode: '',
  gstNumber: '',
  fssai: '',
  legalName: '',
};

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function BranchManagement() {
  const { branches, fetchBranches } = useBranchContext();
  const [allBranches, setAllBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadAll = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/branches/all');
      setAllBranches(data);
    } catch (err) {
      setError('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setError('');
    setModal('create');
  };

  const openEdit = (branch) => {
    setForm({
      name: branch.name || '',
      slug: branch.slug || '',
      address: branch.address || '',
      phone: branch.phone || '',
      city: branch.city || '',
      state: branch.state || '',
      pincode: branch.pincode || '',
      gstNumber: branch.gstNumber || '',
      fssai: branch.fssai || '',
      legalName: branch.legalName || '',
    });
    setEditing(branch);
    setError('');
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && !editing ? { slug: slugify(value) } : {})
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Branch name is required'); return; }
    if (!form.slug.trim()) { setError('Slug is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/branches/${editing._id}`, form);
        setSuccess('Branch updated successfully');
      } else {
        await api.post('/branches', form);
        setSuccess('Branch created successfully');
      }
      await loadAll();
      await fetchBranches();
      setTimeout(() => setSuccess(''), 3000);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save branch');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (branch) => {
    try {
      await api.put(`/branches/${branch._id}`, { isActive: !branch.isActive });
      await loadAll();
      await fetchBranches();
      setSuccess(`Branch "${branch.name}" ${!branch.isActive ? 'activated' : 'deactivated'}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update branch');
    }
  };

  const InputField = ({ label, name, placeholder, required, disabled }) => (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2.5 bg-stone-100 border border-stone-200 rounded-lg text-[12px] text-stone-800 font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-800 uppercase tracking-tight flex items-center gap-3">
            <Building2 size={24} className="text-[#E1261C]" />
            Branch Management
          </h1>
          <p className="text-[11px] text-stone-500 font-medium mt-1 uppercase tracking-wider">
            Manage all branches — create, edit, activate or deactivate
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E1261C] text-white text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-[#c01f17] transition-all shadow-md"
        >
          <Plus size={14} />
          New Branch
        </button>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-[11px] font-bold text-green-700">
            <CheckCircle size={14} /> {success}
          </motion.div>
        )}
        {error && !modal && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-[11px] font-bold text-red-700">
            <AlertCircle size={14} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Branches Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-[3px] border-[#E1261C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {allBranches.map(branch => (
            <motion.div
              key={branch._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${branch.isActive ? 'border-stone-200' : 'border-stone-200 opacity-60'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#E1261C]/10 rounded-lg flex items-center justify-center">
                    <Store size={15} className="text-[#E1261C]" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-black text-stone-800 uppercase tracking-tight">{branch.name}</h3>
                    <p className="text-[10px] text-stone-400 font-mono">/{branch.slug}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${branch.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {branch.address && (
                <p className="text-[11px] text-stone-500 flex items-start gap-1.5 mb-1">
                  <MapPin size={10} className="mt-0.5 shrink-0" />
                  {[branch.address, branch.city, branch.state, branch.pincode].filter(Boolean).join(', ')}
                </p>
              )}
              {branch.phone && (
                <p className="text-[11px] text-stone-500 flex items-center gap-1.5 mb-1">
                  <Phone size={10} className="shrink-0" />
                  {branch.phone}
                </p>
              )}
              {branch.gstNumber && (
                <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
                  <Hash size={10} className="shrink-0" />
                  GST: {branch.gstNumber}
                </p>
              )}

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100">
                <button onClick={() => openEdit(branch)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-all">
                  <Edit3 size={11} /> Edit
                </button>
                <button onClick={() => handleToggleActive(branch)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all
                    ${branch.isActive ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-green-700 bg-green-50 hover:bg-green-100'}`}>
                  {branch.isActive ? <><EyeOff size={11} /> Deactivate</> : <><Eye size={11} /> Activate</>}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="text-[14px] font-black text-stone-800 uppercase tracking-tight">
                    {modal === 'create' ? 'Create New Branch' : `Edit: ${editing?.name}`}
                  </h2>
                  <p className="text-[10px] text-stone-400 font-medium mt-0.5">
                    {modal === 'create' ? 'This will also create default store settings for the branch.' : 'Update branch details.'}
                  </p>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-stone-100 rounded-lg transition-all">
                  <X size={16} className="text-stone-500" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-[11px] font-bold text-red-700">
                    <AlertCircle size={13} /> {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <InputField label="Branch Name" name="name" placeholder="e.g. Sadar" required />
                  </div>
                  <div className="col-span-2">
                    <InputField label="URL Slug" name="slug" placeholder="e.g. sadar" disabled={!!editing} />
                    <p className="text-[9px] text-stone-400 mt-1">Slug is auto-generated and cannot be changed after creation.</p>
                  </div>
                  <div className="col-span-2">
                    <InputField label="Legal Business Name" name="legalName" placeholder="e.g. Mama Frankey Foods Pvt Ltd" />
                  </div>
                  <InputField label="Phone" name="phone" placeholder="+91 XXXXX XXXXX" />
                  <InputField label="GST Number" name="gstNumber" placeholder="27AXXXX..." />
                  <InputField label="FSSAI Number" name="fssai" placeholder="FSSAI Lic No." />
                  <InputField label="City" name="city" placeholder="Nagpur" />
                  <InputField label="State" name="state" placeholder="Maharashtra" />
                  <InputField label="Pincode" name="pincode" placeholder="440001" />
                  <div className="col-span-2">
                    <InputField label="Address" name="address" placeholder="Shop No., Street, Area" />
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-stone-100 flex items-center gap-3">
                <button onClick={closeModal}
                  className="flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-all">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-black uppercase tracking-wider text-white bg-[#E1261C] hover:bg-[#c01f17] rounded-lg transition-all disabled:opacity-50">
                  {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={13} />}
                  {saving ? 'Saving...' : modal === 'create' ? 'Create Branch' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
