import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Download, Eye, RefreshCw, Search, XCircle } from 'lucide-react';
import api from '../../../../utils/api';
import { exportToCSV } from '../../../../utils/csvExport';
import AdminModal from '../../components/ui/AdminModal';
import { maskQuantity, maskCurrency, calculateMaskedOrderTotal, getReplacedName } from '../../utils/dataMask';
import OnscreenInvoice from '../../../../components/shared/OnscreenInvoice';

const formatMoney = (value = 0) => `Rs ${Number(value || 0).toLocaleString()}`;

export default function CancelledOrders() {
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
      const text = [order.orderNumber, order.orderType, order.table?.name, order.cancellationReason, order.totalAmount]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return !query || text.includes(query);
    });
  }, [orders, searchQuery]);

  const exportCsv = () => {
    const rows = [
      ['Order', 'Type', 'Source', 'Reason', 'Cancelled At', 'Lost Value'],
      ...filteredOrders.map((order) => [
        order.orderNumber,
        order.orderType || '',
        order.table?.name || order.carNumber || '',
        order.cancellationReason || '',
        order.cancelledAt || '',
        calculateMaskedOrderTotal(order).toFixed(2)
      ])
    ];
    exportToCSV(rows, `cancelled_orders_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase text-rose-600">Cancelled Orders Log</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Log of all cancelled order transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={exportCsv}
            className="px-4 py-2 border border-rose-100 bg-rose-50 text-rose-600 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-2 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors" size={14} />
          <input
            type="text"
            placeholder="Filter cancelled orders..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none shadow-sm"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {error && <div className="rounded border border-rose-100 bg-rose-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600">{error}</div>}

      <div className="bg-white border border-slate-100 rounded-sm overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason for Cancellation</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Order Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Channel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading cancelled orders...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">No cancelled orders found</td></tr>
            ) : filteredOrders.map((order) => (
              <tr key={order._id} className="hover:bg-rose-50/30 group transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight">#{order.orderNumber}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : '--'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={12} className="text-rose-500" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{order.cancellationReason || 'Not specified'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs font-black text-rose-600 tracking-tighter">- {formatMoney(calculateMaskedOrderTotal(order))}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">Cancelled</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{order.orderType}</span>
                    <button 
                      onClick={() => handleOpenView(order)}
                      className="p-1.5 hover:bg-white rounded-sm text-slate-400 hover:text-slate-900 shadow-sm transition-colors outline-none"
                    ><Eye size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <XCircle size={14} className="text-rose-500" />
        {filteredOrders.length} cancellation records loaded
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={viewingOrder ? `Audit Order ${viewingOrder.orderNumber}` : 'Order Details'}
        subtitle="Cancelled Order Details"
      >
        {viewingOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Customer</label>
                <div className="text-xs font-black text-slate-900 uppercase">{getReplacedName(viewingOrder.customer?.name || viewingOrder.carNumber || 'N/A')}</div>
              </div>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Channel</label>
                <div className="text-xs font-black text-slate-900 uppercase">{viewingOrder.orderType}</div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Cancellation Reason</label>
              <div className="text-xs font-bold text-rose-600 uppercase">{viewingOrder.cancellationReason || 'No reason provided'}</div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Cancelled At: {viewingOrder.cancelledAt ? new Date(viewingOrder.cancelledAt).toLocaleString() : 'N/A'}
              </div>
            </div>

            <OnscreenInvoice order={viewingOrder} />
          </div>
        )}
      </AdminModal>
    </div>
  );
}
