import { motion } from 'framer-motion';
import { UserCircle, LogOut, Shield, MapPin, Award, Star, Clock, ChevronRight } from 'lucide-react';
import { StaffNavbar } from '../components/StaffNavbar';
import { useNavigate } from 'react-router-dom';

export default function MyProfile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('staff_access');
    navigate('/staff/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white px-6 pt-12 pb-12 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-900/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-[2.5rem] bg-slate-900 flex items-center justify-center text-white mb-4 shadow-2xl shadow-slate-900/20">
            <UserCircle size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Arjun Mehra</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
            <Shield size={10} className="text-slate-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Senior Captain</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full bg-white shadow-xl shadow-slate-200/50 p-6 pb-32 space-y-8">
        {/* Performance Snapshot */}
        <section className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center text-center gap-2">
            <Award size={20} className="text-orange-500" />
            <div>
              <span className="text-sm font-black text-slate-900">Top Rated</span>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Jan 2024</p>
            </div>
          </div>
          <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center text-center gap-2">
            <Star size={20} className="text-yellow-500" />
            <div>
              <span className="text-sm font-black text-slate-900">4.9 / 5.0</span>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Guest Satisfaction</p>
            </div>
          </div>
        </section>

        {/* Menu Items */}
        <section className="space-y-3">
          <button 
            onClick={() => navigate('/staff/attendance')}
            className="w-full p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 flex items-center justify-between group hover:bg-white transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                <Clock size={18} />
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-slate-900">My Attendance</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shift Logs & History</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </button>

          <button className="w-full p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 flex items-center justify-between group hover:bg-white transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                <MapPin size={18} />
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-slate-900">Assigned Zone</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Dining Floor</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </button>
        </section>

        {/* Logout Button */}
        <section>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-full py-5 bg-rose-50 text-rose-500 border border-rose-100 rounded-[2rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-rose-500 hover:text-white transition-all"
          >
            <LogOut size={18} /> Logout System
          </motion.button>
        </section>

        <p className="text-center text-[9px] font-black uppercase tracking-[0.3em] text-slate-200">
          App Version 2.4.0 (Staff Build)
        </p>
      </main>

      <StaffNavbar activeTab="profile" />
    </div>
  );
}

