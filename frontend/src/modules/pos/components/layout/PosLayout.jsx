import { usePos } from '../../context/PosContext';
import { Outlet } from 'react-router-dom';
import PosSidebar from '../navigation/PosSidebar';
import { useOrders } from '../../../../context/OrderContext';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, MoreVertical, X, Plus, Minus } from 'lucide-react';

export default function PosLayout() {
  const { isSidebarOpen, closeSidebar } = usePos();
  const { orders, updateOrderStatus } = useOrders();
  const [acceptingOrder, setAcceptingOrder] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState(30);
  const [prepTime, setPrepTime] = useState(0);

  const incomingOrders = useMemo(() => 
    orders.filter(o => 
      o.status === 'new' && 
      (!o.source || o.source.toLowerCase() !== 'pos terminal')
    ),
    [orders]
  );

  const handleAcceptOrder = (order) => {
    setAcceptingOrder(order);
    setDeliveryTime(order.type?.toLowerCase() === 'delivery' ? 30 : 0);
    setPrepTime(15); // Default prep time
  };

  const handleConfirmAccept = () => {
    if (acceptingOrder) {
      updateOrderStatus(acceptingOrder.id, 'preparing');
      setAcceptingOrder(null);
    }
  };

  const handleRejectOrder = (orderId) => {
    updateOrderStatus(orderId, 'cancelled');
  };

  return (
    <div className="flex h-screen bg-[#F4F4F7] overflow-hidden relative">
      {/* Overlay for Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[90] transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      <PosSidebar isOpen={isSidebarOpen} />
      
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Structural Dropdown Incoming Orders Panel - As per UI Reference */}
        <AnimatePresence>
          {incomingOrders.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gray-200 border-b border-gray-300 overflow-hidden shrink-0 shadow-inner z-50"
            >
              <div className="p-4 flex gap-4 overflow-x-auto no-scrollbar scroll-smooth">
                {incomingOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-lg shadow-xl border border-gray-300 w-[340px] shrink-0"
                  >
                    {/* Header: Teal with Globe Icon & Delivery Badge */}
                    <div className="bg-[#0D6B78] p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <Globe size={14} />
                        <span className="text-xs font-black tracking-tight uppercase">
                          {order.source || 'Home Website'}
                        </span>
                      </div>
                      <span className="bg-[#EAB308] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {order.type || 'Delivery'}
                      </span>
                    </div>
                    
                    {/* Order Meta: ID, Time, Amount */}
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-white">
                       <span className="text-[10px] font-bold text-gray-500">{order.id}</span>
                       <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-gray-900 uppercase">
                            {new Date(order.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] font-black text-gray-900">₹ {order.total}</span>
                       </div>
                    </div>

                    {/* Items Grid */}
                    <div className="p-4 bg-gray-50/50">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[11px] font-bold text-gray-400 shrink-0">{item.quantity}x</span>
                            <span className="text-[11px] font-bold text-gray-700 truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 flex items-center justify-between bg-white border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical size={16} />
                        </button>
                        <button 
                          onClick={() => handleRejectOrder(order.id)}
                          className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 rounded transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                      <button 
                        onClick={() => handleAcceptOrder(order)}
                        className="px-6 py-2 bg-[#BE123C] text-white text-[10px] font-black uppercase tracking-widest rounded shadow-[0_4px_12px_rgba(190,18,60,0.2)] active:scale-95 transition-all"
                      >
                        Accept
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area - This will push down structurally */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Outlet />
        </div>
      </main>
      {/* Accept Order Configuration Modal */}
      <AnimatePresence>
        {acceptingOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
              onClick={() => setAcceptingOrder(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl w-[600px] z-[201] overflow-hidden border border-gray-200"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">
                  {acceptingOrder.source || 'Home Website'} - {acceptingOrder.id}
                </h3>
                <button onClick={() => setAcceptingOrder(null)} className="text-gray-400 hover:text-gray-900">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {acceptingOrder.type?.toLowerCase() === 'delivery' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Minimum Delivery Time <span className="text-gray-400 font-normal">(Minutes)</span>:</span>
                    <div className="flex items-center gap-2">
                       <button onClick={() => setDeliveryTime(Math.max(0, deliveryTime - 5))} className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50"><Minus size={16} /></button>
                       <div className="w-24 h-10 border border-gray-200 rounded flex items-center justify-center font-bold text-gray-700">
                         {deliveryTime}
                       </div>
                       <button onClick={() => setDeliveryTime(deliveryTime + 5)} className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50"><Plus size={16} /></button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Preparation Time <span className="text-gray-400 font-normal">(Minutes)</span>:</span>
                  <div className="flex items-center gap-2">
                     <button onClick={() => setPrepTime(Math.max(0, prepTime - 5))} className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50"><Minus size={16} /></button>
                     <div className="w-24 h-10 border border-gray-200 rounded flex items-center justify-center font-bold text-gray-700">
                       {prepTime}
                     </div>
                     <button onClick={() => setPrepTime(prepTime + 5)} className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50"><Plus size={16} /></button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 flex flex-wrap items-center justify-center gap-3">
                <button onClick={handleConfirmAccept} className="bg-[#BE123C] text-white px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-900/10 active:scale-95 transition-all">
                  Save
                </button>
                <button onClick={handleConfirmAccept} className="bg-[#BE123C] text-white px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-900/10 active:scale-95 transition-all">
                  Save & Print
                </button>
                <button onClick={handleConfirmAccept} className="bg-[#BE123C] text-white px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-900/10 active:scale-95 transition-all">
                  Save & EBill
                </button>
                <button onClick={handleConfirmAccept} className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 active:scale-95 transition-all">
                  KOT
                </button>
                <button onClick={handleConfirmAccept} className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 active:scale-95 transition-all">
                  KOT & PRINT
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
