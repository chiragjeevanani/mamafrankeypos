import { useEffect, useRef, useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Download, Eye, Receipt, RefreshCw, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../../utils/api';

const formatMoney = (value = 0) => `Rs ${Number(value || 0).toLocaleString()}`;

const getItemCount = (order) =>
  (order.kots || []).reduce((sum, kot) =>
    sum + (kot.items || []).reduce((itemSum, item) => itemSum + (item.status === 'cancelled' ? 0 : Number(item.quantity || 0)), 0), 0);

export default function CompletedOrders() {
  const [orders, setOrders] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamVal = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(searchParamVal);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const lastFetchedAt = useRef(null); // Cache: skip re-fetch if data < 60s old

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const fetchOrders = async (force = false) => {
    // Skip if we recently fetched and this isn't a forced refresh
    if (!force && lastFetchedAt.current && Date.now() - lastFetchedAt.current < 60000) {
      return;
    }
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/orders?status=completed');
      setOrders(data || []);
      lastFetchedAt.current = Date.now();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load completed orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const text = [order.orderNumber, order.table?.name, order.orderType, order.paymentMethod, order.totalAmount]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return !query || text.includes(query);
    });
  }, [orders, searchQuery]);

  const exportCsv = () => {
    const rows = [
      ['Order', 'Completed At', 'Type', 'Table', 'Payment', 'Items', 'Total'],
      ...filteredOrders.map((order) => [
        order.orderNumber,
        order.completedAt || '',
        order.orderType || '',
        order.table?.name || order.carNumber || '',
        order.paymentMethod || '',
        getItemCount(order),
        order.totalAmount || 0
      ])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = `completed_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">Completed Order History</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review settled transactions and payment records</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-10 px-4 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-100 flex items-center gap-2 outline-none">
              <Calendar size={14} />
              Today
            </button>
            <button
              onClick={exportCsv}
              className="h-10 px-4 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 outline-none"
            >
              <Download size={14} />
              Export History
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search by order, table, payment, or amount..."
              className="w-full bg-slate-50 border border-slate-100 rounded py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchParams(event.target.value ? { search: event.target.value } : {});
              }}
            />
          </div>
          <button
            onClick={() => fetchOrders(true)}
            className="h-10 px-4 bg-white border border-slate-200 text-slate-500 rounded text-[10px] font-black uppercase tracking-widest hover:text-slate-900 flex items-center gap-2 transition-all outline-none"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        {error && <div className="mb-5 rounded border border-rose-100 bg-rose-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600">{error}</div>}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Order ID</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Table / Type</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Items</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Payment</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Total</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading completed orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">No completed orders found</td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{order.orderNumber}</span>
                    <p className="text-[9px] font-bold text-slate-400 leading-none mt-1">{order.completedAt ? new Date(order.completedAt).toLocaleString() : '--'}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{order.table?.name || order.carNumber || order.orderType}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getItemCount(order)} Items</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 size={10} /> Paid
                      </span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em]">{order.paymentMethod || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-slate-950 tracking-tighter">{formatMoney(order.totalAmount)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-500 rounded transition-all outline-none border border-transparent hover:border-slate-100"><Eye size={14} /></button>
                      <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded transition-all outline-none border border-transparent hover:border-slate-100"><Receipt size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Showing {filteredOrders.length} completed orders</span>
          </div>
        </div>
      </div>
    </div>
  );
}
