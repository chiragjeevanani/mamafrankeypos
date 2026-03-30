import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../user/context/ThemeContext';
import KdsTopNavbar from './KdsTopNavbar';

export default function KdsLayout() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDarkMode ? 'bg-[#1a1c1e] text-white' : 'bg-stone-50 text-stone-900'}`}>
      <KdsTopNavbar />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

