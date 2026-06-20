import { useEffect, useRef, useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Download, Eye, Receipt, RefreshCw, Search, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../../utils/api';
import { usePos } from '../../context/PosContext';
import { printBillReceipt } from '../../utils/printBill';
import { playClickSound } from '../../utils/sounds';

const formatMoney = (value = 0) => `Rs ${Number(value || 0).toLocaleString()}`;

const getItemCount = (order) =>
  (order.kots || []).reduce((sum, kot) =>
    sum + (kot.items || []).reduce((itemSum, item) => itemSum + (item.status === 'cancelled' ? 0 : Number(item.quantity || 0)), 0), 0);

export default function CompletedOrders() {
  const { storeSettings, calculateTaxes, user } = usePos();
  const [orders, setOrders] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamVal = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(searchParamVal);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const lastFetchedAt = useRef(null); // Cache: skip re-fetch if data < 60s old
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

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

  const handlePrint = (order) => {
    playClickSound();
    const total = Number(order.totalAmount || 0);
    const taxes = order.taxes?.length ? order.taxes : calculateTaxes(total);
    const tax = taxes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const displayName = order.table?.name || order.carNumber || order.orderType || 'Order';

    printBillReceipt(
      order,
      { name: displayName },
      {
        total,
        subTotal: Number(order.subtotal || total),
        tax,
        discount: order.discount?.amount || 0,
        billerName: order.biller?.name || order.billerName || user?.name || 'Cashier',
        storeInfo: storeSettings,
        orderNumber: order.orderNumber,
        appliedTaxes: taxes
      }
    );
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
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Order ID</th>
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
                <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-100">
                  <td className="px-6 py-4 text-center">
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
                      <button 
                        onClick={() => { playClickSound(); setSelectedOrderDetails(order); }}
                        className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-500 rounded transition-all outline-none border border-transparent hover:border-slate-100"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => handlePrint(order)}
                        className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded transition-all outline-none border border-transparent hover:border-slate-100"
                        title="Print Receipt"
                      >
                        <Receipt size={14} />
                      </button>
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

      {/* Detail View Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">Order Detail View</h3>
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
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Settled At</span>
                  <span className="text-xs font-bold text-slate-600">{new Date(selectedOrderDetails.completedAt || selectedOrderDetails.updatedAt).toLocaleString()}</span>
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
                    {selectedOrderDetails.customer.address && (
                      <div className="col-span-2 mt-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Address</span>
                        <span className="font-bold text-slate-700">{selectedOrderDetails.customer.address}</span>
                      </div>
                    )}
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
                        <tr key={idx} className={`hover:bg-slate-50/40 ${item.status === 'cancelled' ? 'line-through text-slate-400 bg-rose-50/20' : 'text-slate-700'}`}>
                          <td className="px-4 py-3 font-semibold uppercase">
                            {item.name}
                            {item.status === 'cancelled' && <span className="ml-2 text-[8px] font-black bg-rose-100 text-rose-600 px-1 py-0.5 rounded">CANCELLED</span>}
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
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  handlePrint(selectedOrderDetails);
                  setSelectedOrderDetails(null);
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <Receipt size={12} /> Print Receipt
              </button>
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
