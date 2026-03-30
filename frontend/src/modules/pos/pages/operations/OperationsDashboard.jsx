
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, FileText, History, Globe, ClipboardList, 
  Users, Wallet, TrendingDown, Landmark, Banknote, 
  Package, Bell, LayoutGrid, CreditCard, RefreshCw, 
  HelpCircle, Monitor, DollarSign, Languages, UserCircle, 
  BadgeDollarSign, Clock, ListChecks, Smartphone, MessageSquare, 
  Truck, Tv, Phone, Mail
} from 'lucide-react';
import { playClickSound } from '../../utils/sounds';

export default function OperationsDashboard() {
  const navigate = useNavigate();

  const operationTiles = [
    { label: 'Orders', icon: <FileText size={28} /> },
    { label: 'Extra Information History', icon: <History size={28} /> },
    { label: 'Online Orders', icon: <Globe size={28} /> },
    { label: 'KOTs', icon: <ClipboardList size={28} /> },
    { label: 'Customers', icon: <Users size={28} /> },
    { label: 'Cash Flow', icon: <Wallet size={28} /> },
    { label: 'Expense', icon: <TrendingDown size={28} /> },
    { label: 'Withdrawal', icon: <Landmark size={28} /> },
    { label: 'Cash Top-Up', icon: <Banknote size={28} /> },
    { label: 'Inventory', icon: <Package size={28} /> },
    { label: 'Notification', icon: <Bell size={28} /> },
    { label: 'Table', icon: <LayoutGrid size={28} /> },
    { label: 'Virtual Wallet', icon: <CreditCard size={28} /> },
    { label: 'Manual Sync', icon: <RefreshCw size={28} /> },
    { label: 'Help', icon: <HelpCircle size={28} /> },
    { label: 'Live View', icon: <Monitor size={28} /> },
    { label: 'Due Payment', icon: <DollarSign size={28} /> },
    { label: 'Language Profiles', icon: <Languages size={28} /> },
    { label: 'Billing User Profile', icon: <UserCircle size={28} /> },
    { label: 'Currency Conversion', icon: <BadgeDollarSign size={28} /> },
    { label: 'Day End', icon: <Clock size={28} /> },
    { label: 'Day End History', icon: <ListChecks size={28} /> },
    { label: 'Waiter Devices', icon: <Smartphone size={28} /> },
    { label: 'Feedback', icon: <MessageSquare size={28} /> },
    { label: 'Delivery Boys', icon: <Truck size={28} /> },
    { label: 'LED Display', icon: <Tv size={28} /> },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] font-sans overflow-hidden">
      {/* Top Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => { playClickSound(); navigate(-1); }}
             className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
           >
              <ArrowLeft size={20} className="text-gray-600" />
           </button>
           <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-800 tracking-tight leading-none uppercase">Operations</h1>
              <span className="text-[10px] text-gray-400 font-bold mt-1">Version: 107.0.1</span>
           </div>
        </div>
        
        <div className="flex flex-col items-center">
           <span className="text-sm font-black text-gray-700 uppercase tracking-widest">Main Server</span>
           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Master Billing Station</span>
        </div>
        
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Info Bar */}
      <div className="bg-white/50 px-6 py-3 border-b border-gray-100 flex items-center justify-end gap-10 shrink-0">
         <div className="flex items-center gap-2 text-gray-500 hover:text-[#C62828] cursor-pointer transition-colors group">
            <Phone size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold tabular-nums">07969 223344</span>
         </div>
         <div className="flex items-center gap-2 text-gray-500 hover:text-[#C62828] cursor-pointer transition-colors group">
            <Mail size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold lowercase">support@petpooja.com</span>
         </div>
      </div>

      {/* Tiles Grid */}
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {operationTiles.map((tile, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => playClickSound()}
                className="bg-white border border-gray-100 rounded-lg p-4 flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-all hover:bg-gray-50 group min-h-[140px]"
              >
                 <div className="text-gray-500 group-hover:text-[#C62828] transition-colors duration-300">
                    {tile.icon}
                 </div>
                 <span className="text-[11px] font-black text-gray-600 uppercase tracking-tight leading-tight px-2 group-hover:text-gray-800 transition-colors">
                    {tile.label}
                 </span>
              </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
}
