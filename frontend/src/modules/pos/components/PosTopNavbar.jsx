import React, { useState } from 'react';
import { 
  Search, BookOpen, Wallet, LayoutGrid, Power, Phone, User, 
  FileText, History, SlidersHorizontal, UserPlus, Star, Receipt, Banknote, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePos } from '../context/PosContext';
import { playClickSound } from '../utils/sounds';
import logo from '../../../assets/time-to-eat.png';

export default function PosTopNavbar() {
  const navigate = useNavigate();
  const { logout, toggleCustomerSection, storeSettings } = usePos();
  const [searchBillNo, setSearchBillNo] = useState('');

  // Dropdown states
  const [isCrmOpen, setIsCrmOpen] = useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchBillNo.trim()) {
      playClickSound();
      // Navigate to active orders page with the search query param
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
        <ToolbarIcon onClick={() => { playClickSound(); navigate('/pos/menu'); }} label="Management" icon={<BookOpen size={18} />} />
        
        {/* Finance / Cash Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { playClickSound(); setIsFinanceOpen(!isFinanceOpen); setIsCrmOpen(false); setIsOrdersOpen(false); }}
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
                  onClick={() => { playClickSound(); setIsFinanceOpen(false); navigate('/pos/billing/register'); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/6 hover:text-white transition-all uppercase tracking-wider flex items-center gap-2"
                >
                  <Banknote size={14} className="text-slate-400" />
                  Cash Register
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

        <ToolbarIcon onClick={() => { playClickSound(); navigate('/pos/dashboard'); }} label="Dashboard" icon={<LayoutGrid size={18} />} />
        
        {/* Orders Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { playClickSound(); setIsOrdersOpen(!isOrdersOpen); setIsCrmOpen(false); setIsFinanceOpen(false); }}
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
        
        {/* CRM / User Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { playClickSound(); setIsCrmOpen(!isCrmOpen); setIsFinanceOpen(false); setIsOrdersOpen(false); }}
            className={`p-2.5 hover:bg-white/8 rounded-lg transition-colors cursor-pointer group ${isCrmOpen ? 'bg-white/8' : ''}`}
            title="CRM & Customers"
          >
            <User size={20} className={`text-slate-300 group-hover:text-blue-400 transition-colors ${isCrmOpen ? 'text-blue-400' : ''}`} />
          </button>
          
          {isCrmOpen && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setIsCrmOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-[#1C1E22] border border-white/8 rounded-lg shadow-xl overflow-hidden z-[70] py-1 font-sans text-left">
                <button
                  onClick={() => { playClickSound(); setIsCrmOpen(false); navigate('/pos/customers/list'); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/6 hover:text-white transition-all uppercase tracking-wider flex items-center gap-2"
                >
                  <User size={14} className="text-slate-400" />
                  Customer List
                </button>
                <button
                  onClick={() => { playClickSound(); setIsCrmOpen(false); navigate('/pos/customers/add'); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/6 hover:text-white transition-all uppercase tracking-wider flex items-center gap-2"
                >
                  <UserPlus size={14} className="text-slate-400" />
                  Add Customer
                </button>
                <button
                  onClick={() => { playClickSound(); setIsCrmOpen(false); navigate('/pos/customers/loyalty'); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/6 hover:text-white transition-all uppercase tracking-wider flex items-center gap-2"
                >
                  <Star size={14} className="text-slate-400" />
                  Loyalty Points
                </button>
                
                {window.location.pathname.includes('/pos/order/') && (
                  <button
                    onClick={() => { playClickSound(); setIsCrmOpen(false); toggleCustomerSection(); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/6 hover:text-blue-400 transition-all border-t border-white/5 uppercase tracking-wider flex items-center gap-2"
                  >
                    <SlidersHorizontal size={14} className="text-slate-400" />
                    Toggle CRM Panel
                  </button>
                )}
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
