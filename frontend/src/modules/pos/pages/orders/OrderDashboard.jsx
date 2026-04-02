
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Filter, RefreshCw, LayoutGrid, 
  ClipboardList, Send, Truck, ShoppingBag, Globe, 
  MoreHorizontal, ChevronRight, Info, Clock
} from 'lucide-react';
import { useOrders } from '../../../../context/OrderContext';
import { usePos } from '../../context/PosContext';
import { playClickSound } from '../../utils/sounds';

export default function OrderDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('Order View');
  const [activeCategory, setActiveCategory] = useState('All');
  const { orders } = useOrders();
  
  const categories = [
    { id: 'All', icon: <LayoutGrid size={16} />, label: 'All' },
    { id: 'Dine In', icon: <ShoppingBag size={16} />, label: 'Dine In' },
    { id: 'Delivery', icon: <Truck size={16} />, label: 'Delivery' },
    { id: 'Pick Up', icon: <Send size={16} />, label: 'Pick Up' },
    { id: 'Online', icon: <Globe size={16} />, label: 'Online' },
    { id: 'Other', icon: <MoreHorizontal size={16} />, label: 'Other' },
    { id: 'Home Website', icon: <Globe size={16} />, label: 'Home Website' },
  ];

  // Helper to map order status for counters
  const readyCount = orders.filter(o => o.status === 'ready').length;
  const dispatchCount = orders.filter(o => o.status === 'dispatch' || o.status === 'preparing' || o.status === 'new').length;
  const deliverCount = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5] font-sans overflow-hidden">
      {/* Top Header Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0">
         <div className="flex">
            <TabButton 
              active={activeView === 'Order View'} 
              onClick={() => setActiveView('Order View')}
              label="Order View"
              icon={<ShoppingBag size={18} />}
            />
            <TabButton 
              active={activeView === 'Kot View'} 
              onClick={() => setActiveView('Kot View')}
              label="Kot View"
              icon={<ClipboardList size={18} />}
            />
         </div>

         <div className="flex items-center gap-4 py-2">
            <div className="flex items-center gap-2 mr-4">
               <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">View Details</span>
               <div className="w-8 h-4 bg-gray-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full shadow-sm" />
               </div>
            </div>

            <div className="flex items-center gap-1">
               <StatusFilter count={readyCount} label="Foodready" color="text-primary-red" />
               <StatusFilter count={dispatchCount} label="Dispatch" color="text-primary-red" />
               <StatusFilter count={deliverCount} label="Deliver" color="text-primary-red" />
            </div>

            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
               <RefreshCw size={18} />
            </button>
            
            <button 
              onClick={() => { playClickSound(); navigate(-1); }}
              className="flex items-center gap-1 px-4 py-1.5 border border-red-200 rounded text-red-500 text-xs font-bold hover:bg-red-50 transition-all active:scale-95"
            >
               <ArrowLeft size={14} /> Back
            </button>
         </div>
      </div>

      {/* Category Toolbar */}
      <div className="bg-white p-3 border-b border-gray-100 flex items-center justify-between gap-4 shrink-0">
         <div className="flex flex-1 items-center bg-gray-50 border border-gray-100 rounded-md p-1 min-w-0 overflow-x-auto no-scrollbar scrolbar-hide">
            <button className="p-2 border-r border-gray-200 hover:bg-white transition-colors">
               <Search size={16} className="text-gray-400" />
            </button>
            <div className="flex">
               {categories.map((cat) => (
                 <CategoryButton 
                   key={cat.id}
                   active={activeCategory === cat.id}
                   onClick={() => setActiveCategory(cat.id)}
                   {...cat}
                 />
               ))}
            </div>
         </div>

         <div className="flex items-center gap-2">
            <div className="relative">
               <input 
                 type="text" 
                 placeholder="Enter order no." 
                 className="px-3 py-2 bg-white border border-gray-200 rounded text-xs outline-none focus:ring-1 focus:ring-red-200 w-32 font-bold"
               />
            </div>
            <button className="bg-primary-yellow text-neutral-black px-4 py-2 rounded text-xs font-black uppercase tracking-widest hover:bg-yellow-soft active:scale-95 transition-all shadow-md shadow-primary-yellow/10">
               MFR
            </button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar pt-12">
         <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-primary-red uppercase tracking-[0.1em]">Total Orders | {orders.length}</span>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-12">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
         </div>
      </div>
    </div>
  );
}

