import React, { useState } from 'react';
import { 
  Search, Wallet, LayoutGrid, Power, Phone, 
  FileText, Receipt, Banknote, History, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePos } from '../context/PosContext';
import { playClickSound } from '../utils/sounds';
import logo from '../../../assets/time-to-eat.png';

export default function PosTopNavbar() {
  const navigate = useNavigate();
  const { logout, storeSettings, currentCounter } = usePos();
  const [searchBillNo, setSearchBillNo] = useState('');

  // Dropdown states
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchBillNo.trim()) {
      playClickSound();
      navigate(`/pos/orders/active?search=${encodeURIComponent(searchBillNo.trim())}`);
      setSearchBillNo('');
    }
  };

  const supportPhone = storeSettings?.phone || "07969 223344";

  return (
    <nav className="sticky top-0 z-50 bg-[#1C1E22] border-b border-white/8 h-14 flex items-center px-4 justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="h-7 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Logo" className="h-full w-auto object-contain" />
          </div>
          <span className="text-white font-bold text-xs uppercase tracking-tight border-l border-white/10 pl-3">Time to eat</span>
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
        {/* Finance / Cash Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { playClickSound(); setIsFinanceOpen(!isFinanceOpen); setIsOrdersOpen(false); }}
            className={`p-2.5 hover:bg-white/8 rounded-lg transition-colors cursor-pointer group ${isFinanceOpen ? 'bg-white/8' : ''}`}
            title="Finance & Register"
          >
            <Wallet size={18} className={`text-slate-300 group-hover:text-emerald-400 transition-colors ${isFinanceOpen ? 'text-emerald-400' : ''}`} />
          </button>
          
          {isFinanceOpen && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setIsFinanceOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-[#1C1E22] border border-white/8 rounded-lg shadow-xl overflow-hidden z-[70] py-1 font-sans text-left">
                <button
                  onClick={() => { playClickSound(); setIsFinanceOpen(false); navigate('/pos/billing/generate'); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/6 hover:text-white transition-all uppercase tracking-wider flex items-center gap-2"
                >
                  <Receipt size={14} className="text-slate-400" />
                  Generate Bill
                </button>
                <button
                  onClick={() => { playClickSound(); setIsFinanceOpen(false); navigate('/pos/billing/history'); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/6 hover:text-white transition-all uppercase tracking-wider flex items-center gap-2"
                >
                  <History size={14} className="text-slate-400" />
                  Payment History
                </button>
              </div>
            </>
          )}
        </div>

        {/* Orders Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { playClickSound(); setIsOrdersOpen(!isOrdersOpen); setIsFinanceOpen(false); }}
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
                <button
                  onClick={() => { playClickSound(); setIsOrdersOpen(false); navigate('/pos/orders/completed'); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/6 hover:text-white transition-all uppercase tracking-wider flex items-center gap-2"
                >
                  <CheckCircle2 size={14} className="text-slate-400" />
                  Completed Orders
                </button>
                <button
                  onClick={() => { playClickSound(); setIsOrdersOpen(false); navigate('/pos/orders/cancelled'); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/6 hover:text-white transition-all uppercase tracking-wider flex items-center gap-2"
                >
                  <XCircle size={14} className="text-slate-400" />
                  Cancelled Orders
                </button>
              </div>
            </>
          )}
        </div>
        
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
  );
}

function ToolbarIcon({ icon, onClick, label }) {
  return (
    <button onClick={onClick} title={label} className="text-slate-400 hover:text-white p-2.5 rounded-lg hover:bg-white/8 transition-all active:scale-90">
      {icon}
    </button>
  );
}
