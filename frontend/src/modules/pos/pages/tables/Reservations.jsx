import { Calendar, Plus, Search } from 'lucide-react';

export default function Reservations() {
  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500 overflow-hidden">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Restaurant Reservations</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reservation backend is not configured yet</p>
          </div>
          <button
            disabled
            className="h-10 px-6 bg-slate-200 text-slate-400 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-2 outline-none cursor-not-allowed"
          >
            <Plus size={14} />
            Register Booking
          </button>
        </div>

        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            disabled
            placeholder="Reservation search will activate after reservation storage is added"
            className="w-full bg-slate-50 border border-slate-100 rounded py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none text-slate-300"
          />
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto no-scrollbar flex items-center justify-center">
        <div className="max-w-md text-center bg-white border border-slate-100 rounded-lg p-10 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-5 text-slate-300">
            <Calendar size={28} />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Reservation Module Pending</h2>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-widest leading-relaxed text-slate-400">
            This screen no longer shows mock bookings. Add a reservation model and API before enabling booking actions.
          </p>
        </div>
      </div>
    </div>
  );
}
