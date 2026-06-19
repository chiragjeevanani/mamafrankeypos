import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Settings, Shield, Printer, Bell, 
  CreditCard, Globe, Zap, Database,
  Lock, Key, Sliders, ChevronRight,
  CheckCircle2, AlertCircle, Save, Plus, Trash2,
  Table, Edit, Layout, ShieldAlert, X, Loader2, CheckCircle, BarChart3, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { usePos } from '../../pos/context/PosContext';
import api from '../../../utils/api';
import { maskCurrency, getReplacedName, maskQuantity } from '../utils/dataMask';


// ─────────────────────────────────────────────────
// Clear Reports Data — 4-step confirmation modal
// ─────────────────────────────────────────────────
function WipeDataModal({ onClose }) {
  // step: 'confirm' | 'verify' | 'loading' | 'success'
  const [step, setStep] = useState('confirm');
  const [inputVal, setInputVal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleContinue = () => setStep('verify');

  const handleConfirmDelete = async () => {
    if (inputVal !== 'CLEAR') return;
    setStep('loading');
    setErrorMsg('');
    try {
      await api.post('/settings/reports/purge');
      setStep('success');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Purge failed.');
      setStep('verify');
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setInputVal('');
    setErrorMsg('');
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="wipe-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        onClick={(e) => { if (e.target === e.currentTarget && step !== 'loading') handleClose(); }}
      >
        <motion.div
          key={step}
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >

          {/* ── Step 1: Confirm ── */}
          {step === 'confirm' && (
            <>
              <div className="bg-rose-50 px-6 py-5 border-b border-rose-100 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                    <ShieldAlert size={20} className="text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-rose-800 uppercase tracking-tight">Purge Reports History?</h2>
                    <p className="text-[11px] text-rose-500 font-semibold mt-0.5">This will only remove historical sales and ledger logs.</p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-1 hover:bg-rose-100 rounded-lg transition-colors mt-0.5">
                  <X size={16} className="text-rose-400" />
                </button>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-stone-600 font-medium leading-relaxed">
                  This will <span className="font-black text-rose-600">permanently remove all report history</span> including daily sales metrics and staff attendance records. <span className="font-bold text-slate-900 border-b-2 border-emerald-400 pb-0.5">Your menus, tables, and settings will remain safe.</span>
                </p>
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
                  <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-[11px] font-semibold text-amber-700">Recommended: Export your monthly data as CSV before purging.</p>
                </div>
              </div>
              <div className="px-6 pb-5 flex gap-2">
                <button onClick={handleClose} className="flex-1 py-1.5 border border-stone-200 rounded-lg text-[10px] font-black text-stone-500 hover:bg-stone-50 transition-colors uppercase tracking-wider">
                  Cancel
                </button>
                <button onClick={handleContinue} className="flex-1 py-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-black hover:bg-rose-700 transition-all uppercase tracking-wider shadow-md shadow-rose-200 active:scale-[0.98]">
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* ── Step 2: Verify ── */}
          {step === 'verify' && (
            <>
              <div className="bg-rose-50 px-6 py-5 border-b border-rose-100 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                    <Trash2 size={20} className="text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-rose-800 uppercase tracking-tight">Final Verification</h2>
                    <p className="text-[11px] text-rose-500 font-semibold mt-0.5">Type the confirmation phrase below.</p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-1 hover:bg-rose-100 rounded-lg transition-colors mt-0.5">
                  <X size={16} className="text-rose-400" />
                </button>
              </div>
              <div className="px-6 py-5">
                {errorMsg && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2">
                    <AlertCircle size={14} className="text-rose-500 shrink-0" />
                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest leading-normal">{errorMsg}</p>
                  </div>
                )}
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Type <span className="font-black text-rose-600 tracking-widest">CLEAR</span> to confirm
                </p>
                <input
                  autoFocus
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="CLEAR"
                  className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-black tracking-widest uppercase outline-none transition-all ${
                    inputVal === 'CLEAR'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 focus:ring-2 focus:ring-rose-300'
                      : 'border-stone-200 bg-stone-50 text-stone-700 focus:ring-2 focus:ring-stone-200'
                  }`}
                />
                {inputVal.length > 0 && inputVal !== 'CLEAR' && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1.5">⚠ Must match exactly: CLEAR</p>
                )}
              </div>
              <div className="px-6 pb-5 flex gap-2">
                <button onClick={() => { setStep('confirm'); setInputVal(''); }} className="flex-1 py-1.5 border border-stone-200 rounded-lg text-[10px] font-black text-stone-500 hover:bg-stone-50 transition-colors uppercase tracking-wider">
                  ← Back
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={inputVal !== 'CLEAR'}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    inputVal === 'CLEAR'
                      ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-200 active:scale-[0.98] cursor-pointer'
                      : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                  }`}
                >
                  Clear Reports
                </button>
              </div>
            </>
          )}

          {/* ── Step 3: Loading ── */}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="mb-5"
              >
                <Loader2 size={40} className="text-rose-500" />
              </motion.div>
              <h3 className="text-sm font-black text-stone-800 uppercase tracking-tight mb-1">Cleaning Data…</h3>
              <p className="text-[11px] text-stone-400 font-semibold">Please wait, do not close this window.</p>
              <div className="mt-5 w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.0, ease: 'easeInOut' }}
                  className="h-full bg-rose-500 rounded-full"
                />
              </div>
            </div>
          )}

          {/* ── Step 4: Success ── */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4"
              >
                <CheckCircle size={32} className="text-emerald-600" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-sm font-black text-stone-800 uppercase tracking-tight mb-1"
              >
                Reports Purged Successfully
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-[11px] text-stone-400 font-semibold mb-6"
              >
                Historical sales and attendance logs have been cleared.
              </motion.p>
              <button onClick={handleClose} className="px-6 py-1.5 bg-stone-900 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-stone-700 transition-all shadow-md active:scale-[0.98]">
                Close
              </button>
            </div>
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ─────────────────────────────────────────────────
// Danger Zone section card
// ─────────────────────────────────────────────────
function DangerZone() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="border border-rose-200 rounded-sm bg-rose-50/40 overflow-hidden">
        {/* Header strip */}
        <div className="px-5 py-3 border-b border-rose-100 flex items-center gap-2 bg-rose-50">
          <ShieldAlert size={14} className="text-rose-600" />
          <h3 className="text-[11px] font-black text-rose-700 uppercase tracking-widest">⚠️ Danger Zone</h3>
        </div>

        {/* Content row */}
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-stone-800 uppercase tracking-tight">Clear Reports History</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest leading-relaxed">
              Permanently removes historical sales metrics and attendance logs.
              <span className="text-emerald-600 font-black"> All menu and table configurations are preserved.</span>
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 active:scale-[0.97] transition-all shadow-lg shadow-rose-200 border border-rose-700"
          >
            <Trash2 size={13} strokeWidth={2.5} />
            Purge Reports
          </button>
        </div>
      </div>

      {showModal && <WipeDataModal onClose={() => setShowModal(false)} />}
    </>
  );
}

