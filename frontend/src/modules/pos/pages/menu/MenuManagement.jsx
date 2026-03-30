
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Filter, RefreshCw, LayoutGrid, 
  History, Globe, ChevronRight, Settings, 
  RotateCcw, Check, X, SlidersHorizontal, BookOpen, Clock
} from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { playClickSound } from '../../utils/sounds';

export default function MenuManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Whitelabel');
  const [activeCategory, setActiveCategory] = useState('Beverages');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMarkOffPanelOpen, setIsMarkOffPanelOpen] = useState(false);

  // Mock items data
  const [items, setItems] = useState([
    { id: 1, name: 'Achari Murg', status: 'ON' },
    { id: 2, name: 'Egg Curry', status: 'ON' },
    { id: 3, name: 'Chicken Lababdar', status: 'OFF' },
    { id: 4, name: 'Chicken Do Pyaza', status: 'ON' },
    { id: 5, name: 'Mutton Korma', status: 'ON' },
  ]);

  const topButtons = [
    { label: 'Dine In Item On/Off' },
    { label: 'Auto Accept/MFR' },
    { label: 'Addon On/Off' },
    { label: 'Store On/Off' },
    { label: 'Configuration' },
  ];

  const subTabs = [
    { id: 'Recent', icon: <History size={18} />, label: 'Recent' },
    { id: 'All', icon: <LayoutGrid size={18} />, label: 'All' },
    { id: 'Whitelabel', icon: <Globe size={18} />, label: 'Whitelabel', dot: true },
  ];

  const categories = [
    'Beverages', 'Main Course', 'Western Desserts', 'Indian Desserts', 
    'Indian', 'Mocktails', 'Cocktails', 'Soft Drinks', 'Veg Appetizers'
  ];

  const handleToggleStatus = (item) => {
    playClickSound();
    if (item.status === 'ON') {
      setSelectedItem(item);
      setIsMarkOffPanelOpen(true);
    } else {
      setItems(items.map(i => i.id === item.id ? { ...i, status: 'ON' } : i));
    }
  };

  const saveMarkOff = () => {
    playClickSound();
    setItems(items.map(i => i.id === selectedItem.id ? { ...i, status: 'OFF' } : i));
    setIsMarkOffPanelOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5] font-sans overflow-hidden relative">
      {/* Top Header Buttons */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-end gap-2 shrink-0">
         {topButtons.map((btn, idx) => (
           <button 
             key={idx}
             className="px-4 py-1.5 border border-gray-300 rounded text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
           >
             {btn.label}
           </button>
         ))}
         <button 
           onClick={() => { playClickSound(); navigate(-1); }}
           className="flex items-center gap-1 px-4 py-1.5 border border-red-200 rounded text-red-500 text-[11px] font-bold hover:bg-red-50 transition-all active:scale-95 ml-2"
         >
            <ArrowLeft size={14} /> Back
         </button>
      </div>

      {/* Primary Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 flex items-center gap-8 shrink-0">
         {subTabs.map((tab) => (
           <button 
             key={tab.id}
             onClick={() => { playClickSound(); setActiveTab(tab.id); }}
             className={`flex flex-col items-center py-3 px-4 min-w-[70px] relative transition-all group ${activeTab === tab.id ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
           >
              <div className="relative">
                 {tab.icon}
                 {tab.dot && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tight mt-1 ${activeTab === tab.id ? 'text-red-600' : 'text-gray-400'}`}>
                 {tab.label}
              </span>
              {activeTab === tab.id && <motion.div layoutId="menuTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />}
           </button>
         ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 border-b border-gray-100 flex items-center gap-3 shrink-0 overflow-x-auto scrolbar-hide">
         <input 
           type="text" 
           placeholder="Name" 
           className="px-3 py-1.5 bg-white border border-gray-200 rounded text-[11px] outline-none focus:ring-1 focus:ring-red-100 w-40"
         />
         <input 
           type="text" 
           placeholder="Online Display Name" 
           className="px-3 py-1.5 bg-white border border-gray-200 rounded text-[11px] outline-none focus:ring-1 focus:ring-red-100 w-40"
         />
         <div className="relative">
            <select className="appearance-none px-3 py-1.5 pr-8 bg-white border border-gray-200 rounded text-[11px] font-bold text-gray-600 outline-none focus:ring-1 focus:ring-red-100 min-w-[150px]">
               <option>All Categories</option>
            </select>
            <SlidersHorizontal size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
         </div>
         <div className="relative">
            <select className="appearance-none px-3 py-1.5 pr-8 bg-white border border-gray-200 rounded text-[11px] font-bold text-gray-600 outline-none focus:ring-1 focus:ring-red-100 min-w-[80px]">
               <option>All</option>
            </select>
            <SlidersHorizontal size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
         </div>
         
         <div className="flex items-center gap-2 ml-2">
            <button className="bg-[#C62828] text-white px-5 py-1.5 rounded text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all">
               Show
            </button>
            <button className="bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded text-[11px] font-bold hover:bg-gray-50 transition-all active:scale-95">
               Clear
            </button>
            <button className="bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded text-[11px] font-bold hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-1.5">
               <RotateCcw size={14} /> Refresh
            </button>
         </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
         {/* Categories Sidebar */}
         <div className="w-60 bg-white border-r border-gray-200 flex flex-col overflow-y-auto no-scrollbar">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => { playClickSound(); setActiveCategory(cat); }}
                className={`flex items-center justify-between px-4 py-4 border-b border-gray-50 transition-all relative ${activeCategory === cat ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}
              >
                 <span className={`text-[11px] font-black uppercase tracking-tight ${activeCategory === cat ? 'text-red-600' : 'text-gray-500'}`}>
                    {cat}
                 </span>
                 <div className="w-12 h-5 bg-gray-100 rounded-sm" />
                 {activeCategory === cat && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 shadow-sm" />}
              </button>
            ))}
         </div>

         {/* Items Table View */}
         <div className="flex-1 bg-white overflow-y-auto p-4 no-scrollbar">
            <div className="mb-6">
               <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-3">{activeCategory}</h3>
               <div className="border border-gray-100 rounded-lg shadow-sm overflow-hidden bg-gray-50/50">
                  {/* Table Header */}
                  <div className="bg-gray-100/50 px-6 py-3 flex items-center justify-between border-b border-gray-100">
                     <div className="flex items-center gap-4">
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full cursor-pointer hover:border-red-400" />
                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Name</span>
                     </div>
                     <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Mark as</span>
                  </div>

                  {/* Dynamic Items List */}
                  {items.map((item) => (
                    <div key={item.id} className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="w-5 h-5 border-2 border-gray-200 rounded-full cursor-pointer group-hover:border-red-300" />
                          <span className="text-sm font-bold text-gray-700">{item.name}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleToggleStatus(item)}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${item.status === 'ON' ? 'bg-[#1C1E22] text-green-400' : 'bg-red-100 text-red-600'}`}
                          >
                             {item.status}
                          </button>
                          <button className="p-1 text-gray-300 hover:text-gray-600 transition-colors">
                             <RotateCcw size={14} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Right Slide Panel for Mark Off */}
      <AnimatePresence>
        {isMarkOffPanelOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMarkOffPanelOpen(false)}
              className="absolute inset-0 bg-black/20 z-[50]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-80 bg-white z-[51] shadow-2xl flex flex-col font-sans"
            >
               {/* Panel Header */}
               <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">{selectedItem?.name}</h2>
                  <button 
                    onClick={() => setIsMarkOffPanelOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                     <X size={20} />
                  </button>
               </div>

               {/* Panel Body */}
               <div className="flex-1 p-6 space-y-6">
                  <div className="space-y-1">
                     <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">Note :</h3>
                     <p className="text-[11px] font-bold text-blue-500/80">Below are the parameters to mark item off only.</p>
                  </div>

                  <div className="space-y-4 pt-2">
                     <RadioOption label="2 Hours" value="2" checked={true} />
                     <RadioOption label="4 Hours" value="4" />
                     <RadioOption label="8 Hours" value="8" />
                     <RadioOption label="24 Hours" value="24" />
                     <RadioOption label="Next Business Day" value="next" />
                     <RadioOption label="Custom" value="custom" />
                  </div>
               </div>

               {/* Panel Footer */}
               <div className="p-4 border-t border-gray-100 flex gap-2">
                  <button 
                    onClick={() => setIsMarkOffPanelOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded text-[11px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                  >
                     Cancel
                  </button>
                  <button 
                    onClick={saveMarkOff}
                    className="flex-2 px-8 py-2 bg-[#C62828] text-white rounded text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-red-200"
                  >
                     Save Changes
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function RadioOption({ label, value, checked }) {
  return (
    <div className="flex items-center gap-3 cursor-pointer group">
       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'border-gray-800' : 'border-gray-300 group-hover:border-gray-400'}`}>
          {checked && <div className="w-2.5 h-2.5 bg-gray-800 rounded-full" />}
       </div>
       <span className={`text-[11px] font-bold uppercase tracking-tight ${checked ? 'text-gray-800' : 'text-gray-500 group-hover:text-gray-700'}`}>{label}</span>
    </div>
  );
}
