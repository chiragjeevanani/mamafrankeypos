import { motion } from 'framer-motion';
import { 
  LayoutGrid, 
  Map, 
  Clock, 
  Zap, 
  Users, 
  ChefHat, 
  Bell, 
  TrendingUp,
  PlusCircle,
  Coffee
} from 'lucide-react';
import { StaffNavbar } from '../components/StaffNavbar';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white px-6 pt-12 pb-6 border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{today}</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shift Hub</h1>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200"
          >
            <Bell size={20} />
          </motion.button>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full bg-white shadow-xl shadow-slate-200/50 p-6 pb-32 space-y-8">
        {/* Quick Stats Grid */}
        <section>
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/staff/tables')}
              className="p-5 rounded-[2rem] bg-slate-900 text-white shadow-xl shadow-slate-900/10 flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Map size={20} className="text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1">My Tables</span>
                <span className="text-3xl font-black">04</span>
              </div>
              <div className="absolute top-4 right-4 text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              </div>
            </motion.div>

            <motion.div 
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/staff/active-orders')}
              className="p-5 rounded-[2rem] bg-orange-500 text-white shadow-xl shadow-brand-500/10 flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1">Active Room</span>
                <span className="text-3xl font-black">12</span>
              </div>
            </motion.div>

            <motion.div 
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/staff/ready-orders')}
              className="p-5 rounded-[2rem] bg-emerald-500 text-white shadow-xl shadow-emerald-500/10 flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ChefHat size={20} className="text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1">Ready Pickups</span>
                <span className="text-3xl font-black">02</span>
              </div>
            </motion.div>

            <motion.div 
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/staff/attendance')}
              className="p-5 rounded-[2rem] bg-blue-500 text-white shadow-xl shadow-blue-500/10 flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Clock size={20} className="text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1">Attendance</span>
                <span className="text-sm font-black uppercase mt-2 block">Punched In</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-2">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/staff/create-order')}
              className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all text-left"
            >
              <PlusCircle size={20} className="text-slate-900" />
              <span className="text-xs font-black uppercase tracking-tight text-slate-900">New Order</span>
            </button>
            <button 
              onClick={() => navigate('/staff/customers/add')}
              className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all text-left"
            >
              <Users size={20} className="text-slate-900" />
              <span className="text-xs font-black uppercase tracking-tight text-slate-900">Add Guest</span>
            </button>
          </div>
        </section>

        {/* Live Performance */}
        <section className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Daily Pulse</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shift Performance</p>
            </div>
            <TrendingUp size={24} className="text-emerald-500" />
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Service Speed</span>
                <span className="text-sm font-black text-slate-900">92%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '92%' }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Table Turnover</span>
                <span className="text-sm font-black text-slate-900">76%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '76%' }}
                  className="h-full bg-orange-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Break Note */}
        <div className="p-6 rounded-3xl border-2 border-dashed border-slate-100 flex items-center gap-4 text-slate-400">
          <Coffee size={24} strokeWidth={1.5} />
          <p className="text-[11px] font-medium leading-relaxed uppercase tracking-tight italic">
            "Keep the energy high, it's a busy weekend ahead!"
          </p>
        </div>
      </main>

      <StaffNavbar activeTab="dashboard" />
    </div>
  );
}

