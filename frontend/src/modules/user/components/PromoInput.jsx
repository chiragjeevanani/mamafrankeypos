import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, CheckCircle, XCircle, X, Loader2 } from 'lucide-react';

const VALID_PROMOS = {
  WELCOME10: { discount: 50, label: '₹50 off on your first order!' },
  KRISHI20: { discount: 80, label: '₹80 off on orders above ₹500' },
  FLAT15: { discount: 60, label: '₹60 flat discount' },
};

export function PromoInput({ onApply, onRemove, appliedCode }) {
  const [code, setCode] = useState('');
  const [state, setState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const handleApply = () => {
    if (!code.trim()) return;
    setState('loading');
    setTimeout(() => {
      const promo = VALID_PROMOS[code.toUpperCase()];
      if (promo) {
        setState('success');
        setMessage(promo.label);
        onApply(code.toUpperCase(), promo.discount);
      } else {
        setState('error');
        setMessage('Invalid promo code. Try WELCOME10 or KRISHI20');
      }
    }, 800);
  };

  const handleRemove = () => {
    setState('idle');
    setCode('');
    setMessage('');
    onRemove();
  };

  if (appliedCode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-700">{appliedCode} applied!</p>
            <p className="text-xs text-green-600">{VALID_PROMOS[appliedCode]?.label}</p>
          </div>
        </div>
        <button onClick={handleRemove} className="text-green-500 hover:text-green-700 cursor-pointer transition-colors">
          <X size={16} />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setState('idle'); }}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Enter promo code"
            className="w-full pl-10 pr-4 py-3 bg-charcoal-100 border border-transparent focus:border-brand-300 focus:bg-white rounded-2xl text-sm font-medium text-charcoal-900 placeholder:text-charcoal-400 outline-none transition-all duration-200"
          />
        </div>
        <motion.button
          onClick={handleApply}
          disabled={state === 'loading' || !code.trim()}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-3 bg-brand-500 text-white font-semibold text-sm rounded-2xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
        >
          {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : null}
          Apply
        </motion.button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-1"
          >
            {state === 'success' ? (
              <CheckCircle size={14} className="text-green-600 shrink-0" />
            ) : (
              <XCircle size={14} className="text-red-500 shrink-0" />
            )}
            <span className={`text-xs font-medium ${state === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
