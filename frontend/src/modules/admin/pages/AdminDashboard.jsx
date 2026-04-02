import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, ShoppingBag, Clock, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, Utensils, Users,
  Table, ChefHat, CreditCard, AlertCircle, BarChart3,
  Trash2, ShieldAlert, Loader2, CheckCircle, X
} from 'lucide-react';
import { ADMIN_STATS_HISTORY } from '../data/adminData';

// ─────────────────────────────────────────────────
// Wipe All Data — 4-step confirmation modal
// ─────────────────────────────────────────────────
function WipeDataModal({ onClose }) {
  // step: 'confirm' | 'verify' | 'loading' | 'success'
  const [step, setStep] = useState('confirm');
  const [inputVal, setInputVal] = useState('');

  const handleContinue = () => setStep('verify');

  const handleConfirmDelete = () => {
    if (inputVal !== 'DELETE') return;
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
                    <h2 className="text-sm font-black text-rose-800 uppercase tracking-tight">Are you sure?</h2>
                    <p className="text-[11px] text-rose-500 font-semibold mt-0.5">This action cannot be undone.</p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-1 hover:bg-rose-100 rounded-lg transition-colors mt-0.5">
                  <X size={16} className="text-rose-400" />
                </button>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-stone-600 font-medium leading-relaxed">
                  This will <span className="font-black text-rose-600">permanently delete all data</span> including orders, tables, staff records, and settings. There is no way to recover this data.
                </p>
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
                  <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-[11px] font-semibold text-amber-700">Make sure you have exported a backup before proceeding.</p>
                </div>
              </div>
              <div className="px-6 pb-5 flex gap-2">
                <button onClick={handleClose} className="flex-1 py-2.5 border border-stone-200 rounded-xl text-[11px] font-black text-stone-500 hover:bg-stone-50 transition-colors uppercase tracking-wider">
                  Cancel
                </button>
                <button onClick={handleContinue} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-[11px] font-black hover:bg-rose-700 transition-colors uppercase tracking-wider shadow-md shadow-rose-200 active:scale-[0.98]">
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
                  Type <span className="font-black text-rose-600 tracking-widest">DELETE</span> to confirm
                </p>
                <input
                  autoFocus
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="DELETE"
                  className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-black tracking-widest uppercase outline-none transition-all ${
                    inputVal === 'DELETE'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 focus:ring-2 focus:ring-rose-300'
                      : 'border-stone-200 bg-stone-50 text-stone-700 focus:ring-2 focus:ring-stone-200'
                  }`}
                />
                {inputVal.length > 0 && inputVal !== 'DELETE' && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1.5">⚠ Must match exactly: DELETE</p>
                )}
              </div>
              <div className="px-6 pb-5 flex gap-2">
                <button onClick={() => { setStep('confirm'); setInputVal(''); }} className="flex-1 py-2.5 border border-stone-200 rounded-xl text-[11px] font-black text-stone-500 hover:bg-stone-50 transition-colors uppercase tracking-wider">
                  ← Back
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={inputVal !== 'DELETE'}
                  className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                    inputVal === 'DELETE'
                      ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-200 active:scale-[0.98] cursor-pointer'
                      : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                  }`}
                >
                  🗑️ Confirm Delete
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
                ✅ Data Wiped Successfully
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-[11px] text-stone-400 font-semibold mb-6"
              >
                All system data has been cleared.
              </motion.p>
              <button onClick={handleClose} className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-stone-700 transition-colors shadow-md active:scale-[0.98]">
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

const stats = [
  { 
    label: "Today's Revenue", value: "₹42,850", trend: "+12.5%", isUp: true, 
    icon: TrendingUp, accent: "border-amber-500", iconBg: "bg-amber-50", iconColor: "text-amber-600",
    trendBg: "bg-emerald-50 text-emerald-600"
  },
  { 
    label: "Total Orders", value: "156", trend: "+8.2%", isUp: true, 
    icon: ShoppingBag, accent: "border-blue-500", iconBg: "bg-blue-50", iconColor: "text-blue-600",
    trendBg: "bg-emerald-50 text-emerald-600"
  },
  { 
    label: "Active Orders", value: "12", trend: "Live", isUp: true, 
    icon: ChefHat, accent: "border-orange-500", iconBg: "bg-orange-50", iconColor: "text-orange-600",
    trendBg: "bg-orange-50 text-orange-600"
  },
  { 
    label: "Avg Prep Time", value: "18 min", trend: "-2.1%", isUp: false, 
    icon: Clock, accent: "border-emerald-500", iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
    trendBg: "bg-rose-50 text-rose-600"
  },
];

// ─────────────────────────────────────────────────
// Danger Zone section card
// ─────────────────────────────────────────────────
function DangerZone() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="border border-rose-200 rounded-xl bg-rose-50/40 overflow-hidden">
        {/* Header strip */}
        <div className="px-5 py-3 border-b border-rose-100 flex items-center gap-2 bg-rose-50">
          <ShieldAlert size={14} className="text-rose-600" />
          <h3 className="text-[11px] font-black text-rose-700 uppercase tracking-widest">⚠️ Danger Zone</h3>
        </div>

        {/* Content row */}
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-stone-800">Wipe All Data</p>
            <p className="text-[11px] font-semibold text-stone-400 mt-0.5">
              Permanently removes all orders, tables, staff, menus, and settings.
              <span className="text-rose-500 font-black"> This action is irreversible.</span>
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-rose-700 active:scale-[0.97] transition-all shadow-md shadow-rose-200 border border-rose-700"
          >
            <Trash2 size={13} strokeWidth={2.5} />
            Wipe All Data
          </button>
        </div>
      </div>

      {showModal && <WipeDataModal onClose={() => setShowModal(false)} />}
    </>
  );
}

