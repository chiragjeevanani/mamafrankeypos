import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChefHat, LayoutGrid, ListOrdered, 
  History, Settings, Timer, ShieldAlert,
  LogOut, Bell, Clock, Sun, Moon, Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../user/context/ThemeContext';

export default function KdsTopNavbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const primaryNav = [
    { path: "/kds/dashboard", icon: LayoutGrid, label: "Dashboard" },
    { path: "/kds/incoming", icon: Bell, label: "Incoming" },
    { path: "/kds/preparing", icon: Clock, label: "Preparing" },
    { path: "/kds/completed", icon: History, label: "Completed" },
  ];

  const settingsNav = [
    { path: "/kds/settings/stations", icon: ListOrdered, label: "Stations" },
    { path: "/kds/settings/prep-time", icon: Timer, label: "SLOs" },
    { path: "/kds/settings/priority", icon: ShieldAlert, label: "Rules" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('kds_access');
    navigate('/kds/login');
  };

  return (
    <nav className={`h-14 border-b shrink-0 flex items-center px-5 justify-between transition-colors duration-500 z-[100] ${
      isDarkMode ? 'bg-[#181a1c] border-white/8 shadow-xl' : 'bg-white border-stone-200 shadow-sm'
    }`}>
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#5D4037] rounded-xl flex items-center justify-center text-[#D4AF37] shadow-md shadow-[#5D4037]/20">
          <ChefHat size={18} />
        </div>
        <div className="hidden sm:flex flex-col">
          <span className={`font-black text-sm uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#5D4037]'}`}>Kitchen Display</span>
          <span className={`text-[9px] font-bold uppercase tracking-widest leading-none ${isDarkMode ? 'text-stone-400' : 'text-stone-400'}`}>NODE_KDS_01</span>
        </div>
      </div>

      {/* Center: Main Navigation */}
      <div className={`flex items-center gap-1 p-1 rounded-xl border transition-all ${
        isDarkMode ? 'bg-black/30 border-white/8' : 'bg-stone-100 border-stone-200'
      }`}>
        {primaryNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                isActive 
                  ? 'bg-[#5D4037] text-white shadow-md' 
                  : (isDarkMode ? 'text-stone-300 hover:text-white hover:bg-white/8' : 'text-stone-500 hover:text-[#5D4037] hover:bg-white')
              }`}
            >
              <item.icon size={15} />
              <span className="hidden lg:inline">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Settings Icons */}
        <div className={`hidden md:flex items-center gap-1 mr-2 border-r pr-3 ${isDarkMode ? 'border-white/8' : 'border-stone-200'}`}>
          {settingsNav.map((item) => {
             const isActive = location.pathname === item.path;
             return (
               <button
                 key={item.path}
                 onClick={() => navigate(item.path)}
                 className={`p-2 rounded-lg transition-all ${
                   isActive 
                    ? 'text-[#D4AF37] bg-white/8' 
                    : (isDarkMode ? 'text-stone-400 hover:text-stone-200 hover:bg-white/6' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100')
                 }`}
                 title={item.label}
               >
                 <item.icon size={17} />
               </button>
             );
          })}
        </div>

        <button 
          onClick={toggleTheme}
          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
            isDarkMode ? 'bg-white/6 text-stone-300 border-white/8 hover:bg-white/12' : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
          }`}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button 
          onClick={handleLogout}
          className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
