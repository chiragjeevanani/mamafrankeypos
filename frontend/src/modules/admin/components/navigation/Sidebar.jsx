
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Store, Utensils, Box, Users, 
  ShoppingCart, BarChart3, Settings, LogOut, 
  ChevronLeft, ChevronRight, Truck, CreditCard,
  ShieldCheck, Bell, History, Sliders, Printer, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClickSound } from '../../../pos/utils/sounds';
import logo from '../../../../assets/time-to-eat.png';

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navGroups = [
    {
      label: 'Main',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      label: 'Catalog & Items',
      items: [
        { 
          label: 'Menu Management', 
          path: '/admin/menu', 
          icon: Utensils,
          subItems: [
            { label: 'Categories', path: '/admin/menu/categories' },
            { label: 'Items', path: '/admin/menu/items' },
            { label: 'Modifiers', path: '/admin/menu/modifiers' },
            { label: 'Combo Meals', path: '/admin/menu/combos' },
          ]
        },
      ]
    },
    {
      label: 'Supply Chain',
      items: [
        { 
          label: 'Inventory Management', 
          path: '/admin/inventory', 
          icon: Box,
          subItems: [
            { label: 'Stock Management', path: '/admin/inventory/stock' },
            { label: 'Vendors', path: '/admin/inventory/vendors' },
            { label: 'Purchase Orders', path: '/admin/inventory/orders' },
            { label: 'Wastage', path: '/admin/inventory/wastage' },
          ]
        },
      ]
    },
    {
      label: 'Operations',
      items: [
        { 
          label: 'Order Management', 
          path: '/admin/orders', 
          icon: ShoppingCart,
          subItems: [
            { label: 'All Orders', path: '/admin/orders/all' },
            { label: 'Online Orders', path: '/admin/orders/online' },
            { label: 'Cancelled Orders', path: '/admin/orders/cancelled' },
          ]
        },
      ]
    },
    {
      label: 'Personnel',
      items: [
        { 
          label: 'Staff & User Management', 
          path: '/admin/staff', 
          icon: Users,
          subItems: [
            { label: 'Staff List', path: '/admin/staff/list' },
            { label: 'Roles', path: '/admin/staff/roles' },
            { label: 'Attendance', path: '/admin/staff/attendance' },
          ]
        },
      ]
    },
    {
      label: 'Analytics & Display',
      items: [
        { label: 'Data Visibility', path: '/admin/data-visibility', icon: Eye },
      ]
    },
    {
      label: 'Compliance & Config',
      items: [
        { 
          label: 'Reports & Settings', 
          path: '/admin/reports', 
          icon: BarChart3,
          subItems: [
            { label: 'Sales Reports', path: '/admin/reports/sales' },
            { label: 'Inventory Reports', path: '/admin/reports/inventory' },
            { label: 'Customer Reports', path: '/admin/reports/customers' },
            { label: 'System Settings', path: '/admin/settings' },
          ]
        },
      ]
    }
  ];

  const [expandedMenus, setExpandedMenus] = useState(['Settings']);

  const toggleSubmenu = (label) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label) 
        : [...prev, label]
    );
  };

  return (
    <aside className={`fixed left-0 top-0 h-full bg-[#1A1A1A] border-r border-white/8 z-50 transition-all duration-300 shadow-xl hidden lg:flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/8 shrink-0 bg-[#1A1A1A]">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-7 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Logo" className="h-full w-auto object-contain" />
            </div>
            <div className="flex flex-col border-l border-white/10 pl-3">
              <span className="font-black text-[11px] tracking-tight uppercase text-white leading-tight">Time to eat System</span>
              <span className="text-[8px] font-black text-[#FFD600] uppercase tracking-widest mt-0.5 opacity-80">Administrator</span>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="h-7 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Logo" className="h-full w-auto object-contain" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 no-scrollbar space-y-5">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 mb-1.5">
                <span className="text-[9px] font-black text-white/55 uppercase tracking-[0.22em]">{group.label}</span>
              </div>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.path || (item.subItems && location.pathname.startsWith(item.path));
              const isExpanded = expandedMenus.includes(item.label);
              
              return (
                <div key={item.label} className="space-y-0.5">
                  <button
                    onClick={() => {
                      if (item.subItems && !isCollapsed) {
                        toggleSubmenu(item.label);
                      } else {
                        navigate(item.path);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded transition-all relative group h-12 ${
                      isActive 
                      ? 'bg-[#E1261C] text-white shadow-lg shadow-stone-900/30' 
                      : 'text-white/80 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <item.icon size={16} className={isActive ? 'text-white' : 'text-white/70 group-hover:text-white transition-colors'} />
                    {!isCollapsed && (
                      <>
                        <span className={`text-[11px] font-bold uppercase tracking-wider flex-1 text-left ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                          {item.label}
                        </span>
                        {item.subItems && (
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                          >
                            <ChevronRight size={12} className={isActive ? 'text-white/80' : 'text-white/40'} />
                          </motion.div>
                        )}
                      </>
                    )}
                    {isActive && isCollapsed && (
                      <div className="absolute left-0 w-1 h-7 bg-[#FFD600] rounded-r-full" />
                    )}
                  </button>

                  <AnimatePresence>
                    {item.subItems && isExpanded && !isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-3 space-y-0.5 pb-1"
                      >
                        {item.subItems.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;
                          return (
                            <button
                              key={subItem.label}
                              onClick={() => { playClickSound(); navigate(subItem.path); }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all group ${
                                isSubActive 
                                ? 'text-white bg-[#E1261C]/30 border-l-2 border-[#FFD600]' 
                                : 'text-white/60 hover:text-white hover:bg-white/6'
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-[#FFD600]' : 'bg-white/25 group-hover:bg-white/50'}`} />
                              <span className={`text-[10px] font-bold uppercase tracking-widest leading-none ${isSubActive ? 'text-white' : 'text-white/65 group-hover:text-white'}`}>
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

      {/* Logout Footer */}
      <div className="p-2 border-t border-white/8 bg-black/15">
        <button 
          onClick={() => {
            playClickSound();
            localStorage.removeItem('admin_access');
            navigate('/admin/login');
          }}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded text-white/55 hover:text-white hover:bg-[#E1261C] transition-all ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={16} />
          {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest">Sign Out</span>}
        </button>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => { playClickSound(); setIsCollapsed(!isCollapsed); }}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#E1261C] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#1A1A1A] z-50 hover:scale-110 active:scale-95 transition-all"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
