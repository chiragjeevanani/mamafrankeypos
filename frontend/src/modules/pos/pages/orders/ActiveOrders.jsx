import { useEffect, useMemo, useState } from 'react';
import { Clock, Receipt, RefreshCw, Search, Timer, Utensils } from 'lucide-react';
import api from '../../../../utils/api';

const formatMoney = (value = 0) => `Rs ${Number(value || 0).toLocaleString()}`;

const getOrderItems = (order) =>
  (order.kots || []).flatMap((kot) =>
    (kot.items || [])
      .filter((item) => item.status !== 'cancelled')
      .map((item) => `${item.name} x${item.quantity}`)
  );

const getOrderAge = (order) => {
  const created = new Date(order.createdAt || order.billedAt || Date.now()).getTime();
  const minutes = Math.max(0, Math.round((Date.now() - created) / 60000));
  return `${minutes} mins`;
};

export default function ActiveOrders() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const [runningRes, billedRes] = await Promise.all([
        api.get('/orders?status=running-kot'),
        api.get('/orders?status=printed')
      ]);
      setOrders([...(runningRes.data || []), ...(billedRes.data || [])]);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load active orders');
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
      const statusMatch = activeTab === 'all' || order.orderStatus === activeTab;
      const text = [
        order.orderNumber,
        order.table?.name,
        order.orderType,
        order.carNumber,
        order.customer?.name,
        order.customer?.phone
      ].filter(Boolean).join(' ').toLowerCase();
      return statusMatch && (!query || text.includes(query));
    });
  }, [activeTab, orders, searchQuery]);

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">Active Order Management</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live KOT monitoring and billed-order tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 px-4 bg-blue-50 text-blue-600 rounded flex items-center gap-2 border border-blue-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">{orders.length} Orders Active</span>
            </div>
            <button
              onClick={fetchOrders}
              className="h-10 px-4 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6 border-b border-slate-100">
            {[
              { key: 'all', label: 'All Active Orders' },
              { key: 'RUNNING', label: 'Running KOT' },
              { key: 'BILLED', label: 'Printed Bills' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] relative transition-all ${activeTab === tab.key ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab.label}
                {activeTab === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search order, table, customer..."
              className="w-full bg-slate-50 border border-slate-100 rounded py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
        {error && <div className="mb-5 rounded border border-rose-100 bg-rose-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600">{error}</div>}
        {loading && filteredOrders.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading active orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">No active orders found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrders.map((order) => {
              const items = getOrderItems(order);
              const readyForCheckout = order.orderStatus === 'BILLED';
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col group transition-all hover:border-blue-300 hover:shadow-xl hover:shadow-blue-600/5"
                >
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center text-white ${readyForCheckout ? 'bg-emerald-500' : 'bg-slate-900'} shadow-lg`}>
                        <Utensils size={14} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-tight text-slate-900">{order.table?.name || order.carNumber || order.orderType}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Order #{order.orderNumber}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${readyForCheckout ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="p-5 flex-1 space-y-4">
                    <div className="space-y-1.5 min-h-16">
                      {items.slice(0, 5).map((item) => (
                        <div key={item} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                          <div className="w-1 h-1 rounded-full bg-slate-300" />
                          {item}
                        </div>
                      ))}
                      {items.length > 5 && <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">+{items.length - 5} more items</p>}
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Timer size={12} className={readyForCheckout ? 'text-emerald-500' : 'text-blue-500'} />
                        <span className="text-[10px] font-black text-slate-900 uppercase">{getOrderAge(order)} elapsed</span>
                      </div>
                      <span className="text-xs font-black text-slate-950">{formatMoney(order.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                    <button className="flex-1 py-2 bg-white border border-slate-200 rounded text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all">
                      Show Details
                    </button>
                    <button className={`flex-1 py-2 rounded text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-md ${readyForCheckout ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                      {readyForCheckout ? 'Collect Payment' : 'Monitor KOT'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
