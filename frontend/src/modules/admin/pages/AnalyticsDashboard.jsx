import { useEffect, useMemo, useState } from 'react';
import {
  Activity, BarChart3, Download, DollarSign, RefreshCw,
  ShoppingBag, TrendingUp, Users, Zap
} from 'lucide-react';
import api from '../../../utils/api';
import { exportToCSV } from '../../../utils/csvExport';

const formatMoney = (value = 0) => `Rs ${Number(value || 0).toLocaleString()}`;

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/orders')
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const derived = useMemo(() => {
    const completed = orders.filter((order) => order.orderStatus === 'COMPLETED');
    const cancelled = orders.filter((order) => order.orderStatus === 'CANCELLED');
    const totalRevenue = stats?.sales?.month?.total || 0;
    const orderCount = stats?.sales?.month?.count || completed.length;
    const avgTicket = orderCount ? totalRevenue / orderCount : 0;
    const efficiency = orders.length ? Math.round((completed.length / (completed.length + cancelled.length || 1)) * 100) : 0;
    return { completed, cancelled, totalRevenue, orderCount, avgTicket, efficiency };
  }, [orders, stats]);

  const exportCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Monthly Revenue', derived.totalRevenue],
      ['Monthly Orders', derived.orderCount],
      ['Average Ticket', Math.round(derived.avgTicket)],
      ['Completion Efficiency', `${derived.efficiency}%`],
      ['Customers', stats?.customers || 0]
    ];
    exportToCSV(rows, `analytics_snapshot_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Intelligence & Frameworks</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Live business analysis from orders, sales, customers, and expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            className="h-9 px-4 bg-white border border-slate-200 text-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={exportCsv}
            className="h-9 px-4 bg-white border border-slate-200 text-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {error && <div className="rounded border border-rose-100 bg-rose-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Month Revenue', value: formatMoney(derived.totalRevenue), icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Customers', value: (stats?.customers || 0).toLocaleString(), icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Avg Ticket Size', value: formatMoney(derived.avgTicket), icon: ShoppingBag, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Completion Rate', value: `${derived.efficiency}%`, icon: Zap, color: 'text-slate-500', bg: 'bg-slate-50' }
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm relative overflow-hidden group">
            <div className={`w-10 h-10 ${kpi.bg} ${kpi.color} rounded-sm flex items-center justify-center mb-4`}>
              <kpi.icon size={20} />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{loading && !stats ? '...' : kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-100 rounded-sm shadow-sm p-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Hourly Sales</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Today revenue by hour</p>
            </div>
            <BarChart3 size={20} className="text-slate-200" />
          </div>
          <div className="h-64 flex items-end justify-between gap-3 px-2">
            {(stats?.hourlySales || []).length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">No hourly sales yet</div>
            ) : (stats.hourlySales || []).map((item) => {
              const max = Math.max(...stats.hourlySales.map((entry) => entry.total || 0), 1);
              return (
                <div key={item._id} className="flex-1 group relative flex flex-col items-center h-full justify-end">
                  <div className="w-full bg-slate-900 rounded-t-sm transition-colors" style={{ height: `${Math.max(6, ((item.total || 0) / max) * 100)}%` }} />
                  <span className="mt-2 text-[8px] font-black text-slate-400">{item._id}:00</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-sm shadow-sm p-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Top Items</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Monthly item velocity</p>
            </div>
            <TrendingUp size={20} className="text-slate-200" />
          </div>
          <div className="space-y-5">
            {(stats?.topItems || []).length === 0 ? (
              <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">No completed item sales yet</div>
            ) : (stats.topItems || []).map((item) => {
              const max = Math.max(...stats.topItems.map((entry) => entry.count || 0), 1);
              return (
                <div key={item._id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-900 tracking-tight">{item._id}</span>
                    <span className="text-[10px] font-black text-slate-400">{item.count} sold</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900" style={{ width: `${((item.count || 0) / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-slate-900 p-4 rounded-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity size={16} className="text-emerald-400" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Live analytics synchronized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
