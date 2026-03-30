
import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../navigation/Sidebar';
import TopBar from '../navigation/TopBar';

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0EBE3] text-stone-800 font-sans selection:bg-amber-50">
      {/* Structural Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`flex-1 flex flex-col h-screen min-w-0 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <TopBar />

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar">
          <Suspense fallback={
            <div className="h-full w-full flex items-center justify-center">
              <div className="w-8 h-8 border-[3px] border-[#5D4037] border-t-transparent rounded-full animate-spin shadow-sm" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
