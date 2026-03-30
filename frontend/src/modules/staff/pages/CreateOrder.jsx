import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Users, ChevronRight } from 'lucide-react';
import { TABLES } from '../data/staffMockData';
import { StaffNavbar } from '../components/StaffNavbar';

export default function CreateOrder() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-6 py-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Create New Order</h1>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 1: Select a Table</p>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full bg-white shadow-xl shadow-slate-200/50 p-6 pb-32">
        <div className="grid grid-cols-2 gap-4">
          {TABLES.map((table) => (
            <motion.button
              key={table.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/staff/table/${table.id}`)}
              className="p-6 rounded-[2rem] border-2 border-slate-100 bg-slate-50/50 flex flex-col items-center gap-4 hover:border-slate-900 transition-all text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-black text-xl shadow-sm">
                #{table.number}
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-tight text-slate-900">Open Order</span>
                <div className="flex items-center justify-center gap-1 opacity-40 mt-1">
                  <Users size={12} />
                  <span className="text-[9px] font-bold uppercase">{table.capacity} Pax</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </main>

      <StaffNavbar activeTab="orders" />
    </div>
  );
}

