import { useEffect, useMemo, useState } from 'react';
import { Eye, Globe, MapPin, RefreshCw, Search, Truck } from 'lucide-react';
import api from '../../../../utils/api';
import AdminModal from '../../components/ui/AdminModal';
import { maskQuantity, maskCurrency, calculateMaskedOrderTotal, getReplacedName } from '../../utils/dataMask';

const formatMoney = (value = 0) => `Rs ${Number(value || 0).toLocaleString()}`;

export default function OnlineOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  const handleOpenView = (order) => {
    setViewingOrder(order);
    setIsModalOpen(true);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const [runningRes, billedRes] = await Promise.all([
        api.get('/orders?type=PICKUP&status=running-kot'),
        api.get('/orders?type=PICKUP&status=printed')
      ]);
      const runningData = Array.isArray(runningRes.data) ? runningRes.data : [];
      const billedData = Array.isArray(billedRes.data) ? billedRes.data : [];
      setOrders([...runningData, ...billedData]);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load pickup channel orders');
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
      const text = [order.orderNumber, order.customer?.name, order.customer?.phone, order.orderStatus, order.totalAmount]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return !query || text.includes(query);
    });
  }, [orders, searchQuery]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Online & Pickup Orders</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Real-time pickup and takeaway orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="h-9 px-4 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 outline-none"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-2 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
          <input
            type="text"
            placeholder="Filter pickup orders..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none shadow-sm"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {error && <div className="rounded border border-rose-100 bg-rose-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600">{error}</div>}

      {loading ? (
        <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading pickup channel...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">No pickup channel orders found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white border border-slate-100 rounded-sm p-5 hover:border-blue-500/30 transition-all hover:shadow-xl group relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-12 h-12 bg-slate-50 rotate-45 group-hover:bg-blue-50 transition-colors" />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Pickup Order</span>
                </div>
                <span className="text-[9px] font-black text-slate-400 tracking-widest">#{order.orderNumber}</span>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">{getReplacedName(order.customer?.name || 'Walk-in Pickup')}</h4>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin size={10} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">{order.customer?.phone || order.customer?.locality || 'Counter pickup'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total</div>
                  <div className="text-xs font-black text-blue-600 tracking-tighter">{formatMoney(calculateMaskedOrderTotal(order))}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenView(order)}
                    className="p-1.5 hover:bg-slate-50 rounded-sm text-slate-400 hover:text-slate-900 outline-none transition-colors"
                  ><Eye size={14} /></button>
                  <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-600 rounded-sm">
                    <Truck size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">{order.orderStatus}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={viewingOrder ? `Audit Order ${viewingOrder.orderNumber}` : 'Order Details'}
        subtitle="Pickup Order Details"
      >
        {viewingOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Customer</label>
                <div className="text-xs font-black text-slate-900 uppercase">{getReplacedName(viewingOrder.customer?.name || 'Walk-in Pickup')}</div>
              </div>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Channel</label>
                <div className="text-xs font-black text-slate-900 uppercase">{viewingOrder.orderType}</div>
              </div>
            </div>

            {viewingOrder.customer?.phone && (
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contact Number</label>
                <div className="text-xs font-bold text-slate-600 uppercase">{viewingOrder.customer.phone}</div>
              </div>
            )}

            <div className="border border-slate-100 rounded-sm p-4 max-h-60 overflow-y-auto bg-slate-50">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Order Items</label>
              <div className="space-y-2">
                {viewingOrder.kots.flatMap(k => k.items).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-0">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 uppercase">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 font-bold">Qty: {maskQuantity(item.quantity)}</span>
                      <span className="text-slate-900 font-black">₹{maskCurrency(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border border-slate-100 rounded-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Order Summary</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {maskQuantity(viewingOrder.kots.reduce((acc, k) => acc + k.items.length, 0))} Items
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase">Subtotal</span>
                  <span className="text-slate-900 font-black">₹{maskCurrency(viewingOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase">Taxes</span>
                  <span className="text-slate-900 font-black">₹{maskCurrency(viewingOrder.totalAmount - viewingOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-50 flex justify-between text-sm">
                  <span className="text-slate-900 font-black uppercase">Total</span>
                  <span className="text-blue-600 font-black">₹{calculateMaskedOrderTotal(viewingOrder).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
