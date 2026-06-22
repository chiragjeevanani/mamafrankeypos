import { useEffect, useRef, useMemo, useState } from 'react';
import { 
  Calendar, CheckCircle2, Download, Eye, Receipt, RefreshCw, 
  Search, XCircle, Banknote, CreditCard, Smartphone, ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../../utils/api';
import { exportToCSV } from '../../../../utils/csvExport';
import { usePos } from '../../context/PosContext';
import { printBillReceipt } from '../../utils/printBill';
import { playClickSound } from '../../utils/sounds';

const formatMoney = (value = 0) => `Rs ${Number(value || 0).toLocaleString()}`;

const getItemCount = (order) =>
  (order.kots || []).reduce((sum, kot) =>
    sum + (kot.items || []).reduce((itemSum, item) => itemSum + (item.status === 'cancelled' ? 0 : Number(item.quantity || 0)), 0), 0);

export default function OrderHistory() {
  const { storeSettings, calculateTaxes, user } = usePos();
  const [completedOrders, setCompletedOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamVal = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(searchParamVal);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('completed'); // 'completed' or 'cancelled'
  const lastFetchedAt = useRef(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const fetchOrders = async (force = false) => {
    if (!force && lastFetchedAt.current && Date.now() - lastFetchedAt.current < 60000) {
      return;
    }
    try {
      setLoading(true);
      setError('');
      const [completedRes, cancelledRes] = await Promise.all([
        api.get('/orders?status=completed'),
        api.get('/orders?status=cancelled')
      ]);
      setCompletedOrders(completedRes.data || []);
      setCancelledOrders(cancelledRes.data || []);
      lastFetchedAt.current = Date.now();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load orders history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders by search input based on active tab
  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = activeTab === 'completed' ? completedOrders : cancelledOrders;
    
    return list.filter((order) => {
      const text = [
        order.orderNumber,
        order.table?.name,
        order.orderType,
        order.paymentMethod,
        order.totalAmount,
        order.cancellationReason
      ].filter(Boolean).join(' ').toLowerCase();
      
      return !query || text.includes(query);
    });
  }, [completedOrders, cancelledOrders, activeTab, searchQuery]);

  // Compute stats for completed transactions
  const totalsByMethod = useMemo(() => {
    return completedOrders.reduce((totals, order) => {
      const method = order.paymentMethod || 'Other';
      totals[method] = (totals[method] || 0) + Number(order.totalAmount || 0);
      return totals;
    }, {});
  }, [completedOrders]);

  // Compute fiscal impact for cancelled orders
  const totalLostRevenue = useMemo(() => {
    return cancelledOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  }, [cancelledOrders]);

  const exportCsv = () => {
    playClickSound();
    let rows = [];
    let filename = '';

    if (activeTab === 'completed') {
      rows = [
        ['Order', 'Completed At', 'Type', 'Table/Car', 'Payment Method', 'Items', 'Total'],
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
      filename = `completed_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    } else {
      rows = [
        ['Order', 'Cancelled At', 'Type', 'Table/Car', 'Cancellation Reason', 'Items', 'Lost Value'],
        ...filteredOrders.map((order) => [
          order.orderNumber,
          order.cancelledAt || '',
          order.orderType || '',
          order.table?.name || order.carNumber || '',
          order.cancellationReason || '',
          getItemCount(order),
          order.totalAmount || 0
        ])
      ];
      filename = `cancelled_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    exportToCSV(rows, filename);
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
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500 overflow-hidden">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">Shift History & Audit Logs</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review completed settlements, voided orders, and payment totals</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-10 px-4 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-100 flex items-center gap-2 outline-none">
              <Calendar size={14} />
              Today
            </button>
            <button
              onClick={exportCsv}
              className="h-10 px-4 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 outline-none"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Dynamic Aggregates depending on active tab */}
        {activeTab === 'completed' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[
              { label: 'UPI Revenue', value: totalsByMethod.UPI || 0, color: 'text-blue-600', icon: Smartphone },
              { label: 'Cash Flow', value: totalsByMethod.Cash || totalsByMethod.CASH || 0, color: 'text-emerald-600', icon: Banknote },
              { label: 'Card Volume', value: totalsByMethod.Card || totalsByMethod.CARD || 0, color: 'text-amber-600', icon: CreditCard }
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-50 border border-slate-100 p-4 rounded-lg flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className={`text-lg font-extrabold tracking-tighter ${stat.color}`}>{formatMoney(stat.value)}</h3>
                </div>
                <div className={`w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center ${stat.color} opacity-70`}>
                  <stat.icon size={14} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-lg flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">Fiscal Impact (Voided Value)</p>
                <h3 className="text-lg font-extrabold tracking-tighter text-rose-600">{formatMoney(totalLostRevenue)}</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-rose-100 flex items-center justify-center text-rose-500 opacity-70">
                <ShieldAlert size={14} />
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Voided Tickets</p>
                <h3 className="text-lg font-extrabold tracking-tighter text-slate-800">{cancelledOrders.length} Cancelled</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-500 opacity-70">
                <XCircle size={14} />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-6 border-b border-slate-100 w-full md:w-auto">
            {[
              { key: 'completed', label: `Settled Bills (${completedOrders.length})` },
              { key: 'cancelled', label: `Voided Bills (${cancelledOrders.length})` }
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

          <div className="flex gap-3 w-full md:w-auto items-center">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={activeTab === 'completed' ? "Search by order, table, payment, amount..." : "Search by order, table, reason, amount..."}
                className="w-full bg-slate-50 border border-slate-100 rounded py-2 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all h-10"
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
        </div>
      </header>

      {/* Main Ledger Table */}
      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        {error && <div className="mb-5 rounded border border-rose-100 bg-rose-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600">{error}</div>}
        
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Order ID</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Table / Type</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Items</th>
                {activeTab === 'completed' ? (
                  <>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Payment</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Total</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center text-rose-500">Cancellation Reason</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right text-rose-500">Lost Value</th>
                  </>
                )}
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading order log history...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">No orders matching search criteria</td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50 transition-colors group border-b border-slate-100">
                  <td className="px-6 py-4 text-center">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{order.orderNumber}</span>
                    <p className="text-[9px] font-bold text-slate-400 leading-none mt-1">
                      {new Date(order.completedAt || order.cancelledAt || order.createdAt).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{order.table?.name || order.carNumber || order.orderType}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getItemCount(order)} Items</span>
                  </td>
                  {activeTab === 'completed' ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded border border-rose-100 uppercase tracking-wide">
                          {order.cancellationReason || 'Cleared from POS terminal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-rose-600 tracking-tighter">{formatMoney(order.totalAmount)}</span>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { playClickSound(); setSelectedOrderDetails(order); }}
                        className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-500 rounded transition-all outline-none border border-transparent"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      {activeTab === 'completed' && (
                        <button 
                          onClick={() => handlePrint(order)}
                          className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded transition-all outline-none border border-transparent"
                          title="Print Receipt"
                        >
                          <Receipt size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Showing {filteredOrders.length} {activeTab} orders
            </span>
          </div>
        </div>

        {activeTab === 'cancelled' && (
          <div className="mt-8 p-6 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-4 shadow-sm">
            <AlertTriangle size={20} className="text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-tight mb-1">Important Audit Notice</h4>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed">
                Cancelled orders represent voided guest tickets. They are archived permanently in the audit system for manager reconciliation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Detail View Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">
                  {selectedOrderDetails.orderStatus === 'CANCELLED' ? 'Cancelled Order Details' : 'Settled Order Details'}
                </h3>
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
                  {selectedOrderDetails.orderStatus === 'CANCELLED' ? (
                    <>
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block mb-0.5">Cancelled At</span>
                      <span className="text-xs font-bold text-rose-600">{new Date(selectedOrderDetails.cancelledAt || selectedOrderDetails.updatedAt).toLocaleString()}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Settled At</span>
                      <span className="text-xs font-bold text-slate-600">{new Date(selectedOrderDetails.completedAt || selectedOrderDetails.updatedAt).toLocaleString()}</span>
                    </>
                  )}
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
                      {(selectedOrderDetails.kots || []).flatMap(kot => kot.items || []).map((item, idx) => {
                        const isCancelledItem = item.status === 'cancelled' || selectedOrderDetails.orderStatus === 'CANCELLED';
                        return (
                          <tr key={idx} className={`hover:bg-slate-50/40 ${isCancelledItem ? 'line-through text-slate-400 bg-rose-50/20' : 'text-slate-700'}`}>
                            <td className="px-4 py-3 font-semibold uppercase">
                              {item.name}
                              {isCancelledItem && <span className="ml-2 text-[8px] font-black bg-rose-100 text-rose-600 px-1 py-0.5 rounded">CANCELLED</span>}
                            </td>
                            <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-bold">{formatMoney(item.price)}</td>
                            <td className="px-4 py-3 text-right font-bold">{formatMoney(item.price * item.quantity)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cancellation Reason in Modal */}
              {selectedOrderDetails.orderStatus === 'CANCELLED' && (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-lg">
                  <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest block mb-1">Cancellation Reason</span>
                  <p className="text-xs font-bold text-rose-700">{selectedOrderDetails.cancellationReason || 'Cleared from POS terminal'}</p>
                </div>
              )}

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
                      <span>{selectedOrderDetails.orderStatus === 'CANCELLED' ? 'Lost Value' : 'Grand Total'}</span>
                      <span className={selectedOrderDetails.orderStatus === 'CANCELLED' ? 'text-rose-600' : 'text-blue-600'}>{formatMoney(selectedOrderDetails.totalAmount)}</span>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              {selectedOrderDetails.orderStatus !== 'CANCELLED' && (
                <button
                  onClick={() => {
                    handlePrint(selectedOrderDetails);
                    setSelectedOrderDetails(null);
                  }}
                  className="px-4 py-2 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  <Receipt size={12} /> Reprint Receipt
                </button>
              )}
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
