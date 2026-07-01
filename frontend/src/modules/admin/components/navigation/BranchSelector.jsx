import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Store, Check } from 'lucide-react';
import { useBranchContext } from '../../../../context/BranchContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function BranchSelector() {
  const { branches, activeBranch, setActiveBranch, activeBranchLabel } = useBranchContext();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Check if this admin is a Super Admin (role=Admin has branchId null)
  let userInfo = null;
  try {
    userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  } catch {}
  const isSuperAdmin = userInfo?.role === 'Admin' || !userInfo?.branchId;

  // Non-super admins: show a static label only (no dropdown)
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/8 border border-white/15 rounded">
        <Store size={13} className="text-[#FFD600]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">
          {activeBranchLabel}
        </span>
      </div>
    );
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const options = [
    { id: 'all', label: 'All Branches', icon: Globe },
    ...branches.map(b => ({ id: b._id, label: b.name, icon: Store })),
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/8 border border-white/15 rounded hover:bg-white/15 hover:border-white/25 transition-all"
      >
        {activeBranch === 'all'
          ? <Globe size={13} className="text-[#FFD600]" />
          : <Store size={13} className="text-[#FFD600]" />}
        <span className="text-[10px] font-bold uppercase tracking-widest text-white max-w-[100px] truncate">
          {activeBranchLabel}
        </span>
        <ChevronDown size={11} className={`text-white/60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-52 bg-[#1E1E1E] border border-white/12 rounded-lg shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2 border-b border-white/8">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40 px-2">Select Branch</p>
            </div>
            <div className="p-1">
              {options.map(opt => {
                const Icon = opt.icon;
                const isActive = activeBranch === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => { setActiveBranch(opt.id); setOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-all text-left
                      ${isActive ? 'bg-[#E1261C]/20 text-white' : 'text-white/70 hover:bg-white/8 hover:text-white'}`}
                  >
                    <Icon size={13} className={isActive ? 'text-[#E1261C]' : 'text-white/40'} />
                    <span className="text-[11px] font-bold uppercase tracking-wide flex-1">{opt.label}</span>
                    {isActive && <Check size={11} className="text-[#E1261C]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
