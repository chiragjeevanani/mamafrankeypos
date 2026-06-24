import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Shield, X, AlertCircle } from 'lucide-react';
import api from '../../../utils/api';
import { playClickSound } from '../utils/sounds';

export default function ManagerPinModal({ isOpen, onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleNumberClick = (num) => {
    playClickSound();
    if (pin.length < 4) {
      setPin((prev) => {
        const next = prev + num;
        if (next.length === 4) {
          // Auto-submit when 4 digits are entered
          handleSubmit(next);
        }
        return next;
      });
      setError('');
    }
  };

  const handleDelete = () => {
    playClickSound();
    if (pin.length > 0) {
      setPin((prev) => prev.slice(0, -1));
      setError('');
    }
  };

  const handleClear = () => {
    playClickSound();
    setPin('');
    setError('');
  };

  const handleSubmit = async (pinCode) => {
    const code = pinCode || pin;
    if (code.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/pos/verify-manager', { pin: code });
      if (response.data?.success) {
        onSuccess(response.data, code);
        onClose();
      } else {
        setError('Verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid PIN or unauthorized role');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  // Global keyboard support when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e) => {
      // Ignore if user is focusing an input or textarea
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }

      if (/[0-9]/.test(e.key)) {
        e.preventDefault();
        handleNumberClick(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isOpen, pin, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
        {/* Backdrop close wrapper */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-sm bg-[#1C1E22] border border-white/8 rounded-3xl overflow-hidden shadow-2xl p-6 font-sans text-white z-[110]"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                <Shield size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">Manager Authorization</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">PIN required to execute this action</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>

          {/* PIN Dots display */}
          <div className="flex flex-col items-center justify-center py-6">
            <div className="flex items-center gap-4 mb-4">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4.5 h-4.5 rounded-full border-2 transition-all duration-200 ${
                    index < pin.length
                      ? 'bg-red-500 border-red-500 scale-110 shadow-lg shadow-red-500/35'
                      : 'border-white/10 bg-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Error Message */}
            <div className="h-6 flex items-center justify-center">
              {error && (
                <div className="text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-3 mb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <motion.button
                key={num}
                whileTap={{ scale: 0.94 }}
                disabled={isLoading}
                onClick={() => handleNumberClick(num.toString())}
                className="h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-xl font-black hover:bg-red-500 hover:text-white transition-all duration-250 cursor-pointer disabled:opacity-40"
              >
                {num}
              </motion.button>
            ))}
            <motion.button
              whileTap={{ scale: 0.94 }}
              disabled={isLoading}
              onClick={handleClear}
              className="h-14 bg-white/3 border border-white/5 rounded-2xl flex items-center justify-center text-xs font-black text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
            >
              CLEAR
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              disabled={isLoading}
              onClick={() => handleNumberClick('0')}
              className="h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-xl font-black hover:bg-red-500 hover:text-white transition-all duration-250 cursor-pointer disabled:opacity-40"
            >
              0
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              disabled={isLoading}
              onClick={handleDelete}
              className="h-14 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
            >
              <Delete size={20} />
            </motion.button>
          </div>

          {/* Loading overlay for auto-submit */}
          {isLoading && (
            <div className="absolute inset-0 bg-[#1C1E22]/85 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-3 border-red-500/20 border-t-red-500 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Verifying Passcode...</span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
