import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Eye, RefreshCw, Search, ShieldAlert, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../../utils/api';

const formatMoney = (value = 0) => `Rs ${Number(value || 0).toLocaleString()}`;

export default function CancelledOrders() {
  const [orders, setOrders] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamVal = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(searchParamVal);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/orders?status=cancelled');
      setOrders(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load cancelled orders');
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
      const text = [order.orderNumber, order.table?.name, order.orderType, order.cancellationReason, order.totalAmount]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return !query || text.includes(query);
    });
  }, [orders, searchQuery]);

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Cancelled Orders Management</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review cancelled transactions and operational impact</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded border border-rose-100 shadow-sm">
              <ShieldAlert size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Audit Tracking Active</span>
            </div>
            <button
              onClick={fetchOrders}
              className="h-9 px-4 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 outline-none"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchParams(event.target.value ? { search: event.target.value } : {});
            }}
            placeholder="Search cancelled orders..."
            className="w-full bg-slate-50 border border-slate-100 rounded py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-rose-600 focus:bg-white transition-all"
          />
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        {error && <div className="mb-5 rounded border border-rose-100 bg-rose-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600">{error}</div>}
        {loading ? (
          <div className="h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading cancelled orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">No cancelled orders found</div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between hover:border-rose-200 transition-all group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 opacity-30 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                    <XCircle size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{order.orderNumber}</h3>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded">{order.table?.name || order.carNumber || order.orderType}</span>
                    </div>
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1">Reason: {order.cancellationReason || 'Not specified'}</p>
                    <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">Timestamp: {order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : '--'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 xl:gap-12">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiscal Impact</p>
                    <h4 className="text-lg font-black text-slate-950 tracking-tighter">{formatMoney(order.totalAmount)}</h4>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded inline-block bg-slate-100 text-slate-500 border border-slate-200">
                    Cancelled
                  </span>
                  <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded transition-all outline-none">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-6 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-4 shadow-sm">
          <AlertTriangle size={20} className="text-amber-600 shrink-0" />
          <div>
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-tight mb-1">Operational Protocol Advisory</h4>
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed">
              Cancelled orders are retained in the order ledger and should be reviewed against manager approvals and audit logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
