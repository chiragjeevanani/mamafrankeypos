import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Plus, Wifi, ArrowRightLeft, Info, Clock, Eye, Printer, Car, Search, X, Trash2 as TrashIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PosTopNavbar from '../../components/PosTopNavbar';
import { TABLE_STATUS_COLORS } from '../../data/tablesMockData';
import { usePos } from '../../context/PosContext';
import { Trash2 } from 'lucide-react';
import { printKOTReceipt } from '../../utils/printKOT';

export default function TableView() {
  const navigate = useNavigate();
  const { 
    orders, clearTable, carOrders, addCarOrder, updateCarOrderStatus, clearCarOrder,
    sections, tables
  } = usePos();

  // --- Car Service state ---
  const [carSearch, setCarSearch] = useState('');
  const [showAddCar, setShowAddCar] = useState(false);
  const [newCarNumber, setNewCarNumber] = useState('');

  const handleTableClick = (table) => {
    navigate(`/pos/order/${table.id}`);
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
          <button className="bg-[#E1261C] text-white px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-[#4E342E] transition-colors uppercase shadow-sm active:scale-95">
            Delivery
          </button>
          <button className="bg-[#E1261C] text-white px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-[#4E342E] transition-colors uppercase shadow-sm active:scale-95">
            Pick Up
          </button>
          <button className="bg-[#E1261C] text-white px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-[#4E342E] transition-colors flex items-center gap-1 uppercase shadow-sm active:scale-95">
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
            
            <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 2xl:grid-cols-16 gap-1 md:gap-1.5">
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTableClick(table)}
                    className={`aspect-square rounded flex flex-col items-center justify-center relative transition-all duration-200 border shadow-none cursor-pointer overflow-hidden`}
                    style={{
                      borderStyle: statusConfig.borderStyle,
                      borderColor: statusConfig.borderColor,
                      borderWidth: '1px',
                      backgroundColor: statusConfig.color
                    }}
                  >
                    {isRunningKOT ? (
                      <>
                        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20 z-20">
                          <Clock size={8} className="text-white" />
                          <span className="text-[8px] font-black text-white whitespace-nowrap uppercase tracking-tighter">
                            {getElapsedTime(order.sessionStartTime)}
                          </span>
                        </div>
                        <div className="flex flex-col items-center mt-6">
                          <span className="font-black text-[12px] tracking-tight" style={{ color: statusConfig.textColor }}>
                            {table.name}
                          </span>
                          <span className="font-black text-[11px] mt-0.5 tracking-tight" style={{ color: statusConfig.textColor }}>
                             ₹ {tableTotal.toFixed(0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 opacity-90 relative z-10">
                           <button 
                             onClick={(e) => handlePrintKOT(e, order, table.name)}
                             className="p-1 bg-white border border-gray-300 rounded-md shadow-sm text-[#E1261C] hover:brightness-95 active:scale-95 transition-all outline-none"
                           >
                              <Printer size={12} strokeWidth={2.5} />
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); navigate(`/pos/order/${table.id}`); }}
                             className="p-1 bg-white border border-gray-300 rounded-md shadow-sm text-gray-500 hover:brightness-95 active:scale-95 transition-all outline-none"
                           >
                               <Eye size={12} strokeWidth={2.5} />
                           </button>
                           {order.status === 'paid' && (
                             <button 
                               onClick={(e) => handleClearTable(e, table.id)}
                               className="p-1 bg-[#BE123C] border border-rose-900/10 rounded-md shadow-sm text-white hover:brightness-110 active:scale-95 transition-all outline-none"
                               title="Clear Table"
                             >
                                <Trash2 size={12} strokeWidth={2.5} />
                             </button>
                           )}
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="font-black text-[10px] tracking-tighter" style={{ color: statusConfig.textColor }}>
                          {table.name}
                        </span>
                        {table.status !== 'blank' && (
                          <div 
                            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: statusConfig.dot }}
                          />
                        )}
                      </>
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
          <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 2xl:grid-cols-16 gap-1 md:gap-1.5">

            {/* ── Admin-configured car tables ── */}
            {tables.filter(t => t.sectionId === 'car-service').map((car) => {
              const order = carOrders[car.id];
              const statusConfig = TABLE_STATUS_COLORS[order?.status || 'blank'] || TABLE_STATUS_COLORS.blank;
              const isActive = !!order;
              const carTotal = isActive ? order.kots?.reduce((sum, kot) => sum + (kot.total || 0), 0) || 0 : 0;

              return (
                <motion.div
                  key={car.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTableClick({ id: car.id, name: car.name })}
                  className="aspect-square rounded flex flex-col items-center justify-center relative transition-all duration-200 border shadow-none cursor-pointer overflow-hidden"
                  style={{
                    borderStyle: statusConfig.borderStyle,
                    borderColor: statusConfig.borderColor,
                    borderWidth: '1px',
                    backgroundColor: statusConfig.color
                  }}
                >
                  {isActive ? (
                    <>
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-black/30 backdrop-blur-md px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-white/20 z-20">
                        <Clock size={7} className="text-white" />
                        <span className="text-[7px] font-black text-white whitespace-nowrap uppercase tracking-tighter">
                          {getElapsedTime(order.sessionStartTime)}
                        </span>
                      </div>
                      <div className="flex flex-col items-center mt-5 px-1 w-full">
                        <span
                          className="font-black text-[10px] tracking-widest text-center leading-tight w-full px-1"
                          style={{ color: statusConfig.textColor }}
                          title={car.name}
                        >
                          🚗 {car.name.replace(/\s/g, '').slice(-4)}
                        </span>
                        <span className="font-black text-[10px] mt-0.5" style={{ color: statusConfig.textColor }}>
                          ₹{carTotal.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5 relative z-10">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/pos/order/${car.id}`); }}
                          className="p-1 bg-white border border-gray-300 rounded-md shadow-sm text-gray-500 hover:brightness-95 active:scale-95 transition-all outline-none"
                        >
                          <Eye size={11} strokeWidth={2.5} />
                        </button>
                        {order.status === 'paid' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); if (window.confirm(`Clear car ${car.name}?`)) clearCarOrder(car.id); }}
                            className="p-1 bg-[#BE123C] border border-rose-900/10 rounded-md shadow-sm text-white hover:brightness-110 active:scale-95 transition-all outline-none"
                            title="Clear Car Order"
                          >
                            <Trash2 size={11} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <span
                      className="font-black text-[10px] tracking-widest text-center leading-tight px-1 w-full"
                      style={{ color: statusConfig.textColor }}
                      title={car.name}
                    >
                      🚗 {car.name.replace(/\s/g, '').slice(-4)}
                    </span>
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
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="aspect-square rounded flex flex-col items-center justify-center relative transition-all duration-200 border cursor-pointer overflow-hidden"
                      style={{
                        borderStyle: statusConfig.borderStyle,
                        borderColor: statusConfig.borderColor,
                        borderWidth: '1px',
                        backgroundColor: statusConfig.color
                      }}
                    >
                      {/* Elapsed time badge */}
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-black/30 backdrop-blur-md px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-white/20 z-20">
                        <Clock size={7} className="text-white" />
                        <span className="text-[7px] font-black text-white whitespace-nowrap uppercase tracking-tighter">
                          {getElapsedTime(car.sessionStartTime)}
                        </span>
                      </div>

                      {/* Car number + total */}
                      <div className="flex flex-col items-center mt-5 px-1 w-full">
                        <span
                          className="font-black text-[10px] tracking-widest text-center leading-tight w-full px-1"
                          style={{ color: statusConfig.textColor }}
                          title={car.carNumber}
                        >
                          🚗 {car.carNumber.replace(/\s/g, '').slice(-4)}
                        </span>
                        <span className="font-black text-[10px] mt-0.5" style={{ color: statusConfig.textColor }}>
                          ₹{carTotal.toFixed(0)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 mt-1.5 relative z-10">
                        {/* Cycle status */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const cycle = { 'running-kot': 'running', running: 'printed', printed: 'paid' };
                            updateCarOrderStatus(car.carNumber, cycle[car.status] || car.status);
                          }}
                          className="p-1 bg-white border border-gray-300 rounded-md shadow-sm text-gray-600 hover:brightness-95 active:scale-95 transition-all outline-none text-[7px] font-black uppercase leading-none"
                          title="Advance Status"
                        >
                          <ArrowRightLeft size={10} strokeWidth={2.5} />
                        </button>
                        {/* Clear car (only when paid) */}
                        {car.status === 'paid' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Clear car ${car.carNumber}?`)) clearCarOrder(car.carNumber);
                            }}
                            className="p-1 bg-[#BE123C] border border-rose-900/10 rounded-md shadow-sm text-white hover:brightness-110 active:scale-95 transition-all outline-none"
                            title="Clear Car Order"
                          >
                            <Trash2 size={10} strokeWidth={2.5} />
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

              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Car / Vehicle Number</p>
              <input
                type="text"
                placeholder="e.g. MP09 AB 1234"
                value={newCarNumber}
                onChange={(e) => setNewCarNumber(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCarNumber.trim()) {
                    addCarOrder(newCarNumber);
                    setNewCarNumber('');
                    setShowAddCar(false);
                  }
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#E1261C]/30 bg-gray-50 tracking-widest uppercase mb-4"
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
                    addCarOrder(newCarNumber);
                    setNewCarNumber('');
                    setShowAddCar(false);
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
    </div>
  );
}
