import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, LayoutGrid, Monitor, Users } from 'lucide-react';
import { usePos } from '../../context/PosContext';

const statusClass = {
  blank: 'border-emerald-500/30 bg-white text-slate-500',
  'running-kot': 'border-amber-500 bg-amber-50 text-slate-900',
  printed: 'border-blue-500 bg-blue-50 text-slate-900',
  paid: 'border-emerald-500 bg-emerald-50 text-slate-900',
  'on-hold': 'border-slate-400 bg-slate-50 text-slate-700'
};

export default function TableLayout() {
  const navigate = useNavigate();
  const { tables, sections } = usePos();
  const [selectedZone, setSelectedZone] = useState('all');

  const visibleSections = useMemo(() => {
    return sections.filter((section) => section.type !== 'CAR-SERVICE');
  }, [sections]);

  const visibleTables = useMemo(() => {
    return tables
      .filter((table) => selectedZone === 'all' || table.sectionId === selectedZone)
      .map((table, index) => ({
        ...table,
        index,
        sectionLabel: sections.find((section) => section.id === table.sectionId)?.label || table.sectionId || 'Floor'
      }));
  }, [sections, selectedZone, tables]);

  const occupiedCount = visibleTables.filter((table) => table.status && table.status !== 'blank').length;
  const occupancy = visibleTables.length ? Math.round((occupiedCount / visibleTables.length) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-[#F4F4F7] animate-in fade-in duration-500 overflow-hidden">
      <header className="px-8 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex items-center gap-6">
            <h1 className="text-base font-bold text-gray-700 uppercase tracking-tight">Tables</h1>
            <div className="flex border-b border-transparent">
              <button 
                onClick={() => { navigate('/pos/tables'); }} 
                className="px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-900 outline-none"
              >
                Grid View
              </button>
              <button 
                onClick={() => { navigate('/pos/tables/layout'); }} 
                className="px-3 py-2 text-xs font-black uppercase tracking-wider text-[#E1261C] border-b-2 border-[#E1261C] outline-none"
              >
                Floor Layout
              </button>
              <button 
                onClick={() => { navigate('/pos/tables/list'); }} 
                className="px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-900 outline-none"
              >
                Registry List
              </button>
              <button 
                onClick={() => { navigate('/pos/tables/reservations'); }} 
                className="px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-900 outline-none"
              >
                Reservations
              </button>
            </div>
          </div>
          <div className="flex bg-slate-50 p-1 border border-slate-100 rounded">
            <button
              onClick={() => setSelectedZone('all')}
              className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${selectedZone === 'all' ? 'bg-[#E1261C] text-white shadow-md shadow-slate-900/10' : 'text-slate-400 hover:text-slate-900'}`}
            >
              All Zones
            </button>
            {visibleSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedZone(section.id)}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${selectedZone === section.id ? 'bg-[#E1261C] text-white shadow-md shadow-slate-900/10' : 'text-slate-400 hover:text-slate-900'}`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8 px-2">
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-emerald-500 shadow-sm" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Available</span></div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-amber-500 shadow-sm" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Running KOT</span></div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-blue-500 shadow-sm" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Bill Printed</span></div>
        </div>
      </header>

      <div className="flex-1 relative p-10 overflow-auto bg-[#F8F9FA]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {visibleTables.length === 0 ? (
            <div className="col-span-full py-32 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">No tables configured for this zone</div>
          ) : visibleTables.map((table) => (
            <div key={table._id || table.id} className="flex flex-col items-center gap-3 group transition-all">
              <div className={`w-20 h-20 rounded-lg border-2 flex items-center justify-center transition-all shadow-xl ${statusClass[table.status] || statusClass.blank}`}>
                <div className="flex flex-col items-center">
                  <span className="text-[12px] font-black tracking-tight">{table.name}</span>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: Math.min(Number(table.capacity || 4), 8) }).map((_, index) => (
                      <div key={index} className="w-1 h-1 rounded-full bg-slate-300" />
                    ))}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#E1261C] rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-lg">
                {table.sectionLabel} | {table.capacity || 4} pax
              </span>
            </div>
          ))}
        </div>
      </div>

      <footer className="h-20 bg-white border-t border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Occupancy</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${occupancy}%` }} />
              </div>
              <span className="text-[11px] font-black text-slate-900 uppercase">{occupancy}% Capacity</span>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Users size={14} />
            {occupiedCount} active tables
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Monitor size={14} />
            {visibleTables.length} visible
          </div>
        </div>
        <button className="h-10 px-6 bg-stone-50 text-[#E1261C] border border-stone-100 rounded-md text-[10px] font-black hover:bg-stone-100 transition-colors flex items-center gap-1.5 uppercase tracking-wider shadow-sm">
          <Layers size={14} />
          Synced Layout
          <LayoutGrid size={14} />
        </button>
      </footer>
    </div>
  );
}
