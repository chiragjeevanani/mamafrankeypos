
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Edit3, Trash2, AlertCircle } from 'lucide-react';

export default function AdminModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  icon: Icon = Plus, 
  children, 
  onSubmit, 
  submitLabel = 'Commit Record',
  maxWidth = 'max-w-lg'
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`bg-white w-full ${maxWidth} rounded-sm shadow-2xl relative overflow-hidden flex flex-col`}
          >
             {/* Modal Header */}
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 underline decoration-transparent">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-slate-900 text-white rounded-sm flex items-center justify-center">
                      <Icon size={16} />
                   </div>
                   <div>
                      <h3 className="text-[13px] font-black uppercase tracking-tight text-slate-900">
                         {title}
                      </h3>
                      {subtitle && (
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 underline decoration-transparent">{subtitle}</p>
                      )}
                   </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={18} /></button>
             </div>

             {/* Modal Body */}
             <div className="overflow-y-auto max-h-[75vh] no-scrollbar underline decoration-transparent">
                {onSubmit ? (
                  <form onSubmit={onSubmit} className="p-8 space-y-6">
                    {children}
                    
                    {/* Validation Footer */}
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-sm flex items-start gap-3 underline decoration-transparent">
                       <AlertCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
                       <p className="text-[9px] font-bold text-blue-700 uppercase tracking-widest leading-relaxed">
                          Validation: Changes will be synchronized across all modules upon commitment.
                       </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 flex items-center gap-3 underline decoration-transparent">
                       <button 
                          type="button"
                          onClick={onClose}
                          className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:text-slate-900 hover:bg-slate-50 transition-all outline-none"
                       >Cancel</button>
                       <button 
                          type="submit"
                          className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all outline-none"
                       >
                          <Save size={14} />
                          {submitLabel}
                       </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-8">
                    {children}
                  </div>
                )}
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
