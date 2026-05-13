import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, Banknote, Calculator, ChevronRight, CreditCard,
  Printer, Receipt, RefreshCw, Send, Smartphone, Table
} from 'lucide-react';
import api from '../../../../utils/api';
import { usePos } from '../../context/PosContext';
import { printBillReceipt } from '../../utils/printBill';

const formatMoney = (value = 0) => `Rs ${Number(value || 0).toLocaleString()}`;

const getItemCount = (order) =>
  (order.kots || []).reduce((sum, kot) =>
    sum + (kot.items || []).reduce((itemSum, item) => itemSum + (item.status === 'cancelled' ? 0 : Number(item.quantity || 0)), 0), 0);

const getDisplayName = (order) => order.table?.name || order.carNumber || order.orderType || 'Order';

export default function GenerateBill() {
  const { user, storeSettings, calculateTaxes } = usePos();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const fetchBillableOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/orders?status=printed');
      setOrders(data || []);
      setSelectedOrder((current) => {
        if (!current) return (data || [])[0] || null;
        return (data || []).find((order) => order._id === current._id) || (data || [])[0] || null;
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load billable orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillableOrders();
  }, []);

  const billSummary = useMemo(() => {
    if (!selectedOrder) return { subtotal: 0, tax: 0, total: 0, taxes: [] };
    const total = Number(selectedOrder.totalAmount || 0);
    const taxes = selectedOrder.taxes?.length ? selectedOrder.taxes : calculateTaxes(total);
    const tax = taxes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return {
      subtotal: Number(selectedOrder.subtotal || Math.max(0, total - tax)),
      tax,
      total,
      taxes
    };
  }, [calculateTaxes, selectedOrder]);

  const handlePrint = () => {
    if (!selectedOrder) return;
    printBillReceipt(
      selectedOrder,
      { name: getDisplayName(selectedOrder) },
      {
        total: billSummary.total,
        subTotal: billSummary.subtotal,
        tax: billSummary.tax,
        discount: selectedOrder.discount?.amount || 0,
        billerName: user?.name,
        storeInfo: storeSettings,
        orderNumber: selectedOrder.orderNumber,
        appliedTaxes: billSummary.taxes
      }
    );
  };

  const handleFinalize = async () => {
    if (!selectedOrder) return;
    try {
      setProcessing(true);
      setError('');
      await api.post(`/orders/${selectedOrder._id}/settle`, {
        paymentMethod,
        taxes: billSummary.taxes,
        totalAmount: billSummary.total
      });
      await fetchBillableOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to settle selected bill');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500 overflow-hidden">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">Guest Billing & Checkout</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Generate receipts and settle printed bills</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 shadow-sm">
              <Calculator size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">{orders.length} Pending</span>
            </div>
            <button
              onClick={fetchBillableOrders}
              className="h-9 px-4 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 outline-none"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {error && <div className="mx-8 mt-4 rounded border border-rose-100 bg-rose-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600">{error}</div>}

      <div className="flex-1 flex overflow-hidden">
        <div className="w-full lg:w-1/2 border-r border-slate-200 overflow-y-auto p-8 no-scrollbar bg-white/50">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Pending Bill Requests</h2>
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading bills...</div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">No printed bills pending settlement</div>
            ) : orders.map((order) => (
              <button
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className={`w-full text-left p-6 rounded-lg border transition-all relative overflow-hidden group ${
                  selectedOrder?._id === order._id ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white border-slate-100 hover:border-blue-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                      selectedOrder?._id === order._id ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'
                    }`}>
                      <Table size={24} />
                    </div>
                    <div>
                      <h3 className={`text-base font-black uppercase tracking-tight ${selectedOrder?._id === order._id ? 'text-white' : 'text-slate-900'}`}>{getDisplayName(order)}</h3>
                      <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedOrder?._id === order._id ? 'text-white/60' : 'text-slate-400'}`}>{getItemCount(order)} items | {order.orderNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${selectedOrder?._id === order._id ? 'text-white/60' : 'text-slate-400'}`}>Total Due</p>
                    <span className={`text-lg font-black tracking-tighter ${selectedOrder?._id === order._id ? 'text-white' : 'text-slate-950'}`}>{formatMoney(order.totalAmount)}</span>
                  </div>
                </div>
                {selectedOrder?._id === order._id && <div className="absolute top-2 right-2 p-1 bg-white/20 rounded-full"><ChevronRight size={14} /></div>}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:block flex-1 overflow-y-auto p-12 no-scrollbar bg-[#F8F9FA]">
          {!selectedOrder ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center mb-6">
                <Receipt size={32} strokeWidth={1} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em]">Select a bill</h3>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-8">
              <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-2xl shadow-slate-900/5 relative">
                <div className="text-center mb-8">
                  <h2 className="text-lg font-extrabold uppercase tracking-tighter text-slate-900">Time To Eat Invoice</h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Terminal #01 | {new Date().toLocaleDateString()}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</span>
                    <span className="text-[11px] font-black text-slate-900 uppercase">{getDisplayName(selectedOrder)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice</span>
                    <span className="text-[11px] font-black text-slate-900 uppercase">{selectedOrder.orderNumber}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                    <span>Items Subtotal</span>
                    <span>{formatMoney(billSummary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                    <span>Tax</span>
                    <span>{formatMoney(billSummary.tax)}</span>
                  </div>
                  <div className="pt-4 border-t-2 border-double border-slate-200 flex justify-between">
                    <span className="text-base font-extrabold text-slate-900 uppercase tracking-tighter">Amount Due</span>
                    <span className="text-xl font-extrabold text-blue-600 tracking-tighter">{formatMoney(billSummary.total)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { method: 'Cash', icon: Banknote },
                    { method: 'Card', icon: CreditCard },
                    { method: 'UPI', icon: Smartphone }
                  ].map((item) => (
                    <button
                      key={item.method}
                      onClick={() => setPaymentMethod(item.method)}
                      className={`flex flex-col items-center gap-2 p-3 border rounded-md transition-all group ${
                        paymentMethod === item.method ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-600 hover:bg-white'
                      }`}
                    >
                      <item.icon size={16} />
                      <span className="text-[8px] font-black uppercase tracking-widest">{item.method}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 hover:bg-slate-50 transition-all outline-none"
                >
                  <Printer size={16} />
                  Print Receipt
                </button>
                <button
                  onClick={handleFinalize}
                  disabled={processing}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all outline-none active:scale-95 disabled:opacity-50"
                >
                  <Send size={16} />
                  {processing ? 'Settling...' : 'Finalize & Close'}
                </button>
              </div>

              <div className="p-4 bg-amber-50 rounded border border-amber-100 flex items-center gap-3">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest">Settling the bill marks the order completed and clears the table.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
