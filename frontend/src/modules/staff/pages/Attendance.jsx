import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { StaffNavbar } from '../components/StaffNavbar';
import { useNavigate } from 'react-router-dom';

const ATTENDANCE_LOG = [
  { day: 'Today', date: 'Mar 16', status: 'present', shift: '09:00 AM - 06:00 PM', duration: '9h' },
  { day: 'Yesterday', date: 'Mar 15', status: 'present', shift: '08:45 AM - 05:30 PM', duration: '8h 45m' },
  { day: 'Saturday', date: 'Mar 14', status: 'present', shift: '10:00 AM - 11:00 PM', duration: '13h' },
  { day: 'Friday', date: 'Mar 13', status: 'absent', shift: '-', duration: '-' },
  { day: 'Thursday', date: 'Mar 12', status: 'present', shift: '09:15 AM - 06:15 PM', duration: '9h' },
];

export default function Attendance() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-6 py-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-slate-100 rounded-2xl text-slate-900 group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Attendance</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Shift Log</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full bg-white shadow-xl shadow-slate-200/50 p-6 pb-32 space-y-8">
        {/* Monthly Summary */}
        <section className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Days</span>
              <span className="text-3xl font-black italic">24/26</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Overtime</span>
              <span className="text-3xl font-black italic text-orange-400">12h</span>
            </div>
          </div>
        </section>

        {/* Daily Logs */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-2">March Log</h2>
          <div className="space-y-3">
            {ATTENDANCE_LOG.map((log, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-3xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black ${
                    log.status === 'present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    <span className="text-[8px] uppercase">{log.date.split(' ')[0]}</span>
                    <span className="text-lg leading-none">{log.date.split(' ')[1]}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1.5">{log.day}</h3>
                    <div className="flex items-center gap-2 opacity-60">
                      <Clock size={10} />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{log.status === 'present' ? log.shift : 'Leave'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {log.status === 'present' ? (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-slate-900 italic tracking-tighter">{log.duration}</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <CheckCircle2 size={10} className="text-emerald-500" />
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Verified</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-rose-400 italic tracking-tighter">Absent</span>
                      <AlertCircle size={10} className="text-rose-400 mt-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <button className="w-full py-4 border-2 border-dashed border-slate-100 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all flex items-center justify-center gap-2">
          View Full History <ChevronRight size={14} />
        </button>
      </main>

      <StaffNavbar activeTab="profile" />
    </div>
  );
}

