import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Plus, Wifi, ArrowRightLeft, Info, Clock, Eye, Printer, Car, Search, X, Trash2 as TrashIcon, User, Users, Check, Wallet, Smartphone, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PosTopNavbar from '../../components/PosTopNavbar';
import { usePos } from '../../context/PosContext';
import { Trash2 } from 'lucide-react';
import { printBillReceipt } from '../../utils/printBill';
import { ALL_STAFF as MOCK_WAITERS } from '../../data/staff';
import { playClickSound } from '../../utils/sounds';
import { getTableColor, getTableStatusText } from '../../utils/tableLifecycle';

export default function TableView() {
  const navigate = useNavigate();
  const { 
    orders, saveOrder, settleOrder, clearTable, carOrders, addCarOrder, updateCarOrderStatus, clearCarOrder,
    sections, tables, setTableWaiter, addPosTable, user, calculateTaxes
  } = usePos();

  // --- Car Service state ---
  const [carSearch, setCarSearch] = useState('');
  const [showAddCar, setShowAddCar] = useState(false);
  const [newCarNumber, setNewCarNumber] = useState('');
  const [pendingCarNumber, setPendingCarNumber] = useState(null); // car number waiting for waiter selection
  
  // --- Waiter Selection state ---
  const [showWaiterModal, setShowWaiterModal] = useState(false);
  const [selectedTableForWaiter, setSelectedTableForWaiter] = useState(null);

  // --- Add Table Modal state ---
  const [showAddTable, setShowAddTable] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [newTableNumber, setNewTableNumber] = useState('');
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementTarget, setSettlementTarget] = useState(null);
  const [showUpiQR, setShowUpiQR] = useState(false);
  const [showCashlessOptions, setShowCashlessOptions] = useState(false);
  const [cashlessType, setCashlessType] = useState('Card');
  const [txnRef, setTxnRef] = useState('');
  const [showCashCalculator, setShowCashCalculator] = useState(false);
  const [cashTendered, setCashTendered] = useState('');

  const handleTableClick = (table) => {
    const existingOrder = (table.type === 'CAR' || table.sectionId === 'car-service') 
      ? carOrders[table.id] 
      : orders[table.id];

    if (existingOrder?.waiter) {
      const isCarOrder = (table.type === 'CAR' || table.sectionId === 'car-service');
      navigate(`/pos/order/${table.id}`, { state: { waiter: existingOrder.waiter, fromCarService: isCarOrder } });
      return;
    }

    setSelectedTableForWaiter(table);
    setShowWaiterModal(true);
  };

  const handleWaiterSelect = (waiter) => {
    playClickSound();
    setShowWaiterModal(false);

    // === NEW CAR flow: car number was entered, now create order and navigate ===
    if (pendingCarNumber) {
      addCarOrder(pendingCarNumber, [], 0, waiter);
      const carId = pendingCarNumber;
      setPendingCarNumber(null);
      navigate(`/pos/order/${carId}`, { state: { waiter, fromCarService: true } });
      return;
    }
    
    // === EXISTING TABLE / CAR CARD flow ===
    // Set waiter in context immediately
    if (selectedTableForWaiter.type === 'CAR' || selectedTableForWaiter.sectionId === 'car-service') {
       // if it doesn't has an order yet, start one with the waiter
       if (!carOrders[selectedTableForWaiter.id]) {
          addCarOrder(selectedTableForWaiter.id, [], 0, waiter);
       }
    } else {
       setTableWaiter(selectedTableForWaiter.id, waiter);
    }

    const isCarTable = selectedTableForWaiter.type === 'CAR' || selectedTableForWaiter.sectionId === 'car-service';
    navigate(`/pos/order/${selectedTableForWaiter.id}`, { state: { waiter, fromCarService: isCarTable } });
  };

  const handlePrintBill = (e, order, table, orderType = 'dine-in', options = {}) => {
    e.stopPropagation();
    const subTotal = order.kots?.reduce((sum, kot) => sum + (kot.total || 0), 0) || 0;
    const taxesArr = calculateTaxes(subTotal);
    const tax = taxesArr.reduce((sum, t) => sum + t.amount, 0);
    const total = Math.round(subTotal + tax);
    
    printBillReceipt(
      order, 
      { name: table.name }, 
      { total, subTotal, tax, discount: 0, orderType, billerName: user?.name, appliedTaxes: taxesArr.map(t => ({ ...t, base: subTotal })) }
    );

    saveOrder(table.id, { isCarOrder: options.isCarOrder });
  };

  const handleOpenSettlement = (e, table, options = {}) => {
    e.stopPropagation();
    const isCarOrder = !!options.isCarOrder;
    const order = isCarOrder ? carOrders[table.id] : orders[table.id];
    const subTotal = order?.kots?.reduce((sum, kot) => sum + (kot.total || 0), 0) || 0;
    const taxesArr = calculateTaxes ? calculateTaxes(subTotal) : [];
    const tax = taxesArr.reduce((sum, t) => sum + t.amount, 0);
    const total = Math.round(subTotal + tax);

    setSettlementTarget({
      id: table.id,
      name: table.name,
      isCarOrder,
      total,
    });
    setShowUpiQR(false);
    setShowCashlessOptions(false);
    setShowCashCalculator(false);
    setCashTendered('');
    setCashlessType('Card');
    setTxnRef('');
    setShowSettlementModal(true);
  };

  const handleSettlement = (mode, subType = null) => {
    if (!settlementTarget) return;

    if (mode === 'upi' && !showUpiQR) {
      setShowUpiQR(true);
      return;
    }

    if (mode === 'cashless' && !showCashlessOptions) {
      setShowCashlessOptions(true);
      return;
    }

    if (mode === 'cash' && !showCashCalculator) {
      setShowCashCalculator(true);
      setCashTendered(settlementTarget.total.toString());
      return;
    }

    let paymentMethod = 'Cash';
    if (mode === 'upi') paymentMethod = 'UPI';
    else if (mode === 'cashless') {
      paymentMethod = `Cashless (${subType || cashlessType}${txnRef ? ` - Ref: ${txnRef}` : ''})`;
    } else if (mode === 'cash' && cashTendered) {
      paymentMethod = `Cash (Tendered: ₹${cashTendered})`;
    }

    settleOrder(settlementTarget.id, paymentMethod, {
      isCarOrder: settlementTarget.isCarOrder,
    });
    clearTable(settlementTarget.id, {
      isCarOrder: settlementTarget.isCarOrder,
    });
    setShowSettlementModal(false);
    setSettlementTarget(null);
    setShowUpiQR(false);
    setShowCashlessOptions(false);
    setShowCashCalculator(false);
  };

  const handleClearTable = (e, tableId) => {
    e.stopPropagation();
    if (window.confirm(`Clear ${tableId} and mark as empty?`)) {
      clearTable(tableId);
    }
  };

  const getElapsedTime = (startTime) => {
    if (!startTime) return '0 Min';
    const diff = Math.floor((new Date() - new Date(startTime)) / 60000);
    return `${diff} Min`;
  };

  return (
    <div className="flex-1 min-h-0 bg-gray-50 flex flex-col font-sans text-gray-800">
      <PosTopNavbar />

      {/* Sub-Header */}
      <div className="bg-white px-4 py-1.5 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-700 uppercase tracking-tight">Table View</h1>
        
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw size={18} className="text-gray-500" />
          </button>
          <div className="h-4 w-px bg-gray-200 mx-1" />
          <button 
            onClick={() => setShowAddCar(true)}
            className="bg-[#E1261C] text-white px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-[#4E342E] transition-colors uppercase shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <Car size={14} /> Car Service
          </button>
          <button
            onClick={() => navigate('/pos/order/pickup', { state: { fromPickup: true } })}
            className="bg-[#E1261C] text-white px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-[#4E342E] transition-colors uppercase shadow-sm active:scale-95"
          >
            Pick Up
          </button>
          <button 
            onClick={() => {
              if (sections.length > 0) setSelectedSectionId(sections[0].id);
              setShowAddTable(true);
            }}
            className="bg-[#E1261C] text-white px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-[#4E342E] transition-colors flex items-center gap-1 uppercase shadow-sm active:scale-95"
          >
            <Plus size={14} /> Add Table
          </button>
        </div>
      </div>

      {/* Filter / Legend Bar */}
      <div className="bg-white px-4 py-2 border-b border-gray-100 flex flex-wrap items-center gap-4">
        <button className="bg-stone-50 text-[#E1261C] border border-stone-100 px-2.5 py-1.2 rounded-md text-[10px] font-black hover:bg-stone-100 transition-colors flex items-center gap-1.5 uppercase tracking-wider shadow-sm">
          <Plus size={12} strokeWidth={3} /> Contactless
        </button>

        <button className="border border-gray-200 text-gray-500 px-2.5 py-1.2 rounded-md text-[10px] font-bold hover:bg-gray-50 transition-colors flex items-center gap-1.5 uppercase tracking-wider">
          <Info size={12} className="text-[#E1261C]" /> 
          Reconnect Bridge
        </button>

        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5 bg-gray-50 py-1 px-3 rounded-full border border-gray-100">
             <div className="w-2.5 h-2.5 rounded-full bg-white border border-gray-200 shadow-sm" />
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Move KOT</span>
          </div>

          <div className="flex items-center gap-3 ml-2 border-l border-gray-100 pl-4">
            {[
              { label: 'DEFAULT', color: '#d1d5db' },
              { label: 'KOT PRINTED', color: '#facc15' },
              { label: 'BILL PRINTED', color: '#10b981' },
            ].map((config, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: config.color }} 
                />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Tables Grid */}
      <div className="flex-1 overflow-y-auto p-2 md:p-3 flex flex-col gap-4 bg-white">
        {sections.filter(s => s.id !== 'car-service').map((section) => (
          <div key={section.id} className="space-y-1.5">
            <h2 className="text-[#E1261C] font-black text-[9px] uppercase tracking-[0.2em] px-1 opacity-70">
              {section.label}
            </h2>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2 md:gap-3">
              {tables.filter(t => t.sectionId === section.id).map((table) => {
                const order = orders[table.id];
                const tableLifecycle = order ? { ...table, ...order } : table;
                const statusConfig = getTableColor(tableLifecycle);
                const statusLabel = getTableStatusText(tableLifecycle);
                const isRunningKOT = !!(order?.kotPrinted || order?.billPrinted);
                const showSettlement = order?.billPrinted;
                
                // Calculate cumulative total for the table
                const tableTotal = isRunningKOT 
                   ? order.kots?.reduce((sum, kot) => sum + (kot.total || 0), 0) || 0
                   : 0;

                return (
                  <motion.div
                    key={table.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTableClick(table)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-between p-2 pb-1.5 relative transition-all duration-300 border shadow-sm cursor-pointer overflow-hidden`}
                    style={{
                      borderStyle: statusConfig.borderStyle,
                      borderColor: statusConfig.borderColor,
                      borderWidth: '1.5px',
                      backgroundColor: statusConfig.color
                    }}
                  >
                    {isRunningKOT ? (
                      <>

                        {/* Center Info */}
                        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                          <span className="font-black text-[13px] tracking-tight leading-none" style={{ color: statusConfig.textColor }}>
                            {table.name}
                          </span>
                          {order.waiter && (
                            <span className="text-[8px] font-bold uppercase tracking-widest mt-1 opacity-70" style={{ color: statusConfig.textColor }}>
                              {order.waiter.name}
                            </span>
                          )}
                          <span className="mt-0.5 text-[6.5px] font-black uppercase tracking-[0.2em] opacity-80" style={{ color: statusConfig.textColor }}>
                            {statusLabel}
                          </span>
                          <div className="mt-0.5 px-2 py-0.5 bg-black/5 rounded-md">
                            <span className="font-black text-[9px] tracking-tight" style={{ color: statusConfig.textColor }}>
                               ₹ {tableTotal.toFixed(0)}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                         <div className="w-full flex items-center justify-center gap-1 opacity-90 pb-0 flex-shrink-0 min-h-[30px]">
                            {!showSettlement && order.kotPrinted && (
                              <button 
                                onClick={(e) => handlePrintBill(e, order, table)}
                                className="px-2 py-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm text-[#E1261C] hover:bg-white transition-all active:scale-90 text-[7px] font-black uppercase tracking-wide flex items-center gap-0.5"
                              >
                                 <Printer size={10} strokeWidth={2.5} />
                                 Print Bill
                              </button>
                            )}
                            {showSettlement && (
                              <button
                                onClick={(e) => handleOpenSettlement(e, table)}
                                className="px-2 py-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm text-emerald-700 hover:bg-white transition-all active:scale-90 text-[7px] font-black uppercase tracking-wide flex items-center gap-0.5"
                              >
                                <Wallet size={10} strokeWidth={2.5} />
                                Settlement
                              </button>
                            )}
                           {order.billPrinted && (
                             <button 
                               onClick={(e) => handleClearTable(e, table.id)}
                               className="p-1.5 bg-[#BE123C] border border-rose-900/10 rounded-lg shadow-sm text-white hover:brightness-110 transition-all active:scale-90"
                               title="Clear Table"
                             >
                                <Trash2 size={12} strokeWidth={2.5} />
                             </button>
                           )}
                        </div>
                      </>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center opacity-60">
                        <span className="font-black text-[12px] tracking-tight" style={{ color: statusConfig.textColor }}>
                          {table.name}
                        </span>
                        <div className="w-6 h-0.5 bg-gray-300 mt-2 rounded-full opacity-30" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* ===== 🚗 CAR SERVICE SECTION ===== */}
        <div className="space-y-2 mt-2">
          {/* Section header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E1261C] opacity-70">🚗 Car Service</span>
              <span className="bg-[#E1261C]/10 text-[#E1261C] text-[8px] font-black px-1.5 py-0.5 rounded-full">
                {Object.keys(carOrders).length} active
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Search */}
              <div className="relative flex items-center">
                <Search size={11} className="absolute left-2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search car no."
                  value={carSearch}
                  onChange={(e) => setCarSearch(e.target.value)}
                  className="pl-6 pr-2 py-1 text-[10px] border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-[#E1261C]/30 bg-gray-50 w-36"
                />
                {carSearch && (
                  <button onClick={() => setCarSearch('')} className="absolute right-1.5">
                    <X size={10} className="text-gray-400" />
                  </button>
                )}
              </div>
              {/* Add Car button */}
              <button
                onClick={() => setShowAddCar(true)}
                className="bg-[#E1261C] text-white px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 hover:bg-[#4E342E] transition-colors shadow-sm active:scale-95"
              >
                <Plus size={11} strokeWidth={3} /> Add Car
              </button>
            </div>
          </div>

          {/* Car cards grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2 md:gap-3">

            {/* ── Admin-configured car tables ── */}
            {tables.filter(t => t.sectionId === 'car-service').map((car) => {
              const order = carOrders[car.id];
              const carLifecycle = order ? { ...car, ...order } : car;
              const statusConfig = getTableColor(carLifecycle);
              const statusLabel = getTableStatusText(carLifecycle);
              const isActive = !!(order?.kotPrinted || order?.billPrinted);
              const carTotal = isActive ? order.kots?.reduce((sum, kot) => sum + (kot.total || 0), 0) || 0 : 0;
              const showSettlement = order?.billPrinted;

              return (
                <motion.div
                  key={car.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTableClick({ id: car.id, name: car.name, sectionId: 'car-service' })}
                  className="aspect-square rounded-xl flex flex-col items-center justify-between p-2 pb-1.5 relative transition-all duration-300 border shadow-sm cursor-pointer overflow-hidden"
                  style={{
                    borderStyle: statusConfig.borderStyle,
                    borderColor: statusConfig.borderColor,
                    borderWidth: '1.5px',
                    backgroundColor: statusConfig.color
                  }}
                >
                  {isActive ? (
                    <>

                      <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full px-1">
                        <span
                          className="font-black text-[11px] tracking-widest text-center leading-tight truncate w-full"
                          style={{ color: statusConfig.textColor }}
                        >
                          🚗 {car.name.replace(/\s/g, '').slice(-4)}
                        </span>
                        {order.waiter && (
                          <span className="text-[8px] font-bold uppercase tracking-widest mt-1 opacity-70" style={{ color: statusConfig.textColor }}>
                            {order.waiter.name}
                          </span>
                        )}
                        <span className="mt-1 text-[7px] font-black uppercase tracking-[0.2em] opacity-80" style={{ color: statusConfig.textColor }}>
                          {statusLabel}
                        </span>
                        <div className="mt-0.5 px-2 py-0.5 bg-black/5 rounded-md">
                          <span className="font-black text-[10px] tracking-tight" style={{ color: statusConfig.textColor }}>
                            ₹{carTotal.toFixed(0)}
                          </span>
                        </div>
                      </div>

                      <div className="w-full flex items-center justify-center gap-1 opacity-90 pb-0 flex-shrink-0 min-h-[26px]">
                        {!showSettlement && order.kotPrinted && (
                          <button
                            onClick={(e) => handlePrintBill(e, order, car, 'car-service', { isCarOrder: true })}
                            className="px-2 py-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm text-[#E1261C] hover:bg-white transition-all active:scale-90 text-[7px] font-black uppercase tracking-wide flex items-center gap-0.5"
                          >
                            <Printer size={10} strokeWidth={2.5} />
                            Print Bill
                          </button>
                        )}
                        {showSettlement && (
                          <button
                            onClick={(e) => handleOpenSettlement(e, car, { isCarOrder: true })}
                            className="px-2 py-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm text-emerald-700 hover:bg-white transition-all active:scale-90 text-[7px] font-black uppercase tracking-wide flex items-center gap-0.5"
                          >
                            <Wallet size={10} strokeWidth={2.5} />
                            Settlement
                          </button>
                        )}

                        {order.billPrinted && (
                          <button
                            onClick={(e) => { e.stopPropagation(); if (window.confirm(`Clear car ${car.name}?`)) clearCarOrder(car.id); }}
                            className="p-1.5 bg-[#BE123C] border border-rose-900/10 rounded-lg shadow-sm text-white hover:brightness-110 transition-all active:scale-90"
                            title="Clear Car Order"
                          >
                            <Trash2 size={12} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center opacity-60">
                      <span className="font-black text-[11px] tracking-widest text-center leading-tight w-full px-1" style={{ color: statusConfig.textColor }}>
                        🚗 {car.name.replace(/\s/g, '').slice(-4)}
                      </span>
                      <div className="w-6 h-0.5 bg-gray-300 mt-2 rounded-full opacity-30" />
                    </div>
                  )}
                </motion.div>
              );
            })}

            <AnimatePresence mode="popLayout">
              {Object.values(carOrders)
                .filter(car =>
                  carSearch === '' ||
                  car.carNumber.toLowerCase().includes(carSearch.toLowerCase())
                )
                .map((car) => {
                  const statusConfig = getTableColor(car);
                  const statusLabel = getTableStatusText(car);
                  const carTotal = car.kots?.reduce((sum, kot) => sum + (kot.total || 0), 0) || 0;
                  const showSettlement = car.billPrinted;
                  const isActive = !!(car.kotPrinted || car.billPrinted);

                  return (
                    <motion.div
                      key={car.carNumber}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTableClick({ id: car.carNumber, sectionId: 'car-service' })}
                      className="aspect-square rounded-xl flex flex-col items-center justify-between p-2 pb-1.5 relative transition-all duration-300 border shadow-sm cursor-pointer overflow-hidden"
                      style={{
                        borderStyle: statusConfig.borderStyle,
                        borderColor: statusConfig.borderColor,
                        borderWidth: '1.5px',
                        backgroundColor: statusConfig.color
                      }}
                    >
                      {isActive ? (
                        <>
                          {/* Car number + total */}
                          <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full px-1">
                            <span
                              className="font-black text-[11px] tracking-widest text-center leading-tight truncate w-full"
                              style={{ color: statusConfig.textColor }}
                            >
                              🚗 {car.carNumber.replace(/\s/g, '').slice(-4)}
                            </span>
                            {car.waiter && (
                              <span className="text-[8px] font-bold uppercase tracking-widest mt-1 opacity-70" style={{ color: statusConfig.textColor }}>
                                {car.waiter.name}
                              </span>
                            )}
                            <span className="mt-1 text-[7px] font-black uppercase tracking-[0.2em] opacity-80" style={{ color: statusConfig.textColor }}>
                              {statusLabel}
                            </span>
                            <div className="mt-0.5 px-2 py-0.5 bg-black/5 rounded-md">
                              <span className="font-black text-[10px] tracking-tight" style={{ color: statusConfig.textColor }}>
                                ₹{carTotal.toFixed(0)}
                              </span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="w-full flex items-center justify-center gap-1 opacity-90 pb-0 flex-shrink-0 min-h-[26px]">
                            {!showSettlement && car.kotPrinted && (
                              <button
                                onClick={(e) => handlePrintBill(e, car, { id: car.carNumber, name: car.carNumber }, 'car-service', { isCarOrder: true })}
                                className="px-2 py-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm text-[#E1261C] hover:bg-white transition-all active:scale-90 text-[7px] font-black uppercase tracking-wide flex items-center gap-0.5"
                              >
                                <Printer size={10} strokeWidth={2.5} />
                                Print Bill
                              </button>
                            )}
                            {showSettlement && (
                              <button
                                onClick={(e) => handleOpenSettlement(e, { id: car.carNumber, name: car.carNumber }, { isCarOrder: true })}
                                className="px-2 py-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm text-emerald-700 hover:bg-white transition-all active:scale-90 text-[7px] font-black uppercase tracking-wide flex items-center gap-0.5"
                              >
                                <Wallet size={10} strokeWidth={2.5} />
                                Settlement
                              </button>
                            )}

                            {car.billPrinted && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Clear car ${car.carNumber}?`)) clearCarOrder(car.carNumber);
                                }}
                                className="p-1.5 bg-[#BE123C] border border-rose-900/10 rounded-lg shadow-sm text-white hover:brightness-110 transition-all active:scale-90"
                                title="Clear Car Order"
                              >
                                <Trash2 size={12} strokeWidth={2.5} />
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center opacity-60">
                          <span className="font-black text-[11px] tracking-widest text-center leading-tight truncate w-full" style={{ color: statusConfig.textColor }}>
                             🚗 {car.carNumber.replace(/\s/g, '').slice(-4)}
                          </span>
                          <div className="w-6 h-0.5 bg-gray-300 mt-2 rounded-full opacity-30" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
            </AnimatePresence>

            {/* Empty state */}
            {Object.keys(carOrders).length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-6 opacity-30">
                <Car size={28} strokeWidth={1.5} className="text-gray-400 mb-1" />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">No Active Car Orders</span>
              </div>
            )}
          </div>
        </div>
        {/* ===== END CAR SERVICE SECTION ===== */}
      </div>

      {/* Add Car Modal */}
      <AnimatePresence>
        {showAddCar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowAddCar(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#E1261C] rounded-xl flex items-center justify-center">
                    <Car size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">New Car Order</h3>
                </div>
                <button onClick={() => setShowAddCar(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Vehicle Number (Last 4 Digits)</p>
              <input
                type="text"
                placeholder="E.G. 1234"
                value={newCarNumber}
                maxLength={4}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 4) setNewCarNumber(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCarNumber.trim()) {
                    setPendingCarNumber(newCarNumber);
                    setNewCarNumber('');
                    setShowAddCar(false);
                    setSelectedTableForWaiter(null);
                    setShowWaiterModal(true);
                  }
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-[#E1261C]/30 bg-gray-50 tracking-[0.2em] text-center uppercase mb-4"
                autoFocus
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddCar(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-[11px] font-black text-gray-500 hover:bg-gray-50 transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newCarNumber.trim()) return;
                    // Store the car number and open waiter selection
                    setPendingCarNumber(newCarNumber);
                    setNewCarNumber('');
                    setShowAddCar(false);
                    setSelectedTableForWaiter(null); // clear table selection — pending car will be used
                    setShowWaiterModal(true);
                  }}
                  className="flex-1 py-2.5 bg-[#E1261C] text-white rounded-xl text-[11px] font-black hover:bg-[#4E342E] transition-colors uppercase tracking-wider shadow-sm active:scale-95"
                >
                  🚗 Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettlementModal && settlementTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowSettlementModal(false);
              setSettlementTarget(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E1261C]">Settlement</p>
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight mt-1">
                    {settlementTarget.name}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowSettlementModal(false);
                    setSettlementTarget(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="p-5 space-y-3">
                {!showUpiQR && !showCashlessOptions && !showCashCalculator && (
                  <>
                    {[
                      { id: 'cash', label: 'Cash', icon: Wallet },
                      { id: 'upi', label: 'UPI', icon: Smartphone },
                      { id: 'cashless', label: 'Cashless', icon: CreditCard },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleSettlement(option.id)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-[#E1261C] hover:bg-red-50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                              <option.icon size={16} className="text-gray-400 group-hover:text-[#E1261C]" />
                           </div>
                           <span className="text-sm font-black text-gray-700 uppercase tracking-wide">
                             {option.label}
                           </span>
                        </div>
                        <Check size={15} className="text-[#E1261C]" />
                      </button>
                    ))}
                  </>
                )}

                {showUpiQR && (
                  <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="w-full bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100 flex flex-col items-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount to Pay</p>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tighter">₹{settlementTarget.total}</h4>
                    </div>
                    
                    <div className="bg-white p-3 rounded-2xl border-2 border-slate-100 mb-4 shadow-sm">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=porutkal@upi%26pn=Porutkal%26am=${settlementTarget.total}%26cu=INR`} 
                        alt="UPI QR Code"
                        className="w-44 h-44"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Waiting for payment...</span>
                    </div>

                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={() => setShowUpiQR(false)}
                        className="flex-1 py-3 border border-slate-200 rounded-xl text-[11px] font-black text-slate-500 uppercase tracking-wide hover:bg-slate-50"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => handleSettlement('upi')}
                        className="flex-2 py-3 bg-[#E1261C] text-white rounded-xl text-[11px] font-black uppercase tracking-wide hover:brightness-110 shadow-lg shadow-red-200"
                      >
                        Verify & Settle
                      </button>
                    </div>
                  </div>
                )}

                {showCashlessOptions && (
                  <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="w-full bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100 flex flex-col items-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Amount</p>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tighter">₹{settlementTarget.total}</h4>
                    </div>

                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Select Method</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { id: 'Card', icon: CreditCard },
                        { id: 'Wallet', icon: Smartphone },
                        { id: 'G-Pay', icon: Smartphone },
                        { id: 'Other', icon: Info }
                      ].map(method => (
                        <button
                          key={method.id}
                          onClick={() => setCashlessType(method.id)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${cashlessType === method.id ? 'bg-[#E1261C] border-[#E1261C] text-white shadow-md' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
                        >
                          <method.icon size={14} />
                          <span className="text-[11px] font-black uppercase">{method.id}</span>
                        </button>
                      ))}
                    </div>

                    <div className="mb-6">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Reference ID / Machine ID</label>
                      <input 
                        type="text"
                        placeholder="E.G. LAST 4 DIGITS"
                        value={txnRef}
                        onChange={(e) => setTxnRef(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#E1261C]/20"
                      />
                    </div>

                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={() => setShowCashlessOptions(false)}
                        className="flex-1 py-3 border border-slate-200 rounded-xl text-[11px] font-black text-slate-500 uppercase tracking-wide hover:bg-slate-50"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => handleSettlement('cashless')}
                        className="flex-2 py-3 bg-[#E1261C] text-white rounded-xl text-[11px] font-black uppercase tracking-wide hover:brightness-110 shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                      >
                        <Check size={16} strokeWidth={3} />
                        Confirm & Settle
                      </button>
                    </div>
                  </div>
                )}

                {showCashCalculator && (
                   <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex gap-3 mb-4">
                         <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col items-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Bill Amount</p>
                            <h4 className="text-lg font-black text-slate-900 tracking-tighter">₹{settlementTarget.total}</h4>
                         </div>
                         <div className="flex-1 bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex flex-col items-center">
                            <p className="text-[8px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">Return Balance</p>
                            <h4 className={`text-lg font-black tracking-tighter ${Number(cashTendered) - settlementTarget.total >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                               ₹{Math.max(0, Number(cashTendered) - settlementTarget.total)}
                            </h4>
                         </div>
                      </div>

                      <div className="mb-4">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Cash Tendered (Received)</label>
                         <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
                            <input 
                               type="number"
                               placeholder="Enter amount"
                               value={cashTendered}
                               autoFocus
                               onChange={(e) => setCashTendered(e.target.value)}
                               className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-4 text-xl font-black tracking-tighter outline-none focus:ring-2 focus:ring-[#E1261C]/20"
                            />
                         </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-6">
                         {[100, 200, 500].map(amt => (
                            <button 
                               key={amt}
                               onClick={() => setCashTendered(prev => (Number(prev || 0) + amt).toString())}
                               className="py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black hover:bg-slate-100 transition-colors"
                            >
                               +{amt}
                            </button>
                         ))}
                         <button 
                            onClick={() => setCashTendered(settlementTarget.total.toString())}
                            className="py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black hover:bg-emerald-100 transition-colors"
                         >
                            EXACT
                         </button>
                      </div>

                      <div className="flex gap-2 w-full">
                         <button 
                            onClick={() => setShowCashCalculator(false)}
                            className="flex-1 py-3 border border-slate-200 rounded-xl text-[11px] font-black text-slate-500 uppercase tracking-wide hover:bg-slate-50"
                         >
                            Back
                         </button>
                         <button 
                            disabled={Number(cashTendered) < settlementTarget.total}
                            onClick={() => handleSettlement('cash')}
                            className={`flex-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${
                               Number(cashTendered) < settlementTarget.total 
                               ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                               : 'bg-[#E1261C] text-white hover:brightness-110 shadow-lg shadow-red-200'
                            }`}
                         >
                            Confirm & Settle
                         </button>
                      </div>
                   </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiter Selection Modal */}
      <AnimatePresence>
        {showWaiterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 uppercase flex items-center gap-2">
                  <Users size={18} className="text-[#E1261C]" />
                  Select Waiter / Staff
                </h3>
                <button onClick={() => setShowWaiterModal(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
                {MOCK_WAITERS.map((waiter) => (
                  <button 
                    key={waiter.id}
                    onClick={() => handleWaiterSelect(waiter)}
                    className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-100 hover:border-[#E1261C] hover:bg-red-50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full mb-2 flex items-center justify-center bg-gray-100 text-gray-400 group-hover:bg-[#E1261C] group-hover:text-white transition-all">
                      <User size={24} />
                    </div>
                    <span className="text-[13px] font-bold text-gray-700 group-hover:text-gray-900">
                      {waiter.name}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mt-0.5">{waiter.role}</span>
                  </button>
                ))}
              </div>
              <div className="p-3 bg-gray-50 border-t flex justify-end">
                  <button 
                    onClick={() => setShowWaiterModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 uppercase hover:text-gray-700"
                  >
                    Cancel
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Add Table Modal */}
      <AnimatePresence>
        {showAddTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddTable(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#E1261C] rounded-xl flex items-center justify-center">
                    <Plus size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Add New Table</h3>
                </div>
                <button onClick={() => setShowAddTable(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Section Select */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">1. Select Section</label>
                  <div className="grid grid-cols-2 gap-2">
                    {sections.filter(s => s.id !== 'car-service').map(section => (
                      <button
                        key={section.id}
                        onClick={() => {
                          setSelectedSectionId(section.id);
                          setNewTableNumber('');
                        }}
                        className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border ${
                          selectedSectionId === section.id 
                            ? 'bg-[#E1261C] border-[#E1261C] text-white shadow-md shadow-[#E1261C]/20 scale-[1.02]' 
                            : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {section.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table Number Selection Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">2. Select Table Number</label>
                    {newTableNumber && (
                      <span className="text-[10px] font-black text-[#E1261C] uppercase bg-[#E1261C]/10 px-2 py-0.5 rounded-md">
                        Selected: {(() => {
                           let prefix = '';
                           if (selectedSectionId === 'ac') prefix = 'AC';
                           else if (selectedSectionId === 'garden') prefix = 'G';
                           else if (selectedSectionId === 'non-ac') prefix = 'NAC';
                           else if (selectedSectionId === 'rooftops') prefix = 'R';
                           else if (selectedSectionId === 'second-floor') prefix = 'SF';
                           else {
                             const section = sections.find(s => s.id === selectedSectionId);
                             prefix = section ? section.label.split(' ').map(w => w[0]).join('').toUpperCase() : '';
                           }
                           return `${prefix}${newTableNumber}`;
                        })()}
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3">
                    <div className="grid grid-cols-5 gap-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                      {Array.from({ length: 100 }, (_, i) => i + 1).map(num => {
                        let prefix = '';
                        if (selectedSectionId === 'ac') prefix = 'AC';
                        else if (selectedSectionId === 'garden') prefix = 'G';
                        else if (selectedSectionId === 'non-ac') prefix = 'NAC';
                        else if (selectedSectionId === 'rooftops') prefix = 'R';
                        else if (selectedSectionId === 'second-floor') prefix = 'SF';
                        else {
                          const section = sections.find(s => s.id === selectedSectionId);
                          prefix = section ? section.label.split(' ').map(w => w[0]).join('').toUpperCase() : '';
                        }
                        
                        const tableName = `${prefix}${num}`;
                        const exists = tables.some(t => t.sectionId === selectedSectionId && t.name === tableName);
                        
                        if (exists) return null;

                        return (
                          <button
                            key={num}
                            onClick={() => setNewTableNumber(num.toString())}
                            className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-black transition-all border ${
                              newTableNumber === num.toString()
                                ? 'bg-gray-800 border-gray-800 text-white scale-110 shadow-lg z-10'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-[#E1261C] hover:text-[#E1261C]'
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowAddTable(false)}
                  className="flex-1 py-3 border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 hover:bg-gray-50 transition-colors uppercase tracking-[0.1em]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!selectedSectionId || !newTableNumber) return;
                    
                    let prefix = '';
                    if (selectedSectionId === 'ac') prefix = 'AC';
                    else if (selectedSectionId === 'garden') prefix = 'G';
                    else if (selectedSectionId === 'non-ac') prefix = 'NAC';
                    else if (selectedSectionId === 'rooftops') prefix = 'R';
                    else if (selectedSectionId === 'second-floor') prefix = 'SF';
                    else {
                      const section = sections.find(s => s.id === selectedSectionId);
                      prefix = section ? section.label.split(' ').map(w => w[0]).join('').toUpperCase() : '';
                    }
                    
                    const tableName = `${prefix}${newTableNumber}`;
                    addPosTable(selectedSectionId, tableName);
                    setNewTableNumber('');
                    setShowAddTable(false);
                  }}
                  disabled={!selectedSectionId || !newTableNumber}
                  className={`flex-1 py-3 text-white rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.1em] shadow-lg active:scale-95 ${
                    (!selectedSectionId || !newTableNumber) 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                      : 'bg-[#E1261C] hover:bg-[#4E342E]'
                  }`}
                >
                  Add Table
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
