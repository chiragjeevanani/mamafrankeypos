import { useMemo, useState } from 'react';
import { CheckCircle2, Layout, Monitor, Search, Table, Users } from 'lucide-react';
import { usePos } from '../../context/PosContext';

const statusStyles = {
  blank: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'running-kot': 'bg-amber-50 text-amber-600 border-amber-100',
  printed: 'bg-blue-50 text-blue-600 border-blue-100',
  paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'on-hold': 'bg-slate-100 text-slate-500 border-slate-200'
};

export default function TableList() {
  const { tables, sections } = usePos();
  const [searchQuery, setSearchQuery] = useState('');

  const rows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tables
      .map((table) => ({
        ...table,
        sectionLabel: sections.find((section) => section.id === table.sectionId)?.label || table.sectionId || 'Unassigned'
      }))
      .filter((table) => {
        const text = [table.name, table.sectionLabel, table.status].join(' ').toLowerCase();
        return !query || text.includes(query);
      });
  }, [searchQuery, sections, tables]);

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Table Management Registry</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live table settings and capacity information</p>
          </div>
          <div className="h-10 px-4 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
            <CheckCircle2 size={14} />
            {rows.length} Tables
          </div>
        </div>

        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search by table name or zone..."
            className="w-full bg-slate-50 border border-slate-100 rounded py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        {rows.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">No tables found</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {rows.map((table) => (
              <div key={table._id || table.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:border-blue-300 hover:shadow-xl hover:shadow-[#E1261C]/20 transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-all bg-slate-50 text-slate-500">
                      <Layout size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{table.name}</h3>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded">{table.sectionLabel}</span>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${statusStyles[table.status] || statusStyles.blank}`}>
                    {table.status || 'blank'}
                  </span>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users size={14} className="text-slate-400" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Seating Capacity</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-900">{table.capacity || 4} Persons</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor size={14} className="text-slate-400" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Activity Status</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${table.status === 'blank' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-[10px] font-black text-slate-900 uppercase">{table.status === 'blank' ? 'Available' : 'Active'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
