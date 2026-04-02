import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Eye, CheckCircle2, Zap, Info } from 'lucide-react';

const METRICS = [
  { key: 'sales',    label: 'Sales Revenue',   color: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-700'   },
  { key: 'profit',   label: 'Net Profit',       color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700' },
  { key: 'orders',   label: 'Order Volume',     color: 'bg-blue-500',    light: 'bg-blue-50',    text: 'text-blue-700'    },
  { key: 'customers',label: 'Customer Count',   color: 'bg-purple-500',  light: 'bg-purple-50',  text: 'text-purple-700'  },
];

export default function DataVisibility() {
  const [globalPct, setGlobalPct]   = useState(100);
  const [inputVal,  setInputVal]    = useState('100');
  const [applied,   setApplied]     = useState(100);
  const [saved,     setSaved]       = useState(false);
  const [perMetric, setPerMetric]   = useState({ sales: 100, profit: 100, orders: 100, customers: 100 });

  const clamp = (v) => Math.min(100, Math.max(0, Number(v) || 0));

  const handleSlider = (v) => {
    const val = clamp(v);
    setGlobalPct(val);
    setInputVal(String(val));
  };

  const handleInput = (v) => {
    setInputVal(v);
    const num = clamp(v);
    setGlobalPct(num);
  };

  const handleApply = () => {
    const final = clamp(globalPct);
    setApplied(final);
    // sync all per-metric values to global
    setPerMetric({ sales: final, profit: final, orders: final, customers: final });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const statusColor =
    applied >= 80 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
    applied >= 40 ? 'bg-amber-100  text-amber-700  border-amber-200'  :
                    'bg-rose-100   text-rose-700   border-rose-200';

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar max-h-full">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Eye size={18} className="text-[#E1261C]" />
            <h1 className="text-xl font-black uppercase tracking-tight text-stone-800">
              📊 Data Visibility Control
            </h1>
          </div>
          <p className="text-xs text-stone-400 font-semibold">
            Adjust how much percentage of actual data is shown in the dashboard.
          </p>
        </div>

        {/* Active badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider ${statusColor}`}>
          <div className="w-2 h-2 rounded-full bg-current opacity-70 animate-pulse" />
          Active: {applied}%
        </div>
      </div>

      {/* ── Global Control Card ── */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
          <div className="w-9 h-9 bg-stone-50 rounded-lg flex items-center justify-center">
            <BarChart3 size={18} className="text-[#E1261C]" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-stone-800">
              Global Display Rate
            </h2>
            <p className="text-[10px] text-stone-400 font-semibold mt-0.5">
              Applies to all metrics unless overridden below
            </p>
          </div>
        </div>

        {/* Label + number input row */}
        <div className="flex items-center justify-between gap-4">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
            Display Data Percentage (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              value={inputVal}
              onChange={(e) => handleInput(e.target.value)}
              onBlur={() => { const v = clamp(globalPct); setGlobalPct(v); setInputVal(String(v)); }}
              className="w-20 border-2 border-stone-200 rounded-lg px-3 py-2 text-sm font-black text-center text-stone-800 outline-none focus:border-[#E1261C] focus:ring-2 focus:ring-[#E1261C]/10 transition-all"
            />
            <span className="text-sm font-black text-stone-500">%</span>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="range"
              min={0}
              max={100}
              value={globalPct}
              onChange={(e) => handleSlider(e.target.value)}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#E1261C]"
              style={{
                background: `linear-gradient(to right, #E1261C ${globalPct}%, #e7e5e4 ${globalPct}%)`
              }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-stone-300 uppercase tracking-widest">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Live preview bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            <span>Preview</span>
            <span className="font-black text-stone-700">{globalPct}% visible</span>
          </div>
          <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#E1261C] rounded-full"
              animate={{ width: `${globalPct}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            />
          </div>
        </div>

        {/* Helper text */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
          <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-[11px] font-semibold text-blue-700 leading-relaxed">
            Example: If set to <span className="font-black">70%</span>, only 70% of actual sales/profit will be displayed across all dashboard widgets.
          </p>
        </div>

        {/* Apply button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleApply}
            className="h-9 px-6 bg-stone-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest shadow-lg shadow-stone-900/10 active:scale-95 transition-all flex items-center gap-2 hover:bg-[#E1261C]"
          >
            {saved ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Zap size={14} />}
            {saved ? 'Applied!' : 'Apply Changes'}
          </button>

          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] font-bold text-emerald-600"
            >
              ✅ Current Display Rate: {applied}%
            </motion.span>
          )}
        </div>
      </div>

      {/* ── Per-Metric Override Cards ── */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
          Per-Metric Overrides
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {METRICS.map((m) => (
            <div key={m.key} className="bg-white border border-stone-200 rounded-xl shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${m.color}`} />
                  <span className="text-[11px] font-black uppercase tracking-wider text-stone-700">{m.label}</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${m.light} ${m.text}`}>
                  {perMetric[m.key]}%
                </span>
              </div>

              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={perMetric[m.key]}
                  onChange={(e) => setPerMetric(prev => ({ ...prev, [m.key]: Number(e.target.value) }))}
                  className={`w-full h-1.5 rounded-full appearance-none cursor-pointer`}
                  style={{
                    background: `linear-gradient(to right, #E1261C ${perMetric[m.key]}%, #e7e5e4 ${perMetric[m.key]}%)`
                  }}
                />
              </div>

              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${m.color} rounded-full`}
                  animate={{ width: `${perMetric[m.key]}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Status info ── */}
      <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-sm">
        <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
        <p className="text-[9px] font-bold text-blue-700 uppercase tracking-widest leading-loose">
          Data visibility settings are applied UI-side only. Underlying data remains intact and unmodified.
        </p>
      </div>
    </div>
  );
}
