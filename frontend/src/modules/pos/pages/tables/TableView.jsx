import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Plus, Wifi, ArrowRightLeft, Info, Clock, Eye, Printer, Car, Search, X, Trash2 as TrashIcon, User, Users, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PosTopNavbar from '../../components/PosTopNavbar';
import { TABLE_STATUS_COLORS } from '../../data/tablesMockData';
import { usePos } from '../../context/PosContext';
import { Trash2 } from 'lucide-react';
import { printKOTReceipt } from '../../utils/printKOT';
import { ALL_STAFF as MOCK_WAITERS } from '../../data/staff';
import { playClickSound } from '../../utils/sounds';

export default function TableView() {
  const navigate = useNavigate();
  const { 
    orders, clearTable, carOrders, addCarOrder, updateCarOrderStatus, clearCarOrder,
    sections, tables, setTableWaiter, addPosTable
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

  const handleTableClick = (table) => {
    // Check if waiter is already assigned
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

  const handlePrintKOT = (e, order, tableName) => {
    e.stopPropagation();
    printKOTReceipt(order, { name: tableName });
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
              { label: 'BLANK', color: '#d1d5db' },
              { label: 'RUNNING', color: '#3b82f6' },
              { label: 'PRINTED', color: '#f59e0b' },
              { label: 'PAID', color: '#10b981' },
              { label: 'RUNNING KOT', color: '#facc15' },
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
                const statusConfig = TABLE_STATUS_COLORS[order?.status || table.status] || TABLE_STATUS_COLORS.blank;
                const isRunningKOT = !!order;
                
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
                    className={`aspect-square rounded-xl flex flex-col items-center justify-between p-2 relative transition-all duration-300 border shadow-sm cursor-pointer overflow-hidden`}
                    style={{
                      borderStyle: statusConfig.borderStyle,
                      borderColor: statusConfig.borderColor,
                      borderWidth: '1.5px',
                      backgroundColor: statusConfig.color
                    }}
                  >
                    {isRunningKOT ? (
                      <>
                        {/* Time Badge */}
                        <div className="w-full flex justify-center">
                          <div className="bg-black/10 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                            <Clock size={8} className={statusConfig.textColor === '#ffffff' ? 'text-white' : 'text-gray-600'} />
                            <span className="text-[8px] font-black whitespace-nowrap uppercase tracking-tighter" style={{ color: statusConfig.textColor }}>
                              {getElapsedTime(order.sessionStartTime)}
                            </span>
                          </div>
                        </div>

                        {/* Center Info */}
                        <div className="flex-1 flex flex-col items-center justify-center -mt-1">
                          <span className="font-black text-[13px] tracking-tight leading-none" style={{ color: statusConfig.textColor }}>
                            {table.name}
                          </span>
                          {order.waiter && (
                            <span className="text-[8px] font-bold uppercase tracking-widest mt-1 opacity-70" style={{ color: statusConfig.textColor }}>
                              {order.waiter.name}
                            </span>
                          )}
                          <div className="mt-1.5 px-2 py-0.5 bg-black/5 rounded-md">
                            <span className="font-black text-[10px] tracking-tight" style={{ color: statusConfig.textColor }}>
                               ₹ {tableTotal.toFixed(0)}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="w-full flex items-center justify-center gap-1.5 opacity-90 pb-1">
                           <button 
                             onClick={(e) => handlePrintKOT(e, order, table.name)}
                             className="p-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm text-[#E1261C] hover:bg-white transition-all active:scale-90"
                           >
                              <Printer size={12} strokeWidth={2.5} />
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); navigate(`/pos/order/${table.id}`); }}
                             className="p-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm text-gray-500 hover:bg-white transition-all active:scale-90"
                           >
                               <Eye size={12} strokeWidth={2.5} />
                           </button>
                           {order.status === 'paid' && (
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
              const statusConfig = TABLE_STATUS_COLORS[order?.status || 'blank'] || TABLE_STATUS_COLORS.blank;
              const isActive = !!order;
              const carTotal = isActive ? order.kots?.reduce((sum, kot) => sum + (kot.total || 0), 0) || 0 : 0;

              return (
                <motion.div
                  key={car.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTableClick({ id: car.id, name: car.name, sectionId: 'car-service' })}
                  className="aspect-square rounded-xl flex flex-col items-center justify-between p-2 relative transition-all duration-300 border shadow-sm cursor-pointer overflow-hidden"
                  style={{
                    borderStyle: statusConfig.borderStyle,
                    borderColor: statusConfig.borderColor,
                    borderWidth: '1.5px',
                    backgroundColor: statusConfig.color
                  }}
                >
                  {isActive ? (
                    <>
                      <div className="w-full flex justify-center">
                        <div className="bg-black/10 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                          <Clock size={8} className={statusConfig.textColor === '#ffffff' ? 'text-white' : 'text-gray-600'} />
                          <span className="text-[8px] font-black whitespace-nowrap uppercase tracking-tighter" style={{ color: statusConfig.textColor }}>
                            {getElapsedTime(order.sessionStartTime)}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center -mt-1 w-full px-1">
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
                        <div className="mt-1.5 px-2 py-0.5 bg-black/5 rounded-md">
                          <span className="font-black text-[10px] tracking-tight" style={{ color: statusConfig.textColor }}>
                            ₹{carTotal.toFixed(0)}
                          </span>
                        </div>
                      </div>

                      <div className="w-full flex items-center justify-center gap-1.5 opacity-90 pb-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/pos/order/${car.id}`, { state: { fromCarService: true } }); }}
                          className="p-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm text-gray-500 hover:bg-white transition-all active:scale-90"
                        >
                          <Eye size={12} strokeWidth={2.5} />
                        </button>
                        {order.status === 'paid' && (
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
                  const statusConfig = TABLE_STATUS_COLORS[car.status] || TABLE_STATUS_COLORS.blank;
                  const carTotal = car.kots?.reduce((sum, kot) => sum + (kot.total || 0), 0) || 0;

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
                      className="aspect-square rounded-xl flex flex-col items-center justify-between p-2 relative transition-all duration-300 border shadow-sm cursor-pointer overflow-hidden"
                      style={{
                        borderStyle: statusConfig.borderStyle,
                        borderColor: statusConfig.borderColor,
                        borderWidth: '1.5px',
                        backgroundColor: statusConfig.color
                      }}
                    >
                      {/* Elapsed time badge */}
                      <div className="w-full flex justify-center">
                        <div className="bg-black/10 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                          <Clock size={8} className={statusConfig.textColor === '#ffffff' ? 'text-white' : 'text-gray-600'} />
                          <span className="text-[8px] font-black whitespace-nowrap uppercase tracking-tighter" style={{ color: statusConfig.textColor }}>
                            {getElapsedTime(car.sessionStartTime)}
                          </span>
                        </div>
                      </div>

                      {/* Car number + total */}
                      <div className="flex-1 flex flex-col items-center justify-center -mt-1 w-full px-1">
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
                        <div className="mt-1.5 px-2 py-0.5 bg-black/5 rounded-md">
                          <span className="font-black text-[10px] tracking-tight" style={{ color: statusConfig.textColor }}>
                            ₹{carTotal.toFixed(0)}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="w-full flex items-center justify-center gap-1.5 opacity-90 pb-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/pos/order/${car.carNumber}`, { state: { fromCarService: true } }); }}
                          className="p-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm text-gray-500 hover:bg-white transition-all active:scale-90"
                        >
                           <Eye size={12} strokeWidth={2.5} />
                        </button>
                        {car.status === 'paid' && (
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
