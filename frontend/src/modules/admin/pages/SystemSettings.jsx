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


// ─────────────────────────────────────────────────
// Clear Reports Data — 4-step confirmation modal
// ─────────────────────────────────────────────────
function WipeDataModal({ onClose }) {
  // step: 'confirm' | 'verify' | 'loading' | 'success'
  const [step, setStep] = useState('confirm');
  const [inputVal, setInputVal] = useState('');

  const handleContinue = () => setStep('verify');

  const handleConfirmDelete = () => {
    if (inputVal !== 'CLEAR') return;
    setStep('loading');
    setTimeout(() => setStep('success'), 2200);
  };

  const handleClose = () => {
    setStep('confirm');
    setInputVal('');
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
  const { sections, setSections, tables, setTables } = usePos();

  const [isSaving, setIsSaving] = useState(false);
  const [autoCommit, setAutoCommit] = useState(true);
  const [config, setConfig] = useState({
    currency: 'INR (₹) - Indian Rupee',
    timezone: '(UTC+05:30) IST'
  });

  const [tablesSaved, setTablesSaved] = useState(false);

  // ── Counter Billing Series state ──
  const [counters, setCounters] = useState([
    { id: 1, name: 'Counter 1',    prefix: 'C1', startNum: 1   },
    { id: 2, name: 'Counter 2',    prefix: 'C2', startNum: 1   },
    { id: 3, name: 'Billing Desk', prefix: 'BD', startNum: 100 },
  ]);
  const [counterSaved,  setCounterSaved]  = useState(false);

  const updateCounter = (id, field, value) =>
    setCounters(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

  const counterIndexRef = React.useRef(4); // next index for new counters

  const addCounter = () => {
    const idx = counterIndexRef.current++;
    setCounters(prev => [...prev, { id: Date.now(), name: `Counter ${idx}`, prefix: `C${idx}`, startNum: 1 }]);
  };

  const deleteCounter = (id) =>
    setCounters(prev => prev.filter(c => c.id !== id));

  const saveCounters = () => {
    setCounterSaved(true);
    setTimeout(() => setCounterSaved(false), 2500);
  };

  // Helper: build preview string
  const preview = (c) => {
    const padded = String(Math.max(0, Number(c.startNum) || 0)).padStart(3, '0');
    return c.prefix ? `${c.prefix}-${padded}` : padded;
  };

  const settingsGroups = [
    { id: 'general',       label: 'Store Preferences',   icon: Sliders    },
    { id: 'tables',        label: 'Table Management',    icon: Table      },
    { id: 'billing',       label: 'Billing Settings',    icon: CreditCard },
    { id: 'payment',       label: 'Taxation & Billing',  icon: CreditCard },
    { id: 'printers',      label: 'Printers & KOT',      icon: Printer    },
    { id: 'security',      label: 'Staff Permissions',   icon: Shield     },
    { id: 'notifications', label: 'Alert Protocols',     icon: Bell       },
    { id: 'reports',       label: 'Reports & Reset',      icon: BarChart3  },
  ];

  const handleCommit = () => {
    setIsSaving(true);
    setTimeout(() => {
       setIsSaving(false);
       window.alert('CONFIGURATION SUCCESS: Global protocols synchronized across all terminal nodes.');
    }, 1500);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar max-h-full">
       <div className="flex items-center justify-between underline decoration-transparent">
        <div>
           <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 underline decoration-transparent">System Core Configuration</h1>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 underline decoration-transparent">Configure global protocols, security frameworks, and hardware routing</p>
        </div>
        <button 
          onClick={handleCommit}
          disabled={isSaving}
          className={`h-9 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-95 transition-all flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-wait' : ''} outline-none underline decoration-transparent`}
        >
           {isSaving ? <Zap size={14} className="animate-spin" /> : <Save size={14} />}
           {isSaving ? 'Synchronizing...' : 'Commit Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 underline decoration-transparent">
        {/* Lateral Navigation */}
        <div className="w-full lg:w-64 space-y-1 underline decoration-transparent">
          {settingsGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => navigate(`/admin/settings/${group.id}`)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
                section === group.id 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                  : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100 hover:border-slate-300'
              } outline-none underline decoration-transparent`}
            >
              <group.icon size={14} />
              {group.label}
              {section === group.id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </div>

         {/* Content Area */}
         <div className="flex-1 space-y-8 underline decoration-transparent">
            <div className="bg-white border border-slate-100 rounded-sm p-8 shadow-sm space-y-8 min-h-[400px] underline decoration-transparent">
               <AnimatePresence mode="wait underline decoration-transparent">
                  {section === 'general' && (
                     <motion.div 
                        key="general"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6 underline decoration-transparent"
                     >
                        <div className="flex items-center gap-4 mb-8 underline decoration-transparent">
                           <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center text-slate-900 underline decoration-transparent">
                              <Globe size={24} />
                           </div>
                           <div className="underline decoration-transparent">
                              <h3 className="text-sm font-black uppercase tracking-tight underline decoration-transparent">Regional Protocol</h3>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest underline decoration-transparent">Global system behavior and formatting</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 underline decoration-transparent">
                           <div className="space-y-2 underline decoration-transparent">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest underline decoration-transparent">Base Currency Unit</label>
                              <select 
                                 className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                 value={config.currency}
                                 onChange={(e) => setConfig({...config, currency: e.target.value})}
                              >
                                 <option>INR (₹) - Indian Rupee</option>
                                 <option>USD ($) - US Dollar</option>
                              </select>
                           </div>
                           <div className="space-y-2 underline decoration-transparent">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest underline decoration-transparent">Temporal Zone</label>
                              <select 
                                 className="w-full bg-slate-50 border border-slate-100 p-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-900/10 rounded-sm"
                                 value={config.timezone}
                                 onChange={(e) => setConfig({...config, timezone: e.target.value})}
                              >
                                 <option>(UTC+05:30) IST</option>
                                 <option>(UTC+00:00) GMT</option>
                              </select>
                           </div>
                           <div className="space-y-2 underline decoration-transparent">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest underline decoration-transparent">Order Auto-Commit</label>
                              <div className="flex items-center gap-3 mt-2 underline decoration-transparent">
                                 <div 
                                    onClick={() => setAutoCommit(!autoCommit)}
                                    className={`w-10 h-5 rounded-full relative p-1 cursor-pointer transition-colors ${autoCommit ? 'bg-slate-900' : 'bg-slate-200'} underline decoration-transparent`}
                                 >
                                    <div className={`w-3 h-3 bg-white rounded-full absolute shadow-sm transition-all ${autoCommit ? 'right-1' : 'left-1'} underline decoration-transparent`} />
                                 </div>
                                 <span className="text-[10px] font-bold text-slate-900 uppercase underline decoration-transparent">{autoCommit ? 'ENABLED' : 'DISABLED'}</span>
                              </div>
                           </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50 flex items-center gap-4 underline decoration-transparent">
                           <Zap size={16} className="text-amber-500" />
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-loose max-w-lg underline decoration-transparent">
                              Caution: Modifying regional protocols may affect historical data indexing and billing reconciliation logic.
                           </p>
                        </div>
                     </motion.div>
                  )}

                  {section === 'security' && (
                     <motion.div 
                        key="security"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6 underline decoration-transparent"
                     >
                        <div className="flex items-center gap-4 mb-8 underline decoration-transparent">
                           <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center text-slate-900 underline decoration-transparent">
                              <Lock size={24} />
                           </div>
                           <div className="underline decoration-transparent">
                              <h3 className="text-sm font-black uppercase tracking-tight underline decoration-transparent">Access Control Protocol</h3>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest underline decoration-transparent">Authentication and permission layers</p>
                           </div>
                        </div>

                        <div className="space-y-6 underline decoration-transparent">
                           <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-between underline decoration-transparent">
                              <div className="flex items-center gap-4 underline decoration-transparent">
                                 <Shield size={20} className="text-slate-900" />
                                 <div className="underline decoration-transparent">
                                    <h4 className="text-[11px] font-black uppercase tracking-tight underline decoration-transparent">Two-Factor Auth (2FA)</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest leading-tight underline decoration-transparent">Secondary verification for all admin logins</p>
                                 </div>
                              </div>
                              <button 
                                onClick={() => window.alert('SECURITY: Connecting to multi-factor authentication gateway...')}
                                className="px-3 py-1 bg-white border border-slate-200 text-slate-900 text-[8px] font-black uppercase tracking-widest rounded-sm active:scale-95 transition-all underline decoration-transparent"
                              >CONFIGURE</button>
                           </div>

                           <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-between underline decoration-transparent">
                              <div className="flex items-center gap-4 underline decoration-transparent">
                                 <Key size={20} className="text-slate-900" />
                                 <div className="underline decoration-transparent">
                                    <h4 className="text-[11px] font-black uppercase tracking-tight underline decoration-transparent">Protocol API Access</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest leading-tight underline decoration-transparent">Management of secure communication tokens</p>
                                 </div>
                              </div>
                              <button 
                                onClick={() => window.alert('SECURITY: Regenerating secure terminal handshaking keys...')}
                                className="px-3 py-1 bg-white border border-slate-200 text-slate-900 text-[8px] font-black uppercase tracking-widest rounded-sm active:scale-95 transition-all underline decoration-transparent"
                              >MANAGE KEYS</button>
                           </div>
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
                                onClick={() => deleteCounter(c.id)}
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
                            Manage dining areas and individual table registry
                          </p>
                        </div>
                      </div>

                      {/* --- 1. Section Management --- */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-l-2 border-slate-900 pl-3">Dining Sections</h4>
                          <button 
                            onClick={() => {
                              const label = window.prompt('Enter new section name:');
                              if (label) setSections([...sections, { id: label.toLowerCase().replace(/\s/g, '-'), label }]);
                            }}
                            className="bg-slate-900 text-white px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2"
                          >
                            <Plus size={12} /> Add Section
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {sections.map(sec => (
                            <div key={sec.id} className="bg-slate-50 border border-slate-100 rounded-sm p-4 flex items-center justify-between">
                              <span className="text-[11px] font-black uppercase tracking-tight">{sec.label}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    const label = window.prompt('Edit section name:', sec.label);
                                    if (label) setSections(sections.map(s => s.id === sec.id ? { ...s, label } : s));
                                  }}
                                  className="p-1 hover:bg-slate-200 rounded-sm transition-colors text-slate-400"
                                >
                                  <Edit size={12} />
                                </button>
                                <button 
                                  onClick={() => setSections(sections.filter(s => s.id !== sec.id))}
                                  className="p-1 hover:bg-rose-50 hover:text-rose-500 rounded-sm transition-colors text-slate-300"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* --- 2. Table Management --- */}
                      {sections.map(sec => (
                        <div key={sec.id} className="space-y-4 pt-4 border-t border-slate-50">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 flex items-center gap-2">
                              <Layout size={12} /> Section: {sec.label}
                            </h4>
                          </div>

                          <div className="border border-slate-100 rounded-sm overflow-hidden">
                            <div className="grid grid-cols-[1fr_120px_100px] bg-slate-50 border-b border-slate-100 px-4 py-2.5">
                              {['Table Name', 'Status', 'Actions'].map((h, i) => (
                                <span key={i} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</span>
                              ))}
                            </div>

                            <AnimatePresence initial={false}>
                              {tables.filter(t => t.sectionId === sec.id).map((table, idx) => (
                                <motion.div
                                  key={table.id}
                                  layout
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="grid grid-cols-[1fr_120px_100px] items-center px-4 py-2.5 hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-b-0"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                                    <span className="text-[11px] font-bold text-slate-800">{table.name}</span>
                                  </div>
                                  <div>
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${table.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                      {table.status.toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => {
                                        const name = window.prompt('Table Name:', table.name);
                                        if (name) setTables(tables.map(t => t.id === table.id ? { ...t, name } : t));
                                      }}
                                      className="p-1.5 hover:bg-slate-100 rounded-sm text-slate-400"
                                    >
                                      <Edit size={12} />
                                    </button>
                                    <button 
                                      onClick={() => setTables(tables.filter(t => t.id !== table.id))}
                                      className="p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-sm"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                          
                          <button 
                            onClick={() => {
                              const name = window.prompt(`Add new table to ${sec.label}:`);
                              if (name) setTables([...tables, { id: Date.now(), name, sectionId: sec.id, status: 'Active' }]);
                            }}
                            className="bg-white border border-slate-200 px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <Plus size={12} /> Add Table
                          </button>
                        </div>
                      ))}

                      {/* --- Save Changes Button --- */}
                      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                        {tablesSaved && (
                          <motion.span 
                            initial={{ opacity: 0, x: 5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[10px] font-bold text-emerald-600"
                          >
                            Configuration Synchronized!
                          </motion.span>
                        )}
                        <button
                          onClick={() => {
                            setTablesSaved(true);
                            setTimeout(() => setTablesSaved(false), 2000);
                          }}
                          className="h-9 px-8 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <Save size={14} /> Save Configuration
                        </button>
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
                            Extract business intelligence and manage data integrity
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
                                <span className="text-[10px] font-black uppercase tracking-tight">Daily Sales Matrix</span>
                             </div>
                             <button className="text-[9px] font-black text-slate-900 border border-slate-200 px-3 py-1 rounded-sm hover:bg-white transition-all uppercase">Export CSV</button>
                          </div>
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <Users size={16} className="text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-tight">Staff Attendance Logs</span>
                             </div>
                             <button className="text-[9px] font-black text-slate-900 border border-slate-200 px-3 py-1 rounded-sm hover:bg-white transition-all uppercase">Export CSV</button>
                          </div>
                        </div>
                      </div>

                      {/* Danger Zone Integration */}
                      <div className="pt-8 border-t border-slate-100">
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-rose-600 mb-4">Critical Protocols</h4>
                        <DangerZone />
                      </div>
                    </motion.div>
                  )}

                  {(section !== 'general' && section !== 'security' && section !== 'billing' && section !== 'tables' && section !== 'reports') && (
                     <motion.div 
                        key="others"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-20 text-center space-y-4 underline decoration-transparent"
                     >
                        <Database size={48} className="mx-auto text-slate-100" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 underline decoration-transparent">Module Synchronizing</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest underline decoration-transparent">Establishing hardware handshakes and registry links</p>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-sm underline decoration-transparent">
               <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
               <p className="text-[9px] font-bold text-blue-700 uppercase tracking-widest leading-loose underline decoration-transparent">
                  All system configurations are currently operating under the latest protocol version (v2.4.0). Commit changes to synchronize with secondary terminals.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