export default function SystemSettings() {
  const { section = 'general' } = useParams();
  const navigate = useNavigate();
  const { 
    sections, addSection, updateSection, deleteSection,
    tables, addTable, updateTable, deleteTable,
    appliedTaxes, addTax, updateTax, deleteTax
  } = usePos();
  const [newTax, setNewTax] = useState({ name: '', rate: '' });
  const [taxError, setTaxError] = useState('');
  const [editingTaxId, setEditingTaxId] = useState(null);
  const [editingTaxRate, setEditingTaxRate] = useState('');

  // Custom dialog modal state
  const [dialog, setDialog] = useState(null);

  const showAlert = (message, title = 'Notification', isError = false) => {
    return new Promise((resolve) => {
      setDialog({
        type: 'alert',
        title,
        message,
        isError,
        onConfirm: () => resolve(true)
      });
    });
  };

  const showConfirm = (message, title = 'Confirmation Required') => {
    return new Promise((resolve) => {
      setDialog({
        type: 'confirm',
        title,
        message,
        onConfirm: (val) => resolve(val)
      });
    });
  };

  const exportDailySalesCsv = async () => {
    try {
      setIsSaving(true);
      const { data: orders } = await api.get('/orders');
      
      const rows = [
        ['Order ID', 'Date', 'Type', 'Table/Car', 'Status', 'Subtotal (INR)', 'Tax (INR)', 'Discount (INR)', 'Total (INR)'],
        ...orders.map(order => {
          const total = order.totalAmount || 0;
          const discount = order.discount?.amount || order.discountAmount || 0;
          const tax = order.taxes?.reduce((sum, t) => sum + Number(t.amount || 0), 0) || order.taxAmount || 0;
          
          let subtotal = order.subtotal || (total + discount);
          const isExclusive = subtotal > 0 && Math.abs(subtotal + tax - total) < 2.0;
          if (isExclusive) {
            subtotal += tax;
            if (Math.abs(subtotal - total) < 1.0 && discount > 0) {
              subtotal += discount;
            }
          }
          
          return [
            order.orderNumber,
            order.createdAt ? new Date(order.createdAt).toLocaleString() : '',
            order.orderType || '',
            order.table?.name || order.carNumber || 'N/A',
            order.orderStatus || '',
            maskCurrency(subtotal).toFixed(2),
            maskCurrency(tax).toFixed(2),
            maskCurrency(discount).toFixed(2),
            maskCurrency(total).toFixed(2)
          ];
        })
      ];
      
      const csvContent = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `daily_sales_report_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Failed to export sales CSV:', err);
      await showAlert('Unable to fetch daily sales records.', 'Export Failed', true);
    } finally {
      setIsSaving(false);
    }
  };

  const exportAttendanceCsv = async () => {
    try {
      setIsSaving(true);
      const { data: attendance } = await api.get('/staff/attendance?date=all');
      
      const rows = [
        ['Staff Name', 'Date', 'Check In', 'Check Out', 'Shift Status', 'Terminal'],
        ...attendance.map(log => [
          getReplacedName(log.staffName),
          log.date ? new Date(log.date).toLocaleDateString() : '',
          log.checkIn ? new Date(log.checkIn).toLocaleTimeString() : '',
          log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : 'N/A',
          log.status || '',
          log.terminal || ''
        ])
      ];
      
      const csvContent = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `staff_attendance_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Failed to export attendance CSV:', err);
      await showAlert('Unable to fetch staff attendance logs.', 'Export Failed', true);
    } finally {
      setIsSaving(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [autoCommit, setAutoCommit] = useState(true);
  const [config, setConfig] = useState({
    storeName: 'Mama Frankey POS',
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    address: '',
    phone: '',
    gstNumber: '',
    legalName: '',
    city: '',
    state: '',
    pincode: '',
    fssai: ''
  });

  const [tablesSaved, setTablesSaved] = useState(false);
  const isPickupSection = (sec) =>
    sec?.type === 'PICKUP' ||
    sec?.id?.toLowerCase().includes('pickup') ||
    sec?.name?.toLowerCase().includes('pickup') ||
    sec?.label?.toLowerCase().includes('pickup');

  const [activeTableSection, setActiveTableSection] = useState('');
  const [tableError, setTableError] = useState('');
  const [tableSuccess, setTableSuccess] = useState('');
  const [sectionForm, setSectionForm] = useState({ id: null, label: '', rank: 0 });
  const [tableForm, setTableForm] = useState({ id: null, name: '', capacity: 4, status: 'blank' });

  // Update active section if sections change or on first load — always skip pickup sections
  React.useEffect(() => {
    if (sections.length > 0) {
      const currentIsValid = activeTableSection &&
        sections.find(s => s._id === activeTableSection) &&
        !isPickupSection(sections.find(s => s._id === activeTableSection));
      if (!currentIsValid) {
        const firstNonPickup = sections.find(s => !isPickupSection(s));
        setActiveTableSection(firstNonPickup?._id || '');
      }
    }
  }, [sections]);

  const clearTableMessages = () => {
    setTableError('');
    setTableSuccess('');
  };

  const resetSectionForm = () => {
    setSectionForm({ id: null, label: '', rank: sections.length });
  };

  const resetTableForm = () => {
    setTableForm({ id: null, name: '', capacity: 4, status: 'blank' });
  };

  const selectedSection = sections.find(s => s._id === activeTableSection) || null;
  const isSelectedSectionPickup = isPickupSection(selectedSection);
  const tablesInActiveSection = tables.filter(t => t.sectionId === selectedSection?.id);

  const saveSection = async () => {
    clearTableMessages();
    const label = sectionForm.label.trim();

    if (!label) {
      setTableError('Section name is required.');
      return;
    }

    const payload = {
      label,
      name: label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      rank: Number(sectionForm.rank) || 0,
    };

    try {
      let savedSection;
      if (sectionForm.id) {
        savedSection = await updateSection(sectionForm.id, payload);
        setTableSuccess('Section updated successfully.');
      } else {
        savedSection = await addSection(payload);
        setTableSuccess('Section created successfully.');
      }

      if (savedSection?._id) {
        setActiveTableSection(savedSection._id);
      }
      resetSectionForm();
    } catch (error) {
      setTableError(error.response?.data?.message || 'Unable to save section.');
    }
  };

  const saveTable = async () => {
    clearTableMessages();

    if (!selectedSection) {
      setTableError('Select a section before saving a table.');
      return;
    }

    const name = tableForm.name.trim().toUpperCase();
    const capacity = Number(tableForm.capacity);

    if (!name) {
      setTableError('Table identifier is required.');
      return;
    }

    if (!Number.isFinite(capacity) || capacity <= 0) {
      setTableError('Capacity must be greater than zero.');
      return;
    }

    const payload = {
      name,
      section: activeTableSection,
      capacity,
      status: tableForm.status,
    };

    try {
      if (tableForm.id) {
        await updateTable(tableForm.id, payload);
        setTableSuccess('Table updated successfully.');
      } else {
        await addTable(payload);
        setTableSuccess('Table created successfully.');
      }
      resetTableForm();
    } catch (error) {
      setTableError(error.response?.data?.message || 'Unable to save table.');
    }
  };

  // ── Counter Billing Series state ──
  const [counters, setCounters] = useState([]);
  const [counterSaved, setCounterSaved] = useState(false);

  React.useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const { data } = await api.get('/settings/store');
        setConfig(data);
      } catch (error) {
        console.error("Error fetching store settings:", error);
      }
    };
    fetchStoreSettings();
  }, []);

  React.useEffect(() => {
    const fetchCounters = async () => {
      try {
        const { data } = await api.get('/settings/counters');
        setCounters(data.map(c => ({
          id: c._id,
          name: c.name,
          prefix: c.prefix,
          startNum: c.startNum,
          currentNum: c.currentNum
        })));
      } catch (error) {
        console.error("Error fetching counters:", error);
      }
    };
    fetchCounters();
  }, []);

  const updateCounter = (id, field, value) =>
    setCounters(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

  const addCounter = async () => {
    try {
      const idx = counters.length + 1;
      const { data } = await api.post('/settings/counters', {
        name: `Counter ${idx}`,
        prefix: `C${idx}`,
        startNum: 1
      });
      setCounters(prev => [...prev, {
        id: data._id,
        name: data.name,
        prefix: data.prefix,
        startNum: data.startNum,
        currentNum: data.currentNum
      }]);
    } catch (error) {
      console.error('Error adding counter:', error);
    }
  };

  const deleteCounter = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to delete this billing counter?', 'Delete Counter');
    if (!confirmed) return;
    try {
      await api.delete(`/settings/counters/${id}`);
      setCounters(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting counter:', error);
    }
  };

  const saveCounters = async () => {
    try {
      setIsSaving(true);
      await Promise.all(counters.map(c => 
        api.put(`/settings/counters/${c.id}`, {
          name: c.name,
          prefix: c.prefix,
          startNum: c.startNum
        })
      ));
      setCounterSaved(true);
      setTimeout(() => setCounterSaved(false), 2500);
    } catch (error) {
      console.error('Error saving counters:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper: build preview string
  const preview = (c) => {
    const padded = String(Math.max(0, Number(c.startNum) || 0)).padStart(3, '0');
    return c.prefix ? `${c.prefix}-${padded}` : padded;
  };

  const settingsGroups = [
    { id: 'general',       label: 'Store Preferences',   icon: Sliders    },
    { id: 'tables',        label: 'Table Configuration', icon: Table      },
    { id: 'billing',       label: 'Counter Series',      icon: Layout     },
    { id: 'payment',       label: 'Tax Settings',        icon: CreditCard },
    { id: 'reports',       label: 'Reset & Reports',     icon: BarChart3  },
  ];

  const handleCommit = async () => {
    try {
      setIsSaving(true);
      const payload = {
        ...config,
        taxes: appliedTaxes.map(t => ({
          name: t.name,
          percentage: Number(t.percentage || t.rate || 0),
          active: t.active !== undefined ? t.active : (t.enabled !== undefined ? t.enabled : true)
        }))
      };
      await api.put('/settings/store', payload);
      setIsSaving(false);
      await showAlert('Store settings updated successfully.', 'Success');
    } catch (error) {
      console.error('Error saving settings:', error);
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar max-h-full">
       <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">System Settings</h1>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configure store preferences, tables, billing, and system parameters</p>
        </div>
        <button 
          onClick={handleCommit}
          disabled={isSaving}
          className={`h-9 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-95 transition-all flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-wait' : ''} outline-none`}
        >
           {isSaving ? <Zap size={14} className="animate-spin" /> : <Save size={14} />}
           {isSaving ? 'Synchronizing...' : 'Commit Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lateral Navigation */}
        <div className="w-full lg:w-64 space-y-1">
          {settingsGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => navigate(`/admin/settings/${group.id}`)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
                section === group.id 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                  : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100 hover:border-slate-300'
              } outline-none`}
            >
              <group.icon size={14} />
              {group.label}
              {section === group.id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </div>

         {/* Content Area */}
         <div className="flex-1 space-y-8">
            <div className="bg-white border border-slate-100 rounded-sm p-8 shadow-sm space-y-8 min-h-[400px]">
               <AnimatePresence mode="wait">
                  {section === 'general' && (
                     <motion.div 
                        key="general"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                     >
                        <div className="flex items-center gap-4 mb-8">
                           <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center text-slate-900">
                              <Globe size={24} />
                           </div>
                           <div>
                              <h3 className="text-sm font-black uppercase tracking-tight">Location & Timezone</h3>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global system behavior and formatting</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-2 col-span-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Name</label>
                               <input 
                                  type="text"
                                  className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                  value={config.storeName}
                                  onChange={(e) => setConfig({...config, storeName: e.target.value})}
                               />
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Entity Name (e.g. M/S TIME TO EAT)</label>
                               <input 
                                  type="text"
                                  className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                  value={config.legalName || ''}
                                  onChange={(e) => setConfig({...config, legalName: e.target.value})}
                               />
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FSSAI License Number</label>
                               <input 
                                  type="text"
                                  className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                  value={config.fssai || ''}
                                  onChange={(e) => setConfig({...config, fssai: e.target.value})}
                               />
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Currency</label>
                               <select 
                                  className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                  value={config.currency}
                                  onChange={(e) => setConfig({...config, currency: e.target.value})}
                               >
                                  <option value="INR">INR (₹) - Indian Rupee</option>
                                  <option value="USD">USD ($) - US Dollar</option>
                               </select>
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timezone</label>
                               <select 
                                  className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                  value={config.timezone}
                                  onChange={(e) => setConfig({...config, timezone: e.target.value})}
                               >
                                  <option value="Asia/Kolkata">(UTC+05:30) IST</option>
                                  <option value="UTC">(UTC+00:00) GMT</option>
                               </select>
                           </div>
                           <div className="space-y-2 col-span-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Address</label>
                               <textarea 
                                  className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                  value={config.address}
                                  onChange={(e) => setConfig({...config, address: e.target.value})}
                                  rows={3}
                               />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City / Region</label>
                                <input 
                                   type="text"
                                   className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                   value={config.city || ''}
                                   onChange={(e) => setConfig({...config, city: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State</label>
                                        <input 
                                           type="text"
                                           className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                           value={config.state || ''}
                                           onChange={(e) => setConfig({...config, state: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pin Code</label>
                                        <input 
                                           type="text"
                                           className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                           value={config.pincode || ''}
                                           onChange={(e) => setConfig({...config, pincode: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</label>
                               <input 
                                  type="text"
                                  className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                  value={config.phone}
                                  onChange={(e) => setConfig({...config, phone: e.target.value})}
                               />
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST / Tax Number</label>
                               <input 
                                  type="text"
                                  className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                  value={config.gstNumber}
                                  onChange={(e) => setConfig({...config, gstNumber: e.target.value})}
                               />
                           </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50 flex items-center gap-4">
                           <Zap size={16} className="text-amber-500" />
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-loose max-w-lg">
                               Caution: Changing currency, symbol, or timezone formats will update receipt printing and dashboard calculations.
                           </p>
                        </div>
                     </motion.div>
                  )}

                  {/* ══ Billing Settings — Counter Billing Series ══ */}
                  {section === 'billing' && (
                    <motion.div
                      key="billing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Section Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center text-slate-900">
                          <CreditCard size={24} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-tight">🧾 Counter Billing Series</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            Configure a unique bill number sequence per billing counter
                          </p>
                        </div>
                      </div>

                      {/* Info note */}
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-sm px-4 py-3">
                        <AlertCircle size={13} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] font-semibold text-blue-700 leading-relaxed">
                          Each counter will generate its own billing number series. Any counter can process any order type.
                        </p>
                      </div>

                      {/* Table */}
                      <div className="border border-slate-100 rounded-sm overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-[1fr_100px_110px_130px_36px] bg-slate-50 border-b border-slate-100 px-4 py-2.5">
                          {['Counter Name', 'Prefix', 'Start No.', 'Preview', ''].map((h, i) => (
                            <span key={i} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</span>
                          ))}
                        </div>

                        {/* Table Rows */}
                        <AnimatePresence initial={false}>
                          {counters.map((c, idx) => (
                            <motion.div
                              key={c.id}
                              layout
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.18 }}
                              className={`grid grid-cols-[1fr_100px_110px_130px_36px] items-center px-4 py-2.5 gap-2 ${
                                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                              } border-b border-slate-100 last:border-b-0`}
                            >
                              {/* Counter Name */}
                              <input
                                type="text"
                                value={c.name}
                                onChange={(e) => updateCounter(c.id, 'name', e.target.value)}
                                placeholder="Counter Name"
                                className="w-full bg-white border border-slate-200 rounded-sm px-2.5 py-1.5 text-[11px] font-bold text-slate-800 outline-none focus:ring-1 focus:ring-slate-900/15 transition-all"
                              />

                              {/* Prefix */}
                              <input
                                type="text"
                                value={c.prefix}
                                onChange={(e) => updateCounter(c.id, 'prefix', e.target.value.toUpperCase().slice(0, 5))}
                                placeholder="e.g. C1"
                                maxLength={5}
                                className="w-full bg-white border border-slate-200 rounded-sm px-2.5 py-1.5 text-[11px] font-bold text-slate-800 uppercase tracking-widest outline-none focus:ring-1 focus:ring-slate-900/15 transition-all"
                              />

                              {/* Starting Number */}
                              <input
                                type="number"
                                min={0}
                                value={c.startNum}
                                onChange={(e) => updateCounter(c.id, 'startNum', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-sm px-2.5 py-1.5 text-[11px] font-bold text-slate-800 outline-none focus:ring-1 focus:ring-slate-900/15 transition-all"
                              />

                              {/* Preview (read-only) */}
                              <div className="flex items-center">
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-sm px-2.5 py-1.5 text-[11px] font-black tracking-widest select-none">
                                  {preview(c)}
                                </span>
                              </div>

                              {/* Delete */}
                              <button
                                onClick={async () => {
                                   const confirmed = await showConfirm('Are you sure you want to remove this counter?', 'Delete Counter');
                                   if (confirmed) deleteCounter(c.id);
                                }}
                                disabled={counters.length === 1}
                                className="flex items-center justify-center w-7 h-7 rounded-sm text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Delete counter"
                              >
                                <Trash2 size={13} strokeWidth={2} />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={addCounter}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all shadow-sm"
                        >
                          <Plus size={13} strokeWidth={2.5} />
                          Add Counter
                        </button>

                        <div className="flex items-center gap-3">
                          {counterSaved && (
                            <motion.span
                              initial={{ opacity: 0, x: 8 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-[11px] font-bold text-emerald-600 flex items-center gap-1"
                            >
                              <CheckCircle2 size={13} /> Saved!
                            </motion.span>
                          )}
                          <button
                            onClick={saveCounters}
                            className="flex items-center gap-2 h-9 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-95 transition-all hover:bg-[#E1261C]"
                          >
                            <Save size={13} />
                            Save Changes
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-50 flex items-center gap-3">
                        <Zap size={14} className="text-amber-500 shrink-0" />
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                          Bill numbers restart from the configured starting number on each new billing session.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* ══ Table Management — Configuration ══ */}
                  {section === 'tables' && (
                    <motion.div
                      key="tables"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      {/* Section Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center text-slate-900">
                          <Table size={24} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-tight">🪑 Table Configuration</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            Manage dining areas and individual tables
                          </p>
                        </div>
                      </div>

                      {/* --- 1. Section Management --- */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <div>
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-l-2 border-slate-900 pl-3">Dining Sections</h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-3">Define your physical dining areas</p>
                           </div>
                           <button 
                             onClick={() => {
                               clearTableMessages();
                               resetSectionForm();
                             }}
                             className="bg-slate-900 text-white px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
                           >
                             <Plus size={12} /> New Section
                           </button>
                        </div>

                        {(tableError || tableSuccess) && (
                          <div className={`rounded-sm border px-4 py-3 flex items-start gap-3 ${tableError ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <p className="text-[10px] font-black uppercase tracking-widest">{tableError || tableSuccess}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_220px_160px] gap-3 bg-white border border-slate-100 rounded-sm p-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section Label</label>
                            <input
                              type="text"
                              value={sectionForm.label}
                              onChange={(e) => setSectionForm(prev => ({ ...prev, label: e.target.value }))}
                              placeholder="e.g. Main Hall"
                              className="w-full bg-slate-50 border border-slate-200 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Rank</label>
                            <input
                              type="number"
                              min="0"
                              value={sectionForm.rank}
                              onChange={(e) => setSectionForm(prev => ({ ...prev, rank: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 p-3 text-[11px] font-bold outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <button
                              onClick={saveSection}
                              className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-sm text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                            >
                              {sectionForm.id ? 'Update' : 'Create'}
                            </button>
                            {sectionForm.id && (
                              <button
                                onClick={() => {
                                  clearTableMessages();
                                  resetSectionForm();
                                }}
                                className="px-4 py-3 border border-slate-200 rounded-sm text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          {sections.length === 0 && (
                            <div className="w-full rounded-sm border border-dashed border-slate-200 bg-white px-4 py-6 text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No dining sections created yet</p>
                            </div>
                          )}

                          {sections.filter(sec => {
                            const isPickup = sec.type === 'PICKUP' ||
                              sec.id?.toLowerCase().includes('pickup') ||
                              sec.name?.toLowerCase().includes('pickup') ||
                              sec.label?.toLowerCase().includes('pickup');
                            return !isPickup;
                          }).map(sec => (
                            <button 
                              key={sec.id} 
                              onClick={() => {
                                clearTableMessages();
                                resetTableForm();
                                setActiveTableSection(sec._id);
                              }}
                              className={`px-4 py-2.5 rounded-sm border transition-all flex items-center gap-3 ${
                                activeTableSection === sec._id 
                                  ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                                  : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                              }`}
                            >
                               <span className="text-[10px] font-black uppercase tracking-widest">{sec.label}</span>
                               <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
                                  <div 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      clearTableMessages();
                                      setSectionForm({ id: sec._id, label: sec.label, rank: sec.rank ?? 0 });
                                    }}
                                    className="p-1 hover:bg-white/10 rounded-sm"
                                  >
                                    <Edit size={10} />
                                  </div>
                                  {!sec.isSystem && (
                                    <div 
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        clearTableMessages();
                                        const confirmed = await showConfirm(`Are you sure you want to delete the dining section "${sec.label}" and all its tables?`, 'Delete Section');
                                        if (!confirmed) return;
                                        try {
                                          await deleteSection(sec._id);
                                          if (activeTableSection === sec._id) setActiveTableSection(sections.find(s => s._id !== sec._id)?._id || '');
                                          setTableSuccess('Section deleted successfully.');
                                        } catch (error) {
                                          setTableError(error.response?.data?.message || 'Unable to delete section.');
                                        }
                                      }}
                                      className="p-1 hover:bg-rose-500 rounded-sm"
                                    >
                                      <Trash2 size={10} />
                                    </div>
                                  )}
                                  {sec.isSystem && (
                                    <div className="bg-white/20 text-[6px] px-1 py-0.5 rounded-full font-black uppercase tracking-tighter">System</div>
                                  )}
                               </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* --- 2. Table Management (Active Section Only) --- */}
                      <div className="pt-8 border-t border-slate-50 space-y-6">
                        <div className="flex items-center justify-between">
                           <div>
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-l-2 border-[#E1261C] pl-3">Table List {selectedSection ? `- ${selectedSection.label}` : '- Select Section'}</h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-3">Configure individual table identifiers and statuses</p>
                           </div>
                           {!isSelectedSectionPickup && selectedSection?.type !== 'CAR-SERVICE' && (
                             <button 
                               onClick={() => {
                                 clearTableMessages();
                                 resetTableForm();
                               }}
                               disabled={!selectedSection}
                               className="bg-[#E1261C] text-white px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-rose-900/10 disabled:opacity-50"
                             >
                               <Plus size={12} /> Add Table
                             </button>
                           )}
                        </div>

                        {selectedSection?.type === 'CAR-SERVICE' ? (
                           <div className="bg-amber-50 border border-amber-100 rounded-sm p-6 text-center">
                              <ShieldAlert size={24} className="mx-auto text-amber-500 mb-2" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Dedicated Car Service Mode</p>
                              <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mt-1">This section operates strictly on car numbers. Physical tables are not required or permitted.</p>
                           </div>
                         ) : isSelectedSectionPickup ? (
                           <div className="bg-sky-50 border border-sky-100 rounded-sm p-6 text-center">
                              <ShieldAlert size={24} className="mx-auto text-sky-400 mb-2" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-sky-700">Pickup is POS-Driven</p>
                              <p className="text-[9px] font-bold text-sky-600 uppercase tracking-widest mt-1">Pickup orders are created via the Pick Up button on the POS terminal. No physical tables are needed or permitted for this mode.</p>
                           </div>
                         ) : (
                           <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_140px_180px_160px] gap-3 bg-white border border-slate-100 rounded-sm p-4">
                             <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Table Identifier</label>
                               <input
                                 type="text"
                                 value={tableForm.name}
                                 onChange={(e) => setTableForm(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                                 placeholder="e.g. T1 or AC12"
                                 className="w-full bg-slate-50 border border-slate-200 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                 disabled={!selectedSection}
                               />
                             </div>
                             <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacity</label>
                               <input
                                 type="number"
                                 min="1"
                                 value={tableForm.capacity}
                                 onChange={(e) => setTableForm(prev => ({ ...prev, capacity: e.target.value }))}
                                 className="w-full bg-slate-50 border border-slate-200 p-3 text-[11px] font-bold outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                 disabled={!selectedSection}
                               />
                             </div>
                             <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                               <select
                                 value={tableForm.status}
                                 onChange={(e) => setTableForm(prev => ({ ...prev, status: e.target.value }))}
                                 className="w-full bg-slate-50 border border-slate-200 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                 disabled={!selectedSection}
                               >
                                 <option value="blank">Blank</option>
                                 <option value="on-hold">On Hold</option>
                                 <option value="running-kot">Running KOT</option>
                                 <option value="printed">Printed</option>
                                 <option value="paid">Paid</option>
                               </select>
                             </div>
                             <div className="flex items-end gap-2">
                               <button
                                 onClick={saveTable}
                                 disabled={!selectedSection}
                                 className="flex-1 bg-[#E1261C] text-white px-4 py-3 rounded-sm text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                               >
                                 {tableForm.id ? 'Update' : 'Create'}
                               </button>
                               {tableForm.id && (
                                 <button
                                   onClick={() => {
                                     clearTableMessages();
                                     resetTableForm();
                                   }}
                                   className="px-4 py-3 border border-slate-200 rounded-sm text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50"
                                 >
                                   Cancel
                                 </button>
                               )}
                             </div>
                           </div>
                         )}

                        <div className="bg-white border border-slate-100 rounded-sm overflow-hidden">
                          <div className="grid grid-cols-[1fr_120px_100px] bg-slate-50 border-b border-slate-100 px-6 py-3">
                            {['Table Identifier', 'Operational Status', 'Tools'].map((h, i) => (
                              <span key={i} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</span>
                            ))}
                          </div>

                          <div className="divide-y divide-slate-50">
                            <AnimatePresence mode="popLayout" initial={false}>
                              {tablesInActiveSection.length === 0 ? (
                                 <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-12 flex flex-col items-center justify-center gap-2 text-slate-200"
                                 >
                                    <Table size={32} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{selectedSection ? 'No tables assigned to this section' : 'Select a section to manage tables'}</span>
                                 </motion.div>
                              ) : tablesInActiveSection.map((table, idx) => (
                                <motion.div
                                  key={table._id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                                  className="grid grid-cols-[1fr_120px_100px] items-center px-6 py-4 hover:bg-slate-50/50 transition-colors group"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-sm bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#E1261C] group-hover:text-white transition-all">
                                       <Table size={14} />
                                    </div>
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{table.name}</span>
                                  </div>
                                  <div>
                                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-sm border ${
                                      table.status === 'blank'
                                        ? 'bg-slate-50 text-slate-500 border-slate-100'
                                        : table.status === 'running-kot'
                                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                                        : table.status === 'printed'
                                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                                        : table.status === 'paid'
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        : 'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                      {table.status.replace('-', ' ').toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 opacity-20 group-hover:opacity-100 transition-all">
                                    <button 
                                      onClick={() => {
                                        clearTableMessages();
                                        setTableForm({
                                          id: table._id,
                                          name: table.name,
                                          capacity: table.capacity || 4,
                                          status: table.status || 'blank',
                                        });
                                      }}
                                      className="p-1.5 bg-white border border-slate-100 rounded-sm text-slate-400 hover:text-slate-900 hover:border-slate-300"
                                    >
                                      <Edit size={12} />
                                    </button>
                                    <button 
                                      onClick={async () => {
                                         clearTableMessages();
                                         const confirmed = await showConfirm(`Are you sure you want to delete table "${table.name}"?`, 'Delete Table');
                                         if (!confirmed) return;
                                         try {
                                           await deleteTable(table._id);
                                           setTableSuccess('Table deleted successfully.');
                                         } catch (error) {
                                           setTableError(error.response?.data?.message || 'Unable to delete table.');
                                         }
                                      }}
                                      className="p-1.5 bg-white border border-slate-100 rounded-sm text-slate-400 hover:text-rose-600 hover:border-rose-100"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                        <motion.span 
                          className="text-[10px] font-bold text-slate-400"
                        >
                          All changes are synchronized instantly with the registry.
                        </motion.span>
                      </div>
                    </motion.div>
                  )}

                  {/* ══ Taxation & Billing Management ══ */}
                  {section === 'payment' && (
                    <motion.div
                      key="payment"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      {/* Section Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center text-slate-900">
                          <CreditCard size={24} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-tight">⚖️ Tax Management</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            Configure store tax rates and compliance parameters
                          </p>
                        </div>
                      </div>

                      {/* --- 1. Add New Tax Protocol --- */}
                      <div className="bg-slate-50 border border-slate-100 rounded-sm p-6 space-y-4">
                         <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-l-2 border-[#E1261C] pl-3 mb-4">Add New Tax Rate</h4>
                         {taxError && (
                           <div className="rounded-sm border border-rose-100 bg-rose-50 px-4 py-3 flex items-start gap-3 text-rose-600">
                             <AlertCircle size={14} className="mt-0.5 shrink-0" />
                             <p className="text-[10px] font-black uppercase tracking-widest">{taxError}</p>
                           </div>
                         )}
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tax Identity (e.g. GST)</label>
                               <input 
                                 type="text" 
                                 placeholder="IDENTITY"
                                 value={newTax.name}
                                 onChange={(e) => setNewTax({...newTax, name: e.target.value.toUpperCase()})}
                                 className="w-full bg-white border border-slate-200 p-2.5 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Percentage (%)</label>
                               <input 
                                 type="number" 
                                 placeholder="0.00"
                                 value={newTax.rate}
                                 onChange={(e) => setNewTax({...newTax, rate: e.target.value})}
                                 className="w-full bg-white border border-slate-200 p-2.5 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                               />
                            </div>
                            <button 
                              onClick={() => {
                                setTaxError('');
                                const rateNum = Number(newTax.rate);
                                if (!newTax.name.trim() || isNaN(rateNum)) {
                                  setTaxError('Error: Incomplete or invalid tax percentage.');
                                  return;
                                }
                                if (rateNum < 0) {
                                  setTaxError('Error: Tax percentage must be a valid non-negative number.');
                                  return;
                                }
                                if (appliedTaxes.some(t => t.name.toLowerCase() === newTax.name.trim().toLowerCase())) {
                                  setTaxError('Error: Tax configuration name already exists.');
                                  return;
                                }
                                addTax(newTax.name.trim().toUpperCase(), newTax.rate);
                                setNewTax({ name: '', rate: '' });
                              }}
                              className="bg-slate-900 text-white h-[42px] px-6 rounded-sm text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                            >
                               <Plus size={14} /> Create Tax
                            </button>
                         </div>
                      </div>

                      {/* --- 2. Tax Registry Registry --- */}
                      <div className="space-y-4">
                         <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-l-2 border-slate-900 pl-3">Active Taxes</h4>
                         <div className="bg-white border border-slate-100 rounded-sm overflow-hidden">
                            <div className="grid grid-cols-[1fr_120px_100px_120px] bg-slate-50 border-b border-slate-100 px-6 py-3">
                              {['Tax Name', 'Percentage', 'Status', 'Actions'].map((h, i) => (
                                <span key={i} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</span>
                              ))}
                            </div>

                            <div className="divide-y divide-slate-50">
                              <AnimatePresence mode="popLayout" initial={false}>
                                {appliedTaxes.length === 0 ? (
                                   <motion.div 
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="py-12 flex flex-col items-center justify-center gap-2 text-slate-200"
                                   >
                                      <Shield size={32} />
                                      <span className="text-[10px] font-black uppercase tracking-widest">No active tax configurations found</span>
                                   </motion.div>
                                ) : appliedTaxes.map((tax, idx) => (
                                  <motion.div
                                    key={tax.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                                    className="grid grid-cols-[1fr_120px_100px_120px] items-center px-6 py-4 hover:bg-slate-50/50 transition-colors group"
                                  >
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{tax.name}</span>
                                    {editingTaxId === tax.id ? (
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editingTaxRate}
                                        onChange={(e) => setEditingTaxRate(e.target.value)}
                                        className="w-20 bg-white border border-slate-200 rounded-sm px-2 py-1 text-[11px] font-bold text-slate-800 outline-none focus:ring-1 focus:ring-slate-900/15"
                                      />
                                    ) : (
                                      <span className="text-[11px] font-bold text-slate-600 tabular-nums font-mono">{tax.rate}%</span>
                                    )}
                                    <div>
                                      <button 
                                        onClick={() => updateTax(tax.id, { enabled: !tax.enabled })}
                                        className={`text-[8px] font-black px-2.5 py-1 rounded-sm border transition-all ${
                                          tax.enabled 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                            : 'bg-slate-50 text-slate-400 border-slate-100'
                                        }`}
                                      >
                                        {tax.enabled ? 'ACTIVE' : 'INACTIVE'}
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-20 group-hover:opacity-100 transition-all">
                                      {editingTaxId === tax.id ? (
                                        <button 
                                          onClick={() => {
                                            setTaxError('');
                                            const rateVal = Number(editingTaxRate);
                                            if (isNaN(rateVal) || rateVal < 0) {
                                              setTaxError('Error: Tax percentage must be non-negative.');
                                              return;
                                            }
                                            updateTax(tax.id, { rate: rateVal });
                                            setEditingTaxId(null);
                                          }}
                                          className="p-1.5 bg-slate-900 border border-slate-900 rounded-sm text-white hover:bg-[#E1261C] transition-colors"
                                          title="Save changes"
                                        >
                                          <CheckCircle size={12} />
                                        </button>
                                      ) : (
                                        <button 
                                          onClick={() => {
                                            setEditingTaxId(tax.id);
                                            setEditingTaxRate(tax.rate);
                                          }}
                                          className="p-1.5 bg-white border border-slate-100 rounded-sm text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-colors"
                                          title="Edit percentage"
                                        >
                                          <Edit size={12} />
                                        </button>
                                      )}
                                      <button 
                                        onClick={async () => {
                                          const confirmed = await showConfirm(`Are you sure you want to delete the "${tax.name}" tax configuration?`, 'Delete Tax');
                                          if (confirmed) {
                                             deleteTax(tax.id);
                                          }
                                        }}
                                        className="p-1.5 bg-white border border-slate-100 rounded-sm text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-colors"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                         </div>
                      </div>

                      <div className="pt-4 border-t border-slate-50 flex items-center gap-3">
                         <Zap size={14} className="text-amber-500 shrink-0" />
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                            Warning: Changes to active taxes will affect all active POS billing terminals immediately.
                         </p>
                      </div>
                    </motion.div>
                  )}



                  {section === 'reports' && (
                    <motion.div
                      key="reports"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      {/* Section Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center text-slate-900">
                          <BarChart3 size={24} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-tight">📊 Reports & System Reset</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            Export sales data, attendance logs, and manage system resets
                          </p>
                        </div>
                      </div>

                      {/* Reports Group */}
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-l-2 border-slate-900 pl-3">Standard Exports</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <Database size={16} className="text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-tight">Daily Sales Report</span>
                             </div>
                             <button onClick={exportDailySalesCsv} className="text-[9px] font-black text-slate-900 border border-slate-200 px-3 py-1 rounded-sm hover:bg-white transition-all uppercase cursor-pointer">Export CSV</button>
                          </div>
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <Users size={16} className="text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-tight">Staff Attendance Logs</span>
                             </div>
                             <button onClick={exportAttendanceCsv} className="text-[9px] font-black text-slate-900 border border-slate-200 px-3 py-1 rounded-sm hover:bg-white transition-all uppercase cursor-pointer">Export CSV</button>
                          </div>
                        </div>
                      </div>

                      {/* Danger Zone Integration */}
                      <div className="pt-8 border-t border-slate-100">
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-rose-600 mb-4">Critical Settings</h4>
                        <DangerZone />
                      </div>
                    </motion.div>
                  )}

                  {(section !== 'general' && section !== 'billing' && section !== 'tables' && section !== 'reports' && section !== 'payment') && (
                     <motion.div 
                        key="others"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-20 text-center space-y-4"
                     >
                        <Database size={48} className="mx-auto text-slate-100" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">Section Not Found</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">The requested settings section is not configured.</p>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-sm">
               <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
               <p className="text-[9px] font-bold text-blue-700 uppercase tracking-widest leading-loose">
                  Settings are currently active. Save changes to sync across all POS billing terminals.
               </p>
            </div>
            
            {/* Styled React custom dialog overlay */}
            <AnimatePresence>
               {dialog && (
                 <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setDialog(null)}
                     className="absolute inset-0 bg-[#1e1e1e]/60 backdrop-blur-sm"
                   />
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative overflow-hidden flex flex-col p-6 border border-stone-200"
                   >
                     <div className="flex items-center gap-3 mb-4">
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dialog.isError ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                         <AlertCircle size={16} />
                       </div>
                       <h3 className="text-sm font-extrabold uppercase text-stone-900">{dialog.title || 'Notification'}</h3>
                     </div>
                     
                     <p className="text-xs text-stone-600 font-bold mb-6 uppercase tracking-wider leading-relaxed">{dialog.message}</p>
                     
                     <div className="flex items-center gap-3 justify-end">
                       {dialog.type === 'confirm' && (
                         <button
                           onClick={() => {
                             dialog.onConfirm(false);
                             setDialog(null);
                           }}
                           className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                         >
                           Cancel
                         </button>
                       )}
                       <button
                         onClick={() => {
                           dialog.onConfirm(true);
                           setDialog(null);
                         }}
                         className="px-4 py-2.5 bg-[#E1261C] hover:bg-[#c81e17] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                       >
                         Confirm
                       </button>
                     </div>
                   </motion.div>
                 </div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
