import React, { useEffect, useRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, CheckCircle2, Download, Eye, Receipt, RefreshCw,
  Search, XCircle, Banknote, CreditCard, Smartphone, ShieldAlert,
  AlertTriangle, Trash2, X, Shield, Table, Car, ShoppingBag,
  ChevronDown, ChevronUp, Clock, User, Printer
} from 'lucide-react';
import api from '../../../utils/api';
import { exportToCSV } from '../../../utils/csvExport';
import { usePos } from '../context/PosContext';
import { printBillReceipt } from '../utils/printBill';
import { printKOTReceipt } from '../utils/printKOT';
import { playClickSound } from '../utils/sounds';

const formatMoney = (value = 0) => `Rs ${Number(value || 0).toLocaleString()}`;

const getItemCount = (order) =>
  (order.kots || []).reduce((sum, kot) =>
    sum + (kot.items || []).reduce((itemSum, item) => itemSum + (item.status === 'cancelled' ? 0 : Number(item.quantity || 0)), 0), 0);

export default function ManagerControlPanel({ isOpen, onClose, managerInfo }) {
  const {
    storeSettings, calculateTaxes, user,
    orders, carOrders, pickupOrders, tables,
    clearTable, cancelKOTItem, refreshOrders, refreshTables
  } = usePos();

  const [activeTab, setActiveTab] = useState('voids'); // 'voids' or 'history'
  
  // History Tab States
  const [completedOrders, setCompletedOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [historyActiveTab, setHistoryActiveTab] = useState('completed'); // 'completed' or 'cancelled'
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const historyFetched = useRef(false);

  // Voids Tab States
  const [expandedOrders, setExpandedOrders] = useState({});
  const [voidNotice, setVoidNotice] = useState(null);

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      fetchHistory(true);
    }
  }, [isOpen, activeTab]);

  const toggleOrderExpand = (orderId) => {
    playClickSound();
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // --- VOIDS ACTIONS ---
  const handleVoidFullOrder = async (order, identifier) => {
    playClickSound();
    const displayName = order.table?.name || order.carNumber || order.orderNumber || 'Order';
    const isCarOrder = order.orderType === 'CAR-SERVICE';
    const isPickupOrder = order.orderType === 'PICKUP';
    
    const reason = window.prompt(`Enter reason for voiding order ${displayName}:`, 'Voided by Manager');
    if (reason === null) return; // User cancelled prompt

    try {
      setVoidNotice(null);
      await clearTable(identifier, {
        isCarOrder,
        isPickupOrder,
        reason: reason.trim() || 'Voided by Manager',
        managerPin: managerInfo?.pin
      });
      setVoidNotice({ type: 'success', text: `Successfully voided order for ${displayName}.` });
      refreshOrders();
      refreshTables();
    } catch (err) {
      setVoidNotice({ type: 'error', text: err.response?.data?.message || 'Unable to void this order.' });
    }
  };

  const handleVoidKOTItem = async (order, identifier, kotId, itemId, itemName) => {
    playClickSound();
    const isCarOrder = order.orderType === 'CAR-SERVICE';
    const isPickupOrder = order.orderType === 'PICKUP';

    const reason = window.prompt(`Enter reason for voiding item "${itemName}":`, 'Cancelled by Manager');
    if (reason === null) return; // User cancelled prompt

    try {
      setVoidNotice(null);
      await cancelKOTItem(identifier, kotId, itemId, {
        isCarOrder,
        isPickupOrder,
        reason: reason.trim() || 'Cancelled by Manager',
        managerPin: managerInfo?.pin
      });
      setVoidNotice({ type: 'success', text: `Voided item "${itemName}" successfully.` });
      refreshOrders();
    } catch (error) {
      setVoidNotice({ type: 'error', text: error.response?.data?.message || 'Unable to void this item.' });
    }
  };

  // --- HISTORY TAB LOGIC ---
  const fetchHistory = async (force = false) => {
    if (!force && historyFetched.current) return;
    try {
      setHistoryLoading(true);
      setHistoryError('');
      const [completedRes, cancelledRes] = await Promise.all([
        api.get('/orders?status=completed'),
        api.get('/orders?status=cancelled')
      ]);
      setCompletedOrders(completedRes.data || []);
      setCancelledOrders(cancelledRes.data || []);
      historyFetched.current = true;
    } catch (err) {
      setHistoryError(err.response?.data?.message || 'Unable to load orders history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredHistoryOrders = useMemo(() => {
    const query = historySearchQuery.trim().toLowerCase();
    const list = historyActiveTab === 'completed' ? completedOrders : cancelledOrders;
    
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
  }, [completedOrders, cancelledOrders, historyActiveTab, historySearchQuery]);

  const totalsByMethod = useMemo(() => {
    return completedOrders.reduce((totals, order) => {
      const method = order.paymentMethod || 'Other';
      totals[method] = (totals[method] || 0) + Number(order.totalAmount || 0);
      return totals;
    }, {});
  }, [completedOrders]);

  const totalLostRevenue = useMemo(() => {
    return cancelledOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  }, [cancelledOrders]);

  if (!isOpen) return null;

  const exportHistoryCsv = () => {
    playClickSound();
    let rows = [];
    let filename = '';

    if (historyActiveTab === 'completed') {
      rows = [
        ['Order', 'Completed At', 'Type', 'Table/Car', 'Payment Method', 'Items', 'Total'],
        ...filteredHistoryOrders.map((order) => [
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
        ...filteredHistoryOrders.map((order) => [
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

  const handleReprintReceipt = (order) => {
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
      },
      true // Pass isReprint = true so banner is drawn
    );
  };

  const handleReprintKOT = (order, kot) => {
    playClickSound();
    const isCar = order.orderType === 'CAR-SERVICE';
    const isPickup = order.orderType === 'PICKUP';
    const displayName = isCar ? order.carNumber : (isPickup ? 'Pickup' : order.table?.name);
    
    // Construct orderData containing this specific KOT's items so only this KOT is printed
    const orderData = {
      items: kot.items || [],
      kots: [kot]
    };
    
    printKOTReceipt(
      orderData,
      {
        name: displayName,
        orderType: order.orderType === 'CAR-SERVICE' ? 'car-service' : (order.orderType === 'PICKUP' ? 'pickup' : 'Dine In'),
        billerName: order.biller?.name || order.billerName || user?.name || 'Cashier',
        waiterName: order.waiter?.name || kot.waiter?.name || ''
      },
      true // isReprint = true
    );
  };

  // Compile active orders lists
  const activeDineInList = Object.keys(orders).map(key => ({ key, order: orders[key] })).filter(o => o.order);
  const activeCarList = Object.keys(carOrders).map(key => ({ key, order: carOrders[key] })).filter(o => o.order);
  const activePickupList = Object.keys(pickupOrders).map(key => ({ key, order: pickupOrders[key] })).filter(o => o.order);
  const allActiveOrders = [...activeDineInList, ...activeCarList, ...activePickupList];

  return (
    <div className="fixed inset-0 z-[90] bg-[#121417] flex flex-col font-sans text-slate-100 animate-in fade-in duration-300">
      
      {/* Top Console Bar */}
      <header className="h-16 px-6 bg-[#1C1E22] border-b border-white/8 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-slate-100">Manager Control Panel</h1>
            {managerInfo && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                <User size={10} className="text-red-500" />
                <span>Authorized: {managerInfo.managerName} ({managerInfo.role})</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-black/30 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => { playClickSound(); setActiveTab('voids'); }}
            className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'voids' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Voids
          </button>
          <button
            onClick={() => { playClickSound(); setActiveTab('history'); }}
            className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'history' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sales History
          </button>
        </div>

        <button
          onClick={onClose}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <X size={14} /> Exit Panel
        </button>
      </header>

      {/* Main Console Content */}
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        
        {/* --- TAB 1: ACTIVE VOIDS --- */}
        {activeTab === 'voids' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-extrabold uppercase tracking-tight">Active Table & Ticket Void Panel</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select an active order to cancel items or clear the table</p>
              </div>
              <button
                onClick={() => { playClickSound(); refreshOrders(); refreshTables(); }}
                className="h-9 px-4 bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 flex items-center gap-2 transition-all"
              >
                <RefreshCw size={12} /> Sync Active Orders
              </button>
            </div>

            {voidNotice && (
              <div className={`p-3 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                voidNotice.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {voidNotice.text}
              </div>
            )}

            {allActiveOrders.length === 0 ? (
              <div className="bg-[#1C1E22] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <ShieldAlert size={48} className="text-slate-600 mb-4" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">No Active Orders</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">There are currently no active tables, pickup, or car orders in POS.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {allActiveOrders.map(({ key, order }) => {
                  const isCar = order.orderType === 'CAR-SERVICE';
                  const isPickup = order.orderType === 'PICKUP';
                  const orderId = order._id || order.id;
                  const isExpanded = expandedOrders[orderId];
                  const itemsCount = getItemCount(order);

                  return (
                    <div key={orderId} className="bg-[#1C1E22] border border-white/6 rounded-2xl overflow-hidden shadow-md">
                      {/* Order Title / Summary Header */}
                      <div className="p-4 flex items-center justify-between gap-4 bg-white/2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                            isCar ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : isPickup ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}>
                            {isCar ? <Car size={18} /> : isPickup ? <ShoppingBag size={18} /> : <Table size={18} />}
                          </div>
                          <div>
                            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                              {isCar ? `Car ${order.carNumber}` : isPickup ? `Pickup Token #${order.tokenNo || order.orderNumber}` : `Table ${order.table?.name}`}
                            </span>
                            <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                              <span>{order.orderNumber}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                              <span>{itemsCount} Items</span>
                              {order.waiter && (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                  <span>Waiter: {order.waiter.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-100 tracking-tight">{formatMoney(order.totalAmount)}</span>
                          
                          {/* Main Void Button */}
                          <button
                            onClick={() => handleVoidFullOrder(order, key)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} /> Void Full Order
                          </button>

                          <button
                            onClick={() => toggleOrderExpand(orderId)}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Collapsible KOT items details */}
                      {isExpanded && (
                        <div className="border-t border-white/5 p-4 bg-black/10 space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Tickets / KOT List</h4>
                          
                          {(order.kots || []).map((kot, kIdx) => (
                            <div key={kot._id || kot.id || kIdx} className="bg-white/2 rounded-xl border border-white/5 overflow-hidden">
                              <div className="px-3 py-2 bg-white/3 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-300">
                                <span>KOT - {kot.kotNumber || `Kot ${kIdx + 1}`}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-slate-500">{kot.time || 'N/A'}</span>
                                  <button
                                    onClick={() => handleReprintKOT(order, kot)}
                                    className="p-1 bg-white/5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                                    title="Reprint KOT"
                                  >
                                    <Printer size={12} />
                                  </button>
                                </div>
                              </div>
                              <div className="divide-y divide-white/5">
                                {(kot.items || []).map((item, iIdx) => {
                                  const isCancelled = item.status === 'cancelled';
                                  return (
                                    <div key={item._id || item.id || iIdx} className={`p-3 flex justify-between items-center gap-4 text-xs font-bold ${isCancelled ? 'line-through text-slate-500 bg-red-500/5' : 'text-slate-200'}`}>
                                      <div>
                                        <span className="uppercase">{item.name}</span>
                                        {item.variantLabel && (
                                          <span className="text-[9px] text-red-400 uppercase block mt-0.5">({item.variantLabel})</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-6">
                                        <span>Qty: {item.quantity}</span>
                                        <span className="w-16 text-right">{formatMoney(item.price * item.quantity)}</span>
                                        
                                        {!isCancelled ? (
                                          <button
                                            onClick={() => handleVoidKOTItem(order, key, kot._id || kot.id, item._id || item.id, item.name)}
                                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all cursor-pointer"
                                            title="Void Item"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        ) : (
                                          <span className="text-[9px] font-black uppercase tracking-wider text-red-500/80 bg-red-500/10 px-2 py-0.5 rounded">Voided</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: SALES HISTORY --- */}
        {activeTab === 'history' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-extrabold uppercase tracking-tight">Shift History & Audit Logs</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Review completed settlements, voided orders, and payment totals</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="h-9 px-4 bg-white/5 border border-white/10 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 outline-none">
                  <Calendar size={12} />
                  Today
                </button>
                <button
                  onClick={exportHistoryCsv}
                  className="h-9 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 outline-none cursor-pointer"
                >
                  <Download size={12} />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Aggregates Cards */}
            {historyActiveTab === 'completed' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'UPI Revenue', value: totalsByMethod.UPI || 0, color: 'text-blue-400', icon: Smartphone },
                  { label: 'Cash Flow', value: totalsByMethod.Cash || totalsByMethod.CASH || 0, color: 'text-emerald-400', icon: Banknote },
                  { label: 'Card Volume', value: totalsByMethod.Card || totalsByMethod.CARD || 0, color: 'text-amber-400', icon: CreditCard }
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#1C1E22] border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-md">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <h3 className={`text-base font-extrabold tracking-tighter ${stat.color}`}>{formatMoney(stat.value)}</h3>
                    </div>
                    <div className={`w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center ${stat.color} opacity-80`}>
                      <stat.icon size={14} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1C1E22] border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-md">
                  <div>
                    <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1">Fiscal Impact (Voided Value)</p>
                    <h3 className="text-base font-extrabold tracking-tighter text-red-500">{formatMoney(totalLostRevenue)}</h3>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 opacity-80">
                    <ShieldAlert size={14} />
                  </div>
                </div>
                <div className="bg-[#1C1E22] border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-md">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Voided Tickets</p>
                    <h3 className="text-base font-extrabold tracking-tighter text-slate-200">{cancelledOrders.length} Cancelled</h3>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 opacity-80">
                    <XCircle size={14} />
                  </div>
                </div>
              </div>
            )}

            {/* Filter / Search Row */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex items-center gap-6 border-b border-white/5 w-full md:w-auto">
                {[
                  { key: 'completed', label: `Settled Bills (${completedOrders.length})` },
                  { key: 'cancelled', label: `Voided Bills (${cancelledOrders.length})` }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => { playClickSound(); setHistoryActiveTab(tab.key); }}
                    className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] relative transition-all cursor-pointer ${
                      historyActiveTab === tab.key ? 'text-red-500' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                    {historyActiveTab === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 w-full md:w-auto items-center">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input
                    type="text"
                    placeholder={historyActiveTab === 'completed' ? "Search settled..." : "Search voided..."}
                    className="w-full bg-[#1C1E22] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold uppercase tracking-wider outline-none focus:ring-1 focus:ring-red-500 focus:bg-[#25282E] transition-all h-9"
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => fetchHistory(true)}
                  className="h-9 px-4 bg-[#1C1E22] border border-white/10 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw size={12} className={historyLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            {/* History Table */}
            {historyError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                {historyError}
              </div>
            )}

            <div className="bg-[#1C1E22] border border-white/6 rounded-2xl overflow-hidden shadow-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/2 border-b border-white/5">
                    <th className="px-6 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">Order ID</th>
                    <th className="px-6 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">Table / Type</th>
                    <th className="px-6 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">Items</th>
                    {historyActiveTab === 'completed' ? (
                      <>
                        <th className="px-6 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">Payment</th>
                        <th className="px-6 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-wider text-right">Total</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3.5 text-[9px] font-black text-red-400 uppercase tracking-wider text-center">Cancellation Reason</th>
                        <th className="px-6 py-3.5 text-[9px] font-black text-red-400 uppercase tracking-wider text-right">Lost Value</th>
                      </>
                    )}
                    <th className="px-6 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {historyLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Loading transaction archives...
                      </td>
                    </tr>
                  ) : filteredHistoryOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    filteredHistoryOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-white/1 transition-colors group">
                        <td className="px-6 py-3.5 text-center">
                          <span className="text-[11px] font-black text-slate-200 uppercase tracking-tight">{order.orderNumber}</span>
                          <p className="text-[9px] font-bold text-slate-500 leading-none mt-1">
                            {new Date(order.completedAt || order.cancelledAt || order.createdAt).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
                            {order.table?.name || order.carNumber || order.orderType}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{getItemCount(order)} Items</span>
                        </td>
                        {historyActiveTab === 'completed' ? (
                          <>
                            <td className="px-6 py-3.5 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1">
                                  <CheckCircle2 size={10} /> Paid
                                </span>
                                <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">{order.paymentMethod || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 text-right font-black text-slate-100 tracking-tight">
                              {formatMoney(order.totalAmount)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-3.5 text-center">
                              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-wide">
                                {order.cancellationReason || 'Cleared from POS terminal'}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right font-black text-red-400 tracking-tight">
                              {formatMoney(order.totalAmount)}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { playClickSound(); setSelectedOrderDetails(order); }}
                              className="p-1.5 bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye size={12} />
                            </button>
                            {historyActiveTab === 'completed' && (
                              <button
                                onClick={() => handleReprintReceipt(order)}
                                className="p-1.5 bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Reprint Invoice"
                              >
                                <Receipt size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="p-3 bg-white/2 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-wider">
                <span>Total records: {filteredHistoryOrders.length}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- DETAIL VIEW MODAL FOR HISTORY TAB --- */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#1C1E22] rounded-3xl shadow-2xl border border-white/8 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 text-white font-sans">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#25282E] border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">
                  {selectedOrderDetails.orderStatus === 'CANCELLED' ? 'Voided Invoice Details' : 'Settled Invoice Details'}
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Invoice ID: {selectedOrderDetails.orderNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedOrderDetails(null)}
                className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
              >
                <XCircle size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar space-y-5">
              
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 bg-white/2 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Destination</span>
                  <span className="text-xs font-black text-slate-200 uppercase">
                    {selectedOrderDetails.table?.name || selectedOrderDetails.carNumber || selectedOrderDetails.orderType}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Biller / Waiter</span>
                  <span className="text-xs font-black text-slate-200 uppercase">
                    {selectedOrderDetails.waiter?.name || 'POS Terminal'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Opened At</span>
                  <span className="text-xs font-bold text-slate-400">
                    {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  {selectedOrderDetails.orderStatus === 'CANCELLED' ? (
                    <>
                      <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-0.5">Voided At</span>
                      <span className="text-xs font-bold text-red-400">
                        {new Date(selectedOrderDetails.cancelledAt || selectedOrderDetails.updatedAt).toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Settled At</span>
                      <span className="text-xs font-bold text-slate-400">
                        {new Date(selectedOrderDetails.completedAt || selectedOrderDetails.updatedAt).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Customer */}
              {selectedOrderDetails.customer && (selectedOrderDetails.customer.name || selectedOrderDetails.customer.phone) && (
                <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                  <h4 className="text-[9px] font-black text-red-400 uppercase tracking-wider mb-2">Customer Info</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Name</span>
                      <span className="font-bold text-slate-300">{selectedOrderDetails.customer.name || 'Walk-in'}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Phone</span>
                      <span className="font-bold text-slate-300">{selectedOrderDetails.customer.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Ticket Items</h4>
                <div className="border border-white/5 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-white/3 border-b border-white/5">
                        <th className="px-4 py-2 font-black text-slate-400 uppercase tracking-wider">Item Name</th>
                        <th className="px-4 py-2 font-black text-slate-400 uppercase tracking-wider text-center">Qty</th>
                        <th className="px-4 py-2 font-black text-slate-400 uppercase tracking-wider text-right">Price</th>
                        <th className="px-4 py-2 font-black text-slate-400 uppercase tracking-wider text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(selectedOrderDetails.kots || []).flatMap(kot => kot.items || []).map((item, idx) => {
                        const isCancelledItem = item.status === 'cancelled' || selectedOrderDetails.orderStatus === 'CANCELLED';
                        return (
                          <tr key={idx} className={`hover:bg-white/2 ${isCancelledItem ? 'line-through text-slate-500 bg-red-500/5' : 'text-slate-300'}`}>
                            <td className="px-4 py-2.5 font-bold uppercase">
                              {item.name}
                              {isCancelledItem && (
                                <span className="ml-2 text-[7px] font-black bg-red-500/10 text-red-400 px-1 py-0.5 rounded border border-red-500/20">
                                  VOIDED
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-center font-bold">{item.quantity}</td>
                            <td className="px-4 py-2.5 text-right font-bold">{formatMoney(item.price)}</td>
                            <td className="px-4 py-2.5 text-right font-bold">{formatMoney(item.price * item.quantity)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* KOT History (Reprint) */}
              {selectedOrderDetails.kots && selectedOrderDetails.kots.length > 0 && (
                <div>
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">KOT Reprint Log</h4>
                  <div className="space-y-2">
                    {selectedOrderDetails.kots.map((kot, kIdx) => (
                      <div key={kot._id || kot.id || kIdx} className="bg-white/2 border border-white/5 rounded-xl px-4 py-2.5 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-300">KOT - {kot.kotNumber || `Kot ${kIdx + 1}`}</span>
                          <span className="text-[10px] text-slate-500 ml-3">Time: {kot.time || 'N/A'}</span>
                        </div>
                        <button
                          onClick={() => handleReprintKOT(selectedOrderDetails, kot)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white transition-all"
                        >
                          <Printer size={10} /> Reprint KOT
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancel Reason */}
              {selectedOrderDetails.orderStatus === 'CANCELLED' && (
                <div className="bg-red-500/5 border border-red-500/15 p-4 rounded-xl">
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-1">Cancellation Reason</span>
                  <p className="text-xs font-bold text-red-300">{selectedOrderDetails.cancellationReason || 'Cleared from POS terminal'}</p>
                </div>
              )}

              {/* Totals Summary */}
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
                  <div className="border-t border-white/5 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400 font-bold uppercase">
                      <span>Subtotal</span>
                      <span>{formatMoney(displaySub)}</span>
                    </div>
                    {selectedOrderDetails.discount?.amount > 0 && (
                      <div className="flex justify-between text-red-400 font-bold uppercase">
                        <span>Discount ({selectedOrderDetails.discount.value}{selectedOrderDetails.discount.type === 'PERCENTAGE' ? '%' : ' Rs'})</span>
                        <span>-{formatMoney(selectedOrderDetails.discount.amount)}</span>
                      </div>
                    )}
                    {(selectedOrderDetails.taxes || []).map((tax, idx) => (
                      <div key={idx} className="flex justify-between text-slate-400 font-bold uppercase">
                        <span>{tax.name} ({tax.rate || tax.percentage}%)</span>
                        <span>{formatMoney(tax.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-black text-slate-200 uppercase pt-2 border-t border-dashed border-white/10">
                      <span>{selectedOrderDetails.orderStatus === 'CANCELLED' ? 'Lost Value' : 'Grand Total'}</span>
                      <span className={selectedOrderDetails.orderStatus === 'CANCELLED' ? 'text-red-500' : 'text-red-400'}>
                        {formatMoney(selectedOrderDetails.totalAmount)}
                      </span>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#25282E] border-t border-white/5 flex justify-end gap-2">
              {selectedOrderDetails.orderStatus !== 'CANCELLED' && (
                <button
                  onClick={() => {
                    handleReprintReceipt(selectedOrderDetails);
                    setSelectedOrderDetails(null);
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Receipt size={12} /> Reprint Receipt
                </button>
              )}
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
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
