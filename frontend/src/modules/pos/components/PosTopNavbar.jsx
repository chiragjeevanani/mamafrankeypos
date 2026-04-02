
import React, { useState } from 'react';
import { 
  Menu, Search, BookOpen, Store, Wallet, LayoutGrid, Printer, ClipboardList, 
  Clock, Bell, HelpCircle, Power, Phone, User, X, RefreshCw, Monitor, 
  FileText, History, ArrowLeft, TrendingUp, SlidersHorizontal, ChevronRight, Settings, 
  Globe, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePos } from '../context/PosContext';
import { playClickSound } from '../utils/sounds';
import logo from '../../../assets/time-to-eat.png';

export default function PosTopNavbar() {
  const navigate = useNavigate();
  const { user, toggleCustomerSection } = usePos();
  const [isRecentOrdersOpen, setIsRecentOrdersOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStoreStatusOpen, setIsStoreStatusOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dine In');

  const handleAction = (label) => {
     playClickSound();
     console.log(`Action: ${label}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#1C1E22] border-b border-white/8 h-14 flex items-center px-4 justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => { playClickSound(); setIsSidebarOpen(true); }}
          className="p-2.5 hover:bg-white/8 rounded-lg transition-colors"
        >
          <Menu size={20} className="text-slate-300" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-7 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Logo" className="h-full w-auto object-contain" />
          </div>
          <span className="text-white font-bold text-xs uppercase tracking-tight border-l border-white/10 pl-3">Time to eat</span>
        </div>
        <button onClick={() => { playClickSound(); navigate('/pos/tables'); }} className="bg-[#E1261C] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#4E342E] transition-colors shadow-md shadow-stone-900/30 uppercase tracking-tight ml-1">
          + New Order
        </button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input type="text" placeholder="Bill No" className="pl-9 pr-3 py-2 bg-white/6 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#E1261C]/60 w-28 transition-all" />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <ToolbarIcon onClick={() => { playClickSound(); navigate('/pos/menu'); }} label="Management" icon={<BookOpen size={18} />} />
        <ToolbarIcon onClick={() => { playClickSound(); setIsStoreStatusOpen(true); }} label="Store" icon={<Store size={18} />} />
        <ToolbarIcon onClick={() => { playClickSound(); }} label="Cash" icon={<Wallet size={18} />} />
        <ToolbarIcon onClick={() => { playClickSound(); navigate('/pos/dashboard'); }} label="Dashboard" icon={<LayoutGrid size={18} />} />
        <ToolbarIcon onClick={() => { playClickSound(); }} label="TV" icon={<Monitor size={18} />} />
        <ToolbarIcon onClick={() => { playClickSound(); setIsRecentOrdersOpen(true); }} label="Orders" icon={<FileText size={18} />} />
        <ToolbarIcon onClick={() => { playClickSound(); navigate('/pos/orders/completed'); }} label="History" icon={<Clock size={18} />} />

        <div onClick={() => handleAction('Notifications')} className="relative p-2.5 hover:bg-white/8 rounded-lg transition-colors cursor-pointer group">
          <Bell size={19} className="text-slate-300 group-hover:text-white transition-colors" />
          <span className="absolute top-1.5 right-1.5 bg-[#E1261C] text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center border border-[#1C1E22]">22</span>
        </div>
        
        <div onClick={() => { playClickSound(); toggleCustomerSection(); }} className="p-2.5 hover:bg-white/8 rounded-lg transition-colors cursor-pointer group">
          <User size={20} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
        </div>
        
        <ToolbarIcon onClick={() => handleAction('Help')} icon={<HelpCircle size={18} />} />
        <ToolbarIcon onClick={() => { playClickSound(); navigate('/pos/login'); }} icon={<Power size={18} />} />

        <div className="hidden xl:flex items-center gap-3 bg-white/5 px-3 py-2 rounded-lg border border-white/8 ml-1">
          <div className="w-7 h-7 rounded-full bg-[#E1261C]/30 flex items-center justify-center text-[#E1261C]"><Phone size={14} /></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Call For Support</span>
            <span className="text-sm font-black text-white">07969 223344</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-[100]" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed left-0 top-0 bottom-0 w-72 bg-[#1C1E22] z-[101] flex flex-col font-sans border-r border-white/5">
               <div className="bg-[#1C1E22] p-4 flex items-center justify-between border-b border-white/5">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Settings</h2>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-white"><ArrowLeft size={18} /></button>
               </div>
               <div className="flex-1 overflow-y-auto py-2 no-scrollbar">
                  <SidebarItem onClick={() => { setIsSidebarOpen(false); navigate('/pos/billing'); }} icon={<Printer size={20} />} label="Billing" active={true} />
                  <SidebarItem onClick={() => { setIsSidebarOpen(false); navigate('/pos/operations'); }} icon={<SlidersHorizontal size={20} />} label="Operations" />
                  <SidebarItem onClick={() => setIsSidebarOpen(false)} icon={<TrendingUp size={20} />} label="Reports" hasSubmenu={true} />
                  <SidebarItem onClick={() => { setIsSidebarOpen(false); navigate('/pos/dashboard'); }} icon={<LayoutGrid size={20} />} label="Live View" />
                  <SidebarItem onClick={() => setIsSidebarOpen(false)} icon={<Clock size={20} />} label="Day End" />
                  <SidebarItem onClick={() => { setIsSidebarOpen(false); navigate('/pos/menu'); }} icon={<Settings size={20} />} label="Settings" />
                  <SidebarItem onClick={() => setIsSidebarOpen(false)} icon={<RefreshCw size={20} />} label="Check Updates" />
                  <SidebarItem onClick={() => { setIsSidebarOpen(false); navigate('/pos/login'); }} icon={<Power size={20} />} label="Logout" color="text-red-400" />
               </div>
               <div className="bg-[#141518] p-4 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                     <span>Ref ID: A112011R</span><span>Version: 107.0.1</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-black uppercase text-center border-t border-white/5 pt-2">Biller Name: {user?.name || 'biller'}</div>
               </div>
            </motion.div>
          </>
        )}

        {isStoreStatusOpen && (
          <StoreStatusModal onClose={() => setIsStoreStatusOpen(false)} />
        )}

        {isRecentOrdersOpen && (
          <RecentOrdersModal onClose={() => setIsRecentOrdersOpen(false)} activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </AnimatePresence>
    </nav>
  );
}

function ToolbarIcon({ icon, onClick, label }) {
  return (
    <button onClick={onClick} title={label} className="text-slate-400 hover:text-white p-2.5 rounded-lg hover:bg-white/8 transition-all active:scale-90">
      {icon}
    </button>
  );
}

function StoreStatusModal({ onClose }) {
  const [storeOn, setStoreOn] = useState(false);
  
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-[150]" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 bottom-0 w-[420px] bg-white z-[151] shadow-2xl flex flex-col font-sans">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-[13px] font-bold text-gray-700">Store on/off Status</h2>
          <div className="flex items-center gap-3">
             <Settings size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
             <X size={20} className="text-gray-400 cursor-pointer hover:text-gray-600" onClick={onClose} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6">
           <div className="bg-red-50/50 border border-red-100 rounded-md p-4 flex items-start gap-4">
              <p className="text-[11px] font-bold text-gray-600 leading-relaxed flex-1">
                 Update all stores makes it easy & fast to keep all outlet's information up-to-date in one place.
              </p>
              <button className="bg-[#C62828] text-white px-3 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:brightness-110 shrink-0">
                 Update All Stores
              </button>
           </div>

           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Globe size={18} className="text-blue-900" />
                    <span className="text-xs font-bold text-gray-700">Whitelabel</span>
                 </div>
                 <div className="flex items-center bg-gray-100 rounded-full p-0.5 w-16 relative overflow-hidden cursor-pointer" onClick={() => setStoreOn(!storeOn)}>
                    <div className={`flex-1 text-center text-[9px] font-black z-10 ${!storeOn ? 'text-white' : 'text-gray-400'}`}>Off</div>
                    <div className={`flex-1 text-center text-[9px] font-black z-10 ${storeOn ? 'text-white' : 'text-gray-400'}`}>On</div>
                    <motion.div animate={{ x: storeOn ? 32 : 0 }} className={`absolute top-0.5 bottom-0.5 left-0.5 w-7 rounded-full shadow-sm ${storeOn ? 'bg-green-500' : 'bg-[#C62828]'}`} />
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Close From <span className="text-red-500">*</span></h3>
                 <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-gray-500">Select Date</label>
                       <input type="date" defaultValue="2024-02-06" className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs text-gray-600 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-gray-500">Select Hours</label>
                       <select className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs text-gray-600 outline-none"><option>HH</option></select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-gray-500">Select Min</label>
                       <select className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs text-gray-600 outline-none"><option>MM</option></select>
                    </div>
                 </div>
              </div>

              <div className="space-y-4 pt-2">
                 <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Close To <span className="text-red-500">*</span></h3>
                 <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-gray-500">Select Date</label>
                       <input type="date" defaultValue="2024-02-06" className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs text-gray-600 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-gray-500">Select Hours</label>
                       <select className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs text-gray-600 outline-none"><option>HH</option></select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-gray-500">Select Min</label>
                       <select className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs text-gray-600 outline-none"><option>MM</option></select>
                    </div>
                 </div>
              </div>

              <button className="bg-[#C62828] text-white px-8 py-2 rounded text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all w-fit mt-4">
                 Submit
              </button>
           </div>
        </div>
      </motion.div>
    </>
  );
}

function RecentOrdersModal({ onClose, activeTab, setActiveTab }) {
  const tabs = ['Dine In', 'Delivery', 'Pick Up', 'KOT'];
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-end p-4 pointer-events-none">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/10 pointer-events-auto" />
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="relative w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden font-sans border border-gray-100 flex flex-col min-h-[500px] pointer-events-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Recent</span>
          <button onClick={() => { playClickSound(); onClose(); }} className="text-gray-400 hover:text-gray-600 transition-colors p-1"><X size={20} /></button>
        </div>
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button key={tab} onClick={() => { playClickSound(); setActiveTab(tab); }} className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-tight transition-all relative ${activeTab === tab ? 'text-[#C62828]' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab}
              {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C62828]" />}
            </button>
          ))}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center opacity-40"><Store size={48} className="text-gray-300" /></div>
           <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-800">No order available</h3>
              <p className="text-[10px] text-gray-400 leading-relaxed px-4">Please Select Item from Left Menu Item and create new order</p>
           </div>
        </div>
        <div className="p-5 border-t border-gray-50 space-y-4 bg-gray-50/30">
           <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-[11px] font-bold text-red-500 uppercase tracking-tight leading-none">All Orders Are Not Synced.</span>
              <button onClick={() => playClickSound()} className="text-gray-400 hover:text-gray-600 transition-all hover:rotate-180 duration-500"><RefreshCw size={16} /></button>
           </div>
           <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-100">
              <StatusBadge label="Saved" color="bg-gray-200" /><StatusBadge label="Printed" color="bg-green-100" /><StatusBadge label="Paid" color="bg-[#2EB886]" />
           </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatusBadge({ label, color }) {
  return (
    <div className="flex items-center gap-1.5">
       <div className={`w-3 h-3 rounded-sm ${color}`} /><span className="text-[10px] font-bold text-gray-500">{label}</span>
    </div>
  );
}

function SidebarItem({ icon, label, hasSubmenu, active, color, onClick }) {
  return (
    <div onClick={() => { playClickSound(); onClick(); }} className={`px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all hover:bg-white/5 border-l-4 ${active ? 'bg-white/10 border-red-600' : 'border-transparent'}`}>
       <div className={`flex items-center gap-4 ${color || (active ? 'text-white' : 'text-gray-400')}`}>
          {icon}<span className="text-xs font-bold uppercase tracking-widest">{label}</span>
       </div>
       {hasSubmenu && <ChevronRight size={16} className="text-gray-600" />}
    </div>
  );
}
