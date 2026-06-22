import { useMemo, useState, useEffect } from 'react';
import { 
  Clock, Receipt, RefreshCw, Search, Timer, Utensils,
  AlertCircle, Banknote, Calculator, ChevronRight, CreditCard,
  Printer, Send, Smartphone, XCircle
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePos } from '../../context/PosContext';
import { playClickSound } from '../../utils/sounds';
import { printBillReceipt } from '../../utils/printBill';
import OnscreenInvoice from '../../../../components/shared/OnscreenInvoice';

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
  // Read orders directly from context — already kept fresh by the 15s heartbeat
  const { 
    orders, carOrders, pickupOrders, refreshOrders,
    user, storeSettings, calculateTaxes, saveOrder, settleOrder 
  } = usePos();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamVal = searchParams.get('search') || '';
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState(searchParamVal);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Checkout overlay state
  const [checkoutOrder, setCheckoutOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Merge all active order maps into a flat list
  const allOrders = useMemo(() => {
    const dineIn = Object.values(orders || {});
    const car = Object.values(carOrders || {});
    const pickup = Object.values(pickupOrders || {});
    return [...dineIn, ...car, ...pickup];
  }, [orders, carOrders, pickupOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allOrders.filter((order) => {
      const statusMatch =
        activeTab === 'all' ||
        order.orderStatus === activeTab ||
        (activeTab === 'RUNNING' && order.status === 'running-kot') ||
        (activeTab === 'BILLED' && (order.orderStatus === 'BILLED' || order.status === 'printed'));
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
  }, [activeTab, allOrders, searchQuery]);

  const handleShowDetails = (order) => {
    playClickSound();
    const isCarOrder = order.orderType === 'CAR-SERVICE';
    const isPickupOrder = order.orderType === 'PICKUP';
    const identifier = order.table?.name || order.carNumber || order._id;
    navigate(`/pos/order/${identifier}`, {
      state: {
        fromCarService: isCarOrder,
        fromPickup: isPickupOrder,
        waiter: order.waiter
      }
    });
  };

  const handleActionClick = (order, readyForCheckout) => {
    playClickSound();
    if (readyForCheckout) {
      setCheckoutOrder(order);
      setCheckoutError('');
    } else {
      handleShowDetails(order);
    }
  };

  const billSummary = useMemo(() => {
    if (!checkoutOrder) return { subtotal: 0, tax: 0, total: 0, taxes: [] };
    const total = Number(checkoutOrder.totalAmount || 0);
    const taxes = checkoutOrder.taxes?.length ? checkoutOrder.taxes : calculateTaxes(total);
    const tax = taxes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const discount = checkoutOrder.discount?.amount || 0;

    let subtotal = checkoutOrder.subtotal || total;
    const isExclusive = subtotal > 0 && Math.abs(subtotal + tax - total) < 2.0;
    if (isExclusive) {
      subtotal += tax;
      if (Math.abs(subtotal - total) < 1.0 && discount > 0) {
        subtotal += discount;
      }
    }

    return {
      subtotal,
      tax,
      total,
      taxes
    };
  }, [calculateTaxes, checkoutOrder]);

  const handlePrint = async () => {
    if (!checkoutOrder) return;
    try {
      setProcessing(true);
      setCheckoutError('');
      let orderToPrint = checkoutOrder;

      // If the order is not yet billed/printed, save/bill it first
      if (checkoutOrder.orderStatus !== 'BILLED') {
        const isCarOrder = checkoutOrder.orderType === 'CAR-SERVICE';
        const isPickupOrder = checkoutOrder.orderType === 'PICKUP';
        const billed = await saveOrder(checkoutOrder._id, { isCarOrder, isPickupOrder });
        orderToPrint = billed;
        setCheckoutOrder(billed);
      }

      printBillReceipt(
        orderToPrint,
        { name: orderToPrint.table?.name || orderToPrint.carNumber || orderToPrint.orderType || 'Order' },
        {
          total: orderToPrint.totalAmount || orderToPrint.total,
          subTotal: orderToPrint.subtotal || orderToPrint.total,
          tax: orderToPrint.taxes?.reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0,
          discount: orderToPrint.discount?.amount || 0,
          billerName: user?.name,
          storeInfo: storeSettings,
          orderNumber: orderToPrint.orderNumber,
          appliedTaxes: orderToPrint.taxes || []
        }
      );
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Unable to generate bill for printing');
    } finally {
      setProcessing(false);
    }
  };

  const handleFinalize = async () => {
    if (!checkoutOrder) return;
    try {
      setProcessing(true);
      setCheckoutError('');
      await settleOrder(checkoutOrder._id, paymentMethod, {
        taxes: billSummary.taxes,
        total: billSummary.total,
        isCarOrder: checkoutOrder.orderType === 'CAR-SERVICE',
        isPickupOrder: checkoutOrder.orderType === 'PICKUP'
      });
      setCheckoutOrder(null);
      await refreshOrders();
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Unable to settle selected bill');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">Active Order Management</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live KOT monitoring and billed-order checkout</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 px-4 bg-blue-50 text-blue-600 rounded flex items-center gap-2 border border-blue-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">{allOrders.length} Orders Active</span>
            </div>
            <button
              onClick={handleRefresh}
              className="h-10 px-4 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
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
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchParams(event.target.value ? { search: event.target.value } : {});
              }}
              placeholder="Search order, table, customer..."
              className="w-full bg-slate-50 border border-slate-100 rounded py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">No active orders found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrders.map((order) => {
              const items = getOrderItems(order);
              const readyForCheckout = order.orderStatus === 'BILLED' || order.status === 'printed';
              return (
                <div
                  key={order._id || order.id}
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
                      {order.orderStatus || order.status}
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
                        <Clock size={12} className={readyForCheckout ? 'text-emerald-500' : 'text-blue-500'} />
                        <span className="text-[10px] font-black text-slate-900 uppercase">{getOrderAge(order)} elapsed</span>
                      </div>
                      <span className="text-xs font-black text-slate-950">{formatMoney(order.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                    <button 
                      onClick={() => handleShowDetails(order)}
                      className="flex-1 py-2 bg-white border border-slate-200 rounded text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all active:scale-95"
                    >
                      Show Details
                    </button>
                    <button 
                      onClick={() => handleActionClick(order, readyForCheckout)}
                      className={`flex-1 py-2 rounded text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-md active:scale-95 ${readyForCheckout ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                    >
                      {readyForCheckout ? 'Collect Payment' : 'Monitor KOT'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Checkout Settle Modal Overlay */}
      {checkoutOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#1C1E22] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">Order Checkout & Settlement</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Order ID: {checkoutOrder.orderNumber}</p>
              </div>
              <button 
                onClick={() => setCheckoutOrder(null)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50">
              
              {/* Left: Invoice Preview */}
              <div className="overflow-y-auto max-h-[60vh] no-scrollbar">
                <OnscreenInvoice order={checkoutOrder} storeSettings={storeSettings} />
              </div>

              {/* Right: Payment Actions */}
              <div className="flex flex-col justify-between space-y-6">
                
                {/* Payment Method Selector */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Select Payment Method</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { method: 'Cash', icon: Banknote },
                      { method: 'Cashless', icon: CreditCard },
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

                {/* Error Message */}
                {checkoutError && (
                  <div className="rounded border border-rose-100 bg-rose-50 px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-rose-600">
                    {checkoutError}
                  </div>
                )}

                {/* Settle Info */}
                <div className="p-4 bg-amber-50 rounded border border-amber-100 flex items-start gap-3 shadow-sm">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed">
                    Settling the bill marks the order completed and clears the table. Please make sure the guest payment is confirmed before final settlement.
                  </p>
                </div>

                {/* Actions Footer */}
                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={handlePrint}
                    disabled={processing}
                    className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all outline-none disabled:opacity-50"
                  >
                    <Printer size={14} />
                    {checkoutOrder.orderStatus !== 'BILLED' ? 'Save & Print' : 'Print Receipt'}
                  </button>
                  <button
                    onClick={handleFinalize}
                    disabled={processing}
                    className="flex-1 py-3.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-md shadow-blue-600/10 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all outline-none disabled:opacity-50"
                  >
                    <Send size={14} />
                    {processing ? 'Settling...' : 'Finalize & Close'}
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