function TabButton({ active, label, icon, onClick }) {
  const { playClickSound } = usePos();
  return (
    <button 
      onClick={() => { playClickSound(); onClick(); }}
      className={`px-8 py-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative ${active ? 'text-neutral-black' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <span className={active ? 'text-neutral-black' : 'text-gray-300'}>{icon}</span>
      {label}
      {active && <motion.div layoutId="headerTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-red" />}
    </button>
  );
}

function StatusFilter({ count, label, color }) {
  return (
    <div className="flex items-center border border-gray-200 rounded overflow-hidden h-8 shadow-sm">
       <span className="px-3 py-1 text-[9px] font-black bg-white text-gray-400 uppercase tracking-widest">{label}</span>
       <span className={`px-2.5 py-1 text-xs font-black bg-white border-l border-gray-100 flex items-center justify-center min-w-[30px] ${color}`}>{count}</span>
    </div>
  );
}

function CategoryButton({ active, icon, label, onClick }) {
  const { playClickSound } = usePos();
  return (
    <button 
      onClick={() => { playClickSound(); onClick(); }}
      className={`flex flex-col items-center justify-center px-6 py-1 h-14 min-w-[80px] transition-all relative whitespace-nowrap group ${active ? 'bg-white' : 'hover:bg-white/40'}`}
    >
       <div className={`mb-1 transition-transform group-hover:scale-110 ${active ? 'text-neutral-black' : 'text-gray-400'}`}>
          {icon}
       </div>
       <span className={`text-[9px] font-black uppercase tracking-tight ${active ? 'text-neutral-black' : 'text-gray-400'}`}>{label}</span>
       {active && <motion.div layoutId="catTab" className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-red rounded-t-full" />}
    </button>
  );
}

function OrderCard({ order }) {
  const { playClickSound } = usePos();
  
  // Normalize data from OrderContext or existing schema
  const orderId = order.orderNum || order.id || '#0000';
  const table = order.table || 'No Table';
  const total = order.total || order.amount || 0;
  const kotCount = order.items?.length || order.kot || 0;
  const status = order.status || 'New';
  const source = order.source || 'Other';
  
  // Custom mapping for source colors and icons
  const sourceColor = source === 'Home Website' ? 'bg-blue-50' : (source === 'QR Ordering' ? 'bg-purple-50' : 'bg-gray-50');
  const sourceIcon = source === 'Home Website' ? <Globe size={18} strokeWidth={2.5} /> : (source === 'QR Ordering' ? <LayoutGrid size={18} strokeWidth={2.5} /> : <ShoppingBag size={18} strokeWidth={2.5} />);
  const sourceSourceColor = source === 'Home Website' ? 'bg-[#42A5F5] shadow-blue-200' : (source === 'QR Ordering' ? 'bg-[#9C27B0] shadow-purple-200' : 'bg-gray-800 shadow-gray-200');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-lg border border-gray-100 flex flex-col overflow-visible hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 group"
    >
       {/* Card Top */}
       <div className={`px-5 py-4 flex items-start justify-between border-b border-gray-50 ${sourceColor} relative transition-colors group-hover:bg-opacity-80 rounded-t-lg`}>
          <div className="space-y-1">
             <h4 className="text-[12px] font-black text-gray-700 tracking-tight truncate w-36 uppercase">{table}</h4>
             <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                <span>KOT: {kotCount}</span>
                <span className="w-1 h-1 bg-gray-200 rounded-full" />
                <span>BILL: ₹{total}</span>
             </div>
          </div>
          
          <div className="text-right flex flex-col items-end gap-1.5 pt-0.5">
             <span className="text-[10px] font-black text-gray-400 tracking-tighter tabular-nums">{orderId}</span>
             <div className="flex items-center gap-1.5">
                <div className="px-2 py-0.5 bg-white border border-gray-100 rounded text-[9px] font-black text-gray-400 uppercase tracking-widest shadow-sm group-hover:text-gray-600 transition-colors">
                   {status}
                </div>
             </div>
          </div>

          <div className={`absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-xl ring-4 ring-white ${sourceSourceColor} transition-transform group-hover:scale-110 z-10`}>
             {sourceIcon}
          </div>
       </div>

       {/* Card Middle */}
       <div className="p-5 flex-1 flex flex-col justify-between bg-white rounded-b-lg">
          <div className="flex items-start justify-between">
             <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-bold text-gray-600 uppercase tracking-tight">
                   <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 transition-colors group-hover:bg-blue-50 group-hover:text-blue-500">
                      <Truck size={16} />
                   </div>
                   {source === 'Home Website' ? 'Self Delivery Order' : (order.table ? 'Dine In Order' : 'Takeaway Order')}
                </div>
                <div className="flex items-center gap-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                   <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300">
                      <RefreshCw size={14} />
                   </div>
                   {source === 'Home Website' ? 'Deliver with own fleet' : (status === 'preparing' ? 'In Preparation' : 'New Order Sync')}
                </div>
             </div>
             <button 
               onClick={() => { playClickSound(); }}
               className="px-3.5 py-1.5 bg-gray-50 border border-gray-100 rounded text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white hover:text-gray-900 transition-all active:scale-95 shadow-sm"
             >
                View Details
             </button>
          </div>

          <div className="mt-8 flex items-end justify-between">
             <div className="text-2xl font-black text-gray-800 tabular-nums tracking-tighter flex items-baseline">
                <span className="text-sm mr-0.5 text-gray-400">₹</span>{total}
             </div>
          </div>
       </div>

       {/* Card Action */}
       <div className="p-4 border-t border-gray-50 flex items-center justify-between gap-3 bg-gray-50/20 rounded-b-lg">
          <div className="flex-1"></div>
          <div className="flex items-center gap-2">
             <button className="p-2.5 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-neutral-black hover:border-gray-200 transition-all shadow-sm">
                <Info size={16} />
             </button>
             <button 
               onClick={() => { playClickSound(); }}
               className={`px-8 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-[0.1em] shadow-xl transition-all active:scale-95 ${status === 'preparing' || status === 'new' ? 'bg-primary-yellow text-neutral-black hover:bg-yellow-soft' : 'bg-neutral-black text-white hover:bg-charcoal-800'}`}
             >
                {status === 'preparing' || status === 'new' ? 'Food Is Ready' : 'Settle & Save'}
             </button>
          </div>
       </div>
    </motion.div>
  );
}
