import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Users, ChevronRight } from 'lucide-react';
import { TABLES } from '../data/staffMockData';
import { StaffNavbar } from '../components/StaffNavbar';

export default function CreateOrder() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-staff-bg flex flex-col">
      <header className="sticky top-0 z-40 bg-staff-card/95 backdrop-blur-xl border-b border-staff-border px-6 py-8">
        <h1 className="text-2xl font-black text-staff-text-primary tracking-tight mb-1">Create New Order</h1>
        <p className="text-[10px] font-black uppercase tracking-widest text-staff-text-muted">Step 1: Select a Table</p>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full bg-staff-card shadow-xl shadow-slate-200/50 p-6 pb-32">
        <div className="grid grid-cols-2 gap-4">
          {TABLES.map((table) => (
            <motion.button
              key={table.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/staff/table/${table.id}`)}
              className="p-6 rounded-[2rem] border-2 border-staff-border bg-staff-bg/50 flex flex-col items-center gap-4 hover:border-staff-primary transition-all text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-staff-card border border-staff-border flex items-center justify-center text-staff-text-primary font-black text-xl shadow-sm">
                #{table.number}
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-tight text-staff-text-primary">Open Order</span>
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

