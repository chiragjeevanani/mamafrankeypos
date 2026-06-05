import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, Table, Users, CreditCard,
  ChevronRight, LogOut, Clock, CheckCircle2,
  XCircle, Map, List, Calendar, UserPlus, Star,
  Receipt, History, Banknote, Monitor, UserCircle,
  RefreshCcw, LayoutGrid, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePos } from '../../context/PosContext';

export default function PosSidebar({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, currentCounter, closeSidebar } = usePos();

  // ─── Navigation structure ──────────────────────────────────────────────────
  const navGroups = [
    {
      label: 'Operations',
      items: [
        {
          label: 'Dashboard',
          path: '/pos/dashboard',
          icon: LayoutGrid,
          subItems: null
        },
        {
          label: 'Orders',
          path: '/pos/orders',
          icon: ShoppingCart,
          subItems: [
            { label: 'Active Orders',    path: '/pos/orders/active',    icon: Clock },
            { label: 'Completed Orders', path: '/pos/orders/completed', icon: CheckCircle2 },
            { label: 'Cancelled Orders', path: '/pos/orders/cancelled', icon: XCircle },
          ]
        },
        {
          label: 'Menu Management',
          path: '/pos/menu',
          icon: BookOpen,
          subItems: null
        },
      ]
    },
    {
      label: 'Floor Management',
      items: [
        {
          label: 'Tables',
          path: '/pos/tables',
          icon: Table,
          subItems: [
            { label: 'Table Layout', path: '/pos/tables/layout', icon: Map },
            { label: 'Table List',   path: '/pos/tables/list',   icon: List },
            { label: 'Reservations', path: '/pos/tables/reservations', icon: Calendar },
          ]
        },
      ]
    },
    {
      label: 'CRM',
      items: [
        {
          label: 'Customers',
          path: '/pos/customers',
          icon: Users,
          subItems: [
            { label: 'Customer List',  path: '/pos/customers/list',    icon: List },
            { label: 'Add Customer',   path: '/pos/customers/add',     icon: UserPlus },
            { label: 'Loyalty Points', path: '/pos/customers/loyalty', icon: Star },
          ]
        },
      ]
    },
    {
      label: 'Finance',
      items: [
        {
          label: 'Billing & Payments',
          path: '/pos/billing',
          icon: CreditCard,
          subItems: [
            { label: 'Generate Bill',    path: '/pos/billing/generate', icon: Receipt },
            { label: 'Payment History',  path: '/pos/billing/history',  icon: History },
            { label: 'Cash Register',    path: '/pos/billing/register', icon: Banknote },
          ]
        },
      ]
    }
  ];

  // ─── Compute which parent menus should be auto-expanded based on current route ─
  const activeParentLabels = useMemo(() => {
    const active = [];
    navGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.subItems) {
          const anySubActive = item.subItems.some(sub =>
            location.pathname === sub.path || location.pathname.startsWith(sub.path + '/')
          );
          const parentActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          if (anySubActive || parentActive) {
            active.push(item.label);
          }
        }
      });
    });
    return active;
  }, [location.pathname]);

  // ─── Accordion state — initialise from route, keep user overrides ───────────
  const [expandedMenus, setExpandedMenus] = useState(activeParentLabels);

  // When sidebar opens, ensure the currently-active menu is expanded
  useEffect(() => {
    if (isOpen) {
      setExpandedMenus(prev => {
        const merged = [...new Set([...prev, ...activeParentLabels])];
        return merged;
      });
    }
  }, [isOpen, activeParentLabels]);

  const toggleSubmenu = (label) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  // ─── Shared logout handler ───────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate('/pos/login');
  };

  // ─── Terminal label: use real counter name if available ──────────────────────
  const terminalLabel = currentCounter?.name || 'Terminal 01';

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-[#161820] text-slate-300 z-[100] transition-all duration-300 shadow-2xl flex flex-col w-64 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* ── Brand Header ──────────────────────────────────────────────────── */}
      <div className="h-14 flex items-center gap-3 px-5 border-b border-white/8 shrink-0 bg-[#0F1012]">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
          <Monitor size={16} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-extrabold text-[13px] tracking-tight text-white uppercase truncate">
            Time to eat POS
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            {terminalLabel}
          </span>
        </div>
      </div>

      {/* ── Staff Identity ────────────────────────────────────────────────── */}
      <div className="px-4 py-5 border-b border-white/5 bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
            <UserCircle size={22} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[12px] font-black text-white uppercase truncate">
              {user?.name || 'Unauthorized'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">
                {user?.role || 'Guest'}
              </span>
            </div>
          </div>
        </div>

        {/* Switch User — logs out and goes back to login for the next staff member */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 py-2.5 bg-white/5 hover:bg-blue-600 hover:text-white border border-white/8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
        >
          <RefreshCcw size={12} className="group-hover:rotate-180 transition-all duration-500" />
          Switch User
        </button>
      </div>

      {/* ── Navigation Groups ─────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 no-scrollbar space-y-5">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-0.5">
            {/* Group label */}
            <div className="px-3 mb-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {group.label}
              </span>
            </div>

            {group.items.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (location.pathname.startsWith(item.path + '/')) ||
                (item.subItems && location.pathname.startsWith(item.path));
              const isExpanded = expandedMenus.includes(item.label);


              return (
                <div key={item.label} className="space-y-0.5">
                  {/* Parent menu button */}
                  <button
                    onClick={() => {
                      if (item.subItems) {
                        toggleSubmenu(item.label);
                      } else {
                        navigate(item.path);
                        closeSidebar();
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all relative group h-12 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'text-slate-300 hover:bg-white/6 hover:text-white'
                    }`}
                  >
                    <item.icon
                      size={17}
                      className={
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-blue-400 transition-colors'
                      }
                    />
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider flex-1 text-left ${
                        isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>
                    {/* Chevron only for items with sub-menus */}
                    {item.subItems && (
                      <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronRight
                          size={12}
                          className={isActive ? 'text-white/70' : 'text-slate-500'}
                        />
                      </motion.div>
                    )}
                  </button>

                  {/* Sub-items with smooth height animation */}
                  <AnimatePresence initial={false}>
                    {item.subItems && isExpanded && (
                      <motion.div
                        key="submenu"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden pl-3 space-y-0.5 pt-0.5 pb-1"
                      >
                        {item.subItems.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;
                          return (
                            <button
                              key={subItem.label}
                              onClick={() => {
                              navigate(subItem.path);
                              closeSidebar();
                            }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                                isSubActive
                                  ? 'text-blue-300 bg-blue-500/12 border-l-2 border-blue-400'
                                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {subItem.icon && (
                                <subItem.icon
                                  size={13}
                                  className={
                                    isSubActive
                                      ? 'text-blue-400'
                                      : 'text-slate-500 group-hover:text-slate-300'
                                  }
                                />
                              )}
                              <span
                                className={`text-[10px] font-bold uppercase tracking-widest leading-none ${
                                  isSubActive ? 'text-blue-300' : ''
                                }`}
                              >
                                {subItem.label}
                              </span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Footer: single sign-out removed — Switch User above handles logout ─ */}
      {/* Intentionally left minimal. The Sign Out Terminal was a duplicate of    */}
      {/* Switch User (same logout() + navigate('/pos/login') call).              */}
      <div className="p-3 border-t border-white/8 bg-[#0F1012] shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/8 transition-all"
        >
          <LogOut size={15} />
          <div className="flex flex-col items-start">
            <span className="font-black text-[10px] uppercase tracking-widest leading-none">
              Sign Out Terminal
            </span>
            <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">
              {user?.name || ''}
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}
