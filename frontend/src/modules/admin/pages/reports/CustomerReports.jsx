import { useEffect, useMemo, useState } from 'react';
import { Download, Heart, Search, UserPlus, Users, Zap } from 'lucide-react';
import api from '../../../../utils/api';

const formatMoney = (value = 0) => `Rs ${Number(value || 0).toLocaleString()}`;

export default function CustomerReports() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/customers');
      setCustomers(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load customer reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return customers.filter((customer) => {
      const text = [customer.name, customer.phone, customer.email, customer.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return !query || text.includes(query);
    });
  }, [customers, searchQuery]);

  const stats = useMemo(() => {
    const totalSpent = filteredCustomers.reduce((sum, customer) => sum + Number(customer.totalSpent || 0), 0);
    const totalVisits = filteredCustomers.reduce((sum, customer) => sum + Number(customer.totalVisits || 0), 0);
    return {
      totalCustomers: filteredCustomers.length,
      totalSpent,
      avgLtv: filteredCustomers.length ? totalSpent / filteredCustomers.length : 0,
      repeatRate: filteredCustomers.length
        ? Math.round((filteredCustomers.filter((customer) => Number(customer.totalVisits || 0) > 1).length / filteredCustomers.length) * 100)
        : 0,
      totalVisits
    };
  }, [filteredCustomers]);

  const exportCsv = () => {
    const rows = [
      ['Name', 'Phone', 'Email', 'Visits', 'Total Spent', 'Loyalty Points', 'Last Visit'],
      ...filteredCustomers.map((customer) => [
        customer.name || '',
        customer.phone || '',
        customer.email || '',
        customer.totalVisits || 0,
        customer.totalSpent || 0,
        customer.loyaltyPoints || 0,
        customer.lastVisit || ''
      ])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = `customer_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Identity Intelligence</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Consumer behavior and retention metrics</p>
        </div>
        <button
          onClick={exportCsv}
          className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none"
        >
          <Download size={14} />
          Cohort Export
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search customers..."
          className="w-full bg-white border border-slate-100 rounded-sm py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

      {error && <div className="rounded border border-rose-100 bg-rose-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Known Customers', value: stats.totalCustomers.toLocaleString(), icon: UserPlus, classes: 'bg-blue-50 text-blue-600' },
          { label: 'Retention Ratio', value: `${stats.repeatRate}%`, icon: Heart, classes: 'bg-rose-50 text-rose-600' },
          { label: 'Average LTV', value: formatMoney(stats.avgLtv), icon: Zap, classes: 'bg-amber-50 text-amber-600' }
        ].map((card) => (
          <div key={card.label} className="bg-white border border-slate-100 p-6 rounded-sm flex items-center gap-4 group">
            <div className={`w-12 h-12 ${card.classes} rounded-sm flex items-center justify-center transition-colors`}>
              <card.icon size={24} />
            </div>
            <div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</div>
              <div className="text-2xl font-black text-slate-900 tracking-tighter">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">High-Velocity Consumer Cohort</h3>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{loading ? 'Syncing' : `${filteredCustomers.length} Profiles`}</span>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement Pulse</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Lifetime Commitment</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Loyalty Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading customers...</td></tr>
            ) : filteredCustomers.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">No customer profiles found</td></tr>
            ) : filteredCustomers
              .slice()
              .sort((a, b) => Number(b.totalSpent || 0) - Number(a.totalSpent || 0))
              .map((customer) => (
                <tr key={customer._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{customer.name || 'Unnamed Customer'}</span>
                    <p className="text-[9px] font-bold text-slate-400 mt-1">{customer.phone || customer.email || 'No contact saved'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-500 tracking-tighter">{customer.totalVisits || 0} interactions</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-black text-slate-900">{formatMoney(customer.totalSpent)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-600">
                      {customer.loyaltyPoints || 0}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <Users size={14} />
        {stats.totalVisits.toLocaleString()} total recorded visits
      </div>
    </div>
  );
}