const quickStats = [
  { label: 'Tables Occupied', value: '8 / 14', icon: Table, color: 'text-[#E1261C]' },
  { label: 'Kitchen Queue', value: '12 Items', icon: ChefHat, color: 'text-orange-600' },
  { label: 'Pending Bills', value: '3 Tables', icon: CreditCard, color: 'text-blue-600' },
  { label: 'Floor Staff', value: '6 On Duty', icon: Users, color: 'text-emerald-600' },
];

export default function AdminDashboard() {
  const maxRevenue = Math.max(...ADMIN_STATS_HISTORY.map(d => d.revenue));
  const now = new Date();

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Utensils size={18} className="text-[#E1261C]" />
            <h1 className="text-xl font-black uppercase tracking-tight text-stone-800">Today's Operations</h1>
          </div>
          <p className="text-xs text-stone-400 font-semibold">
            {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-[11px] font-bold text-stone-500 uppercase tracking-wider hover:bg-stone-50 transition-all shadow-sm">
            Export Report
          </button>
          <button className="px-3 py-2 bg-[#E1261C] text-white rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-md shadow-stone-900/15 hover:bg-[#4E342E] transition-all active:scale-[0.98]">
            Configure
          </button>
        </div>
      </div>

      {/* Quick Floor Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickStats.map((qs, i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm hover:border-stone-300 transition-all">
            <div className={`${qs.color} bg-stone-50 rounded-lg p-2 shrink-0`}>
              <qs.icon size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider leading-none mb-0.5">{qs.label}</p>
              <p className="text-sm font-black text-stone-800">{qs.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            className={`bg-white p-5 border-l-4 ${stat.accent} border border-stone-100 rounded-xl shadow-sm hover:shadow-md transition-all group`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.iconBg} ${stat.iconColor}`}>
                <stat.icon size={18} />
              </div>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black ${stat.trendBg}`}>
                {stat.isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-stone-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-xl shadow-sm flex flex-col min-h-[360px]">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-stone-800">Hourly Sales — Today</h3>
              <p className="text-[10px] text-stone-400 font-semibold mt-0.5">Dine-in vs Takeaway performance</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-stone-400 uppercase">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />Dine-in
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-stone-400 uppercase">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />Takeaway
              </div>
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="h-full w-full flex flex-col relative overflow-hidden rounded-lg">
              {/* Grid Lines */}
              <div className="absolute inset-0 pb-10 pr-4 flex flex-col justify-between pointer-events-none">
                {[1,2,3,4].map(i => <div key={i} className="w-full h-px bg-stone-100" />)}
              </div>

              {/* SVG Line Graph */}
              <div className="absolute inset-0 pb-10 pr-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E1261C" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#E1261C" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    d={`M 0 100 ${ADMIN_STATS_HISTORY.map((item, i) => {
                      const x = (i / (ADMIN_STATS_HISTORY.length - 1)) * 100;
                      const y = 98 - (item.revenue / maxRevenue) * 90; 
                      return `L ${x} ${y}`;
                    }).join(' ')} L 100 100 Z`}
                    fill="url(#lineGlow)" stroke="none"
                  />
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    d={`M 0 100 ${ADMIN_STATS_HISTORY.map((item, i) => {
                      const x = (i / (ADMIN_STATS_HISTORY.length - 1)) * 100;
                      const y = 98 - (item.revenue / maxRevenue) * 90;
                      return `L ${x} ${y}`;
                    }).join(' ')}`}
                    fill="none" stroke="#E1261C" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>

              {/* Interaction Layer */}
              <div className="flex-1 flex justify-between gap-0 h-full relative z-10 pr-4">
                {ADMIN_STATS_HISTORY.map((item, idx) => {
                  const yPos = 98 - (item.revenue / maxRevenue) * 90;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative h-full">
                      <div 
                        className="absolute inset-x-0 bottom-10 transition-all duration-300 opacity-0 group-hover:opacity-100 flex flex-col items-center pointer-events-none"
                        style={{ top: `${yPos}%` }}
                      >
                        <div className="w-3 h-3 bg-white border-[2.5px] border-[#E1261C] rounded-full shadow-md -mt-1.5 z-20" />
                        <div className="w-px h-full bg-gradient-to-b from-[#E1261C]/20 to-transparent" />
                      </div>
                      <div 
                        className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 pointer-events-none"
                        style={{ top: `calc(${yPos}% - 38px)` }}
                      >
                        <div className="bg-stone-800 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                          ₹{item.revenue.toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-auto pt-2 w-full h-10 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter w-full text-center truncate px-1">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Panel */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-stone-800">Recent Orders</h3>
            <span className="text-[9px] font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-100">Live</span>
          </div>
          <div className="p-3 space-y-1.5 flex-1">
            {[
              { num: 8821, table: 'T-04', method: 'Card', amount: 850, time: '2m ago', status: 'paid' },
              { num: 8820, table: 'T-07', method: 'Cash', amount: 1200, time: '5m ago', status: 'paid' },
              { num: 8819, table: 'T-02', method: 'UPI', amount: 650, time: '12m ago', status: 'paid' },
              { num: 8818, table: 'Takeaway', method: 'Card', amount: 450, time: '18m ago', status: 'paid' },
              { num: 8817, table: 'T-09', method: 'Cash', amount: 2100, time: '25m ago', status: 'paid' },
            ].map((order, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-stone-50/60 hover:bg-stone-100 border border-transparent hover:border-stone-200 cursor-pointer transition-all group">
                <div className="w-8 h-8 rounded-lg bg-[#E1261C]/10 text-[#E1261C] flex items-center justify-center group-hover:bg-[#E1261C] group-hover:text-white transition-all shrink-0">
                  <ShoppingBag size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-stone-800 uppercase tracking-tight leading-none">#{order.num} — {order.table}</p>
                  <p className="text-[9px] font-semibold text-stone-400 mt-0.5">{order.time} · {order.method}</p>
                </div>
                <span className="text-[11px] font-black text-stone-800">₹{order.amount}</span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-stone-100">
            <button className="w-full py-2 bg-stone-50 text-stone-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#E1261C] hover:text-white transition-all border border-stone-200 hover:border-transparent">
              Open Order History
            </button>
          </div>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <DangerZone />

      {/* Footer */}
      <footer className="border-t border-stone-200 pt-4 flex items-center justify-between opacity-50">
        <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest">Time to eat System v2.4.0 · {new Date().toLocaleDateString()}</p>
        <div className="flex items-center gap-4 text-[9px] font-semibold text-stone-400 uppercase tracking-widest">
          <span className="hover:text-stone-700 cursor-pointer transition-colors">System Settings</span>
          <span className="hover:text-stone-700 cursor-pointer transition-colors">Support</span>
        </div>
      </footer>
    </div>
  );
}
