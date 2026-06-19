import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Eye, RefreshCw, Search, ShieldAlert, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../../utils/api';
import { usePos } from '../../context/PosContext';
import { playClickSound } from '../../utils/sounds';

const formatMoney = (value = 0) => `Rs ${Number(value || 0).toLocaleString()}`;

export default function CancelledOrders() {
  const { storeSettings, calculateTaxes } = usePos();
  const [orders, setOrders] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamVal = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(searchParamVal);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

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
              <span className="text-[9px] font-black uppercase tracking-widest">Tracking Active</span>
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
                  <button 
                    onClick={() => { playClickSound(); setSelectedOrderDetails(order); }}
                    className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded transition-all outline-none"
                    title="View Details"
                  >
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
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-tight mb-1">Important Notice</h4>
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed">
              Cancelled orders are saved in order history and should be reviewed against manager approvals and logs.
            </p>
          </div>
        </div>
      </div>

      {/* Detail View Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">Cancelled Order Detail</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Order ID: {selectedOrderDetails.orderNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedOrderDetails(null)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar space-y-6">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Type / Destination</span>
                  <span className="text-xs font-black text-slate-700 uppercase">{selectedOrderDetails.table?.name || selectedOrderDetails.carNumber || selectedOrderDetails.orderType}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Biller / Waiter</span>
                  <span className="text-xs font-black text-slate-700 uppercase">{selectedOrderDetails.waiter?.name || 'POS Terminal'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Created At</span>
                  <span className="text-xs font-bold text-slate-600">{new Date(selectedOrderDetails.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Cancelled At</span>
                  <span className="text-xs font-bold text-rose-600">{new Date(selectedOrderDetails.cancelledAt || selectedOrderDetails.updatedAt).toLocaleString()}</span>
                </div>
              </div>

              {selectedOrderDetails.customer && (selectedOrderDetails.customer.name || selectedOrderDetails.customer.phone) && (
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100/50">
                  <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-wider mb-2">Customer Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Name</span>
                      <span className="font-bold text-slate-700">{selectedOrderDetails.customer.name || 'Walk-in'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Phone</span>
                      <span className="font-bold text-slate-700">{selectedOrderDetails.customer.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Ordered Items</h4>
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-4 py-2.5 font-black text-slate-500 uppercase tracking-wider">Item Name</th>
                        <th className="px-4 py-2.5 font-black text-slate-500 uppercase tracking-wider text-center">Qty</th>
                        <th className="px-4 py-2.5 font-black text-slate-500 uppercase tracking-wider text-right">Price</th>
                        <th className="px-4 py-2.5 font-black text-slate-500 uppercase tracking-wider text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(selectedOrderDetails.kots || []).flatMap(kot => kot.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/40 text-slate-700 line-through">
                          <td className="px-4 py-3 font-semibold uppercase">
                            {item.name}
                            <span className="ml-2 text-[8px] font-black bg-rose-100 text-rose-600 px-1 py-0.5 rounded">CANCELLED</span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-bold">{formatMoney(item.price)}</td>
                          <td className="px-4 py-3 text-right font-bold">{formatMoney(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cancellation reason */}
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-lg">
                <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest block mb-1">Cancellation Reason</span>
                <p className="text-xs font-bold text-rose-700">{selectedOrderDetails.cancellationReason || 'Cleared from POS terminal'}</p>
              </div>

              {/* Pricing Summary */}
              {(() => {
                const sub = selectedOrderDetails.subtotal || 0;
                const tot = selectedOrderDetails.totalAmount || 0;
                const disc = selectedOrderDetails.discount?.amount || 0;
                const taxAmt = (selectedOrderDetails.taxes || []).reduce((sum, t) => sum + Number(t.amount || 0), 0);
                const isExclusive = sub > 0 && Math.abs(sub + taxAmt - tot) < 2.0;
                let displaySub = sub;
                if (isExclusive) {
                  displaySub = sub + taxAmt;
                  if (Math.abs(displaySub - tot) < 1.0 && disc > 0) {
                    displaySub += disc;
                  }
                }
                return (
                  <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500 font-bold uppercase">
                      <span>Subtotal</span>
                      <span>{formatMoney(displaySub)}</span>
                    </div>
                    {selectedOrderDetails.discount?.amount > 0 && (
                      <div className="flex justify-between text-rose-500 font-bold uppercase">
                        <span>Discount ({selectedOrderDetails.discount.value}{selectedOrderDetails.discount.type === 'PERCENTAGE' ? '%' : ' Rs'})</span>
                        <span>-{formatMoney(selectedOrderDetails.discount.amount)}</span>
                      </div>
                    )}
                    {(selectedOrderDetails.taxes || []).map((tax, idx) => (
                      <div key={idx} className="flex justify-between text-slate-500 font-bold uppercase">
                        <span>{tax.name} ({tax.rate || tax.percentage}%)</span>
                        <span>{formatMoney(tax.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-black text-slate-900 uppercase pt-2 border-t border-dashed border-slate-200">
                      <span>Grand Total</span>
                      <span className="text-blue-600">{formatMoney(selectedOrderDetails.totalAmount)}</span>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
