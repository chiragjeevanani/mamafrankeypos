import React, { useState } from 'react';
import { 
  Search, LayoutGrid, Power, Phone, 
  FileText, History, Clock, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePos } from '../context/PosContext';
import { playClickSound } from '../utils/sounds';
import logo from '../../../assets/time-to-eat.png';
import ManagerPinModal from './ManagerPinModal';
import ManagerControlPanel from './ManagerControlPanel';

export default function PosTopNavbar() {
  const navigate = useNavigate();
  const { logout, storeSettings, currentCounter } = usePos();
  const [searchBillNo, setSearchBillNo] = useState('');
  const branchName = localStorage.getItem('pos_branch_name') || '';

  // Dropdown & Modal states
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [managerInfo, setManagerInfo] = useState(null);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchBillNo.trim()) {
      playClickSound();
      navigate(`/pos/orders/active?search=${encodeURIComponent(searchBillNo.trim())}`);
      setSearchBillNo('');
    }
  };

  const handleManagerAuthSuccess = (info, pin) => {
    setManagerInfo({ ...info, pin });
    setIsControlPanelOpen(true);
  };

  const supportPhone = storeSettings?.phone || "07969 223344";

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#1C1E22] border-b border-white/8 h-14 flex items-center px-4 justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="h-7 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Logo" className="h-full w-auto object-contain" />
            </div>
            <div className="flex flex-col border-l border-white/10 pl-3">
              <span className="text-white font-bold text-[11px] uppercase tracking-tight leading-tight">Time to eat</span>
              {branchName && (
                <span className="text-[#FFD600] font-black text-[8px] uppercase tracking-widest mt-0.5 opacity-90">
                  {branchName}
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={() => { playClickSound(); navigate('/pos/tables'); }} 
            className="bg-[#E1261C] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#4E342E] transition-colors shadow-md shadow-stone-900/30 uppercase tracking-tight ml-1"
          >
            + New Order
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input 
              type="text" 
              placeholder="Bill No" 
              value={searchBillNo}
              onChange={(e) => setSearchBillNo(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="pl-9 pr-3 py-2 bg-white/6 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#E1261C]/60 w-28 transition-all" 
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          {/* Orders & History Dropdown */}
          <div className="relative">
            <button 
              onClick={() => { playClickSound(); setIsOrdersOpen(!isOrdersOpen); }}
              className={`p-2.5 hover:bg-white/8 rounded-lg transition-colors cursor-pointer group ${isOrdersOpen ? 'bg-white/8' : ''}`}
              title="Orders Hub"
            >
              <FileText size={18} className={`text-slate-300 group-hover:text-blue-400 transition-colors ${isOrdersOpen ? 'text-blue-400' : ''}`} />
            </button>
            
            {isOrdersOpen && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setIsOrdersOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-[#1C1E22] border border-white/8 rounded-lg shadow-xl overflow-hidden z-[70] py-1 font-sans text-left">
                  <button
                    onClick={() => { playClickSound(); setIsOrdersOpen(false); navigate('/pos/orders/active'); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/6 hover:text-white transition-all uppercase tracking-wider flex items-center gap-2"
                  >
                    <Clock size={14} className="text-slate-400" />
                    Active Orders
                  </button>
                </div>
              </>
            )}
          </div>

          <ToolbarIcon 
            onClick={() => { 
              playClickSound(); 
              setIsPinModalOpen(true);
            }} 
            label="Manager Operations"
            icon={<Shield size={18} />} 
          />
          
          <ToolbarIcon 
            onClick={() => { 
              playClickSound(); 
              logout(); 
              navigate('/pos/login'); 
            }} 
            label="Sign Out"
            icon={<Power size={18} />} 
          />

          {currentCounter && (
            <div className="hidden md:flex items-center gap-3 bg-white/5 px-3 py-2 rounded-lg border border-white/8 ml-1">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <LayoutGrid size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Active Counter</span>
                <span className="text-sm font-black text-white uppercase tracking-wider">{currentCounter.name} ({currentCounter.prefix})</span>
              </div>
            </div>
          )}

          <a 
            href={`tel:${supportPhone.replace(/\s+/g, '')}`}
            className="hidden xl:flex items-center gap-3 bg-white/5 px-3 py-2 rounded-lg border border-white/8 ml-1 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#E1261C]/30 flex items-center justify-center text-[#E1261C]"><Phone size={14} /></div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Call For Support</span>
              <span className="text-sm font-black text-white">{supportPhone}</span>
            </div>
          </a>
        </div>
      </nav>

      {/* Passcode Modals */}
      <ManagerPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handleManagerAuthSuccess}
      />

      <ManagerControlPanel
        isOpen={isControlPanelOpen}
        onClose={() => setIsControlPanelOpen(false)}
        managerInfo={managerInfo}
      />
    </>
  );
}

function ToolbarIcon({ icon, onClick, label }) {
  return (
    <button onClick={onClick} title={label} className="text-slate-400 hover:text-white p-2.5 rounded-lg hover:bg-white/8 transition-all active:scale-90 cursor-pointer">
      {icon}
    </button>
  );
}
