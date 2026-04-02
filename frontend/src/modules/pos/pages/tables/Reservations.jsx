
import React, { useState } from 'react';
import { 
  Calendar, Clock, Users, Phone, 
  Search, Plus, Filter, CheckCircle2,
  XCircle, ArrowRight, User
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_RESERVATIONS = [
  { id: 1, name: 'Rahul Sharma', time: '19:30', date: 'TODAY', guests: 4, table: 'T-05', status: 'confirmed' },
  { id: 2, name: 'Anita Verma', time: '20:00', date: 'TODAY', guests: 2, table: 'T-02', status: 'pending' },
  { id: 3, name: 'Vikram Das', time: '21:15', date: 'TOMORROW', guests: 6, table: 'T-VIP', status: 'confirmed' },
  { id: 4, name: 'Priya Singh', time: '13:00', date: 'TOMORROW', guests: 2, table: 'T-01', status: 'confirmed' },
];

export default function Reservations() {
  const [activeView, setActiveView] = useState('upcoming');

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500 overflow-hidden">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Restaurant Reservations</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Guest Bookings & Table Assignments</p>
          </div>
          <div className="flex bg-slate-50 p-1 border border-slate-100 rounded">
            <button 
              onClick={() => setActiveView('upcoming')}
              className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${activeView === 'upcoming' ? 'bg-[#E1261C] text-white shadow-md' : 'text-slate-400 hover:text-slate-900'}`}
            >
              List View
            </button>
            <button 
              onClick={() => setActiveView('calendar')}
              className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${activeView === 'calendar' ? 'bg-[#E1261C] text-white shadow-md' : 'text-slate-400 hover:text-slate-900'}`}
            >
              Calendar View
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH RESERVATIONS BY NAME OR CONTACT ID..."
              className="w-full bg-slate-50 border border-slate-100 rounded py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all underline decoration-transparent"
            />
          </div>
          <button className="h-10 px-6 bg-[#E1261C] text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 outline-none">
            <Plus size={14} />
            Register Booking
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {['TODAY', 'TOMORROW'].map(day => (
            <div key={day} className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">{day} BOOKINGS</span>
                <div className="h-px bg-slate-100 flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_RESERVATIONS.filter(r => r.date === day).map(res => (
                  <motion.div 
                    key={res.id}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-blue-300 transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#E1261C] group-hover:text-white transition-all">
                          <User size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{res.name}</h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">+91 98765 432XX</span>
                        </div>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all ${
                        res.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                      }`}>
                        {res.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 border-t border-slate-50 pt-4">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-slate-400">
                             <Clock size={10} />
                             <span className="text-[8px] font-black uppercase tracking-widest leading-none">Arrival</span>
                          </div>
                          <span className="text-[11px] font-black text-slate-900 leading-none">{res.time}</span>
                       </div>
                       <div className="flex flex-col gap-1 border-x border-slate-50 px-3">
                          <div className="flex items-center gap-1.5 text-slate-400">
                             <Users size={10} />
                             <span className="text-[8px] font-black uppercase tracking-widest leading-none">Guests</span>
                          </div>
                          <span className="text-[11px] font-black text-slate-900 leading-none">{res.guests} PAX</span>
                       </div>
                       <div className="flex flex-col gap-1 pl-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-slate-400">
                             <span className="text-[8px] font-black uppercase tracking-widest leading-none">Assigned</span>
                          </div>
                          <span className="text-[11px] font-black text-[#E1261C] leading-none">{res.table}</span>
                       </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                       <button className="flex-1 py-1.5 bg-[#E1261C] text-white rounded text-[8px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                          <CheckCircle2 size={10} />
                          Check-In
                       </button>
                       <button className="flex-1 py-1.5 bg-slate-50 text-slate-400 border border-slate-200 rounded text-[8px] font-black uppercase tracking-widest hover:text-rose-600 transition-all flex items-center justify-center gap-2">
                          <XCircle size={10} />
                          No Show
                       </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="h-16 bg-white border-t border-slate-100 px-8 flex items-center justify-center shrink-0">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded bg-blue-600 shadow-lg shadow-blue-600/20" />
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Online Booking</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded bg-slate-400 shadow-sm" />
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Direct Booking</span>
            </div>
         </div>
      </footer>
    </div>
  );
}
