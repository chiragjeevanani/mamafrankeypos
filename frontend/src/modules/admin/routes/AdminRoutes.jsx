import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import AdminDashboard from '../pages/AdminDashboard';
import OutletManagement from '../pages/OutletManagement';
import StaffManagement from '../pages/StaffManagement';
import FinancialManagement from '../pages/FinancialManagement';
import OrderManagement from '../pages/OrderManagement';
import SystemSettings from '../pages/SystemSettings';
import AuditLogs from '../pages/AuditLogs';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';
import CustomerManagement from '../pages/CustomerManagement';
import AdminLoginPage from '../pages/AdminLoginPage';
import DataVisibility from '../pages/DataVisibility';
import DataAdjustmentProtocol from '../pages/DataAdjustmentProtocol';
import ProtectedRoute from '../../../components/common/ProtectedRoute';

// Sub-pages imports
import Categories from '../pages/menu/Categories';
import MenuItems from '../pages/menu/MenuItems';
import ComboMeals from '../pages/menu/ComboMeals';
import DishReplacementManagement from '../pages/menu/DishReplacementManagement';

import AllOrders from '../pages/orders/AllOrders';
import OnlineOrders from '../pages/orders/OnlineOrders';
import CancelledOrders from '../pages/orders/CancelledOrders';

import Roles from '../pages/staff/Roles';
import Attendance from '../pages/staff/Attendance';

import SalesReports from '../pages/reports/SalesReports';
import CustomerReports from '../pages/reports/CustomerReports';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      
      <Route element={
        <ProtectedRoute authKey="admin_access" redirectPath="/admin/login">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="outlets" element={<OutletManagement />} />
        
        {/* Menu Management */}
        <Route path="menu" element={<Navigate to="items" replace />} />
        <Route path="menu/categories" element={<Categories />} />
        <Route path="menu/items" element={<MenuItems />} />

        <Route path="menu/combos" element={<ComboMeals />} />
        <Route path="menu/substitutions" element={<DishReplacementManagement />} />
        
        {/* Order Management */}
        <Route path="orders" element={<OrderManagement />} />
        <Route path="orders/all" element={<AllOrders />} />
        <Route path="orders/online" element={<OnlineOrders />} />
        <Route path="orders/cancelled" element={<CancelledOrders />} />
        
        {/* Staff & User Management */}
        <Route path="staff" element={<StaffManagement />} />
        <Route path="staff/list" element={<StaffManagement />} />
        <Route path="staff/roles" element={<Roles />} />
        <Route path="staff/attendance" element={<Attendance />} />
        
        {/* Reports & Analytics */}
        <Route path="reports/sales" element={<SalesReports />} />
        <Route path="reports/customers" element={<CustomerReports />} />
        
        {/* Misc & Settings */}
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="tables" element={<Navigate to="/admin/settings/tables" replace />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="finance" element={<FinancialManagement />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="settings/:section" element={<SystemSettings />} />
        <Route path="adjustment-protocols" element={<DataAdjustmentProtocol />} />

        {/* Handle missing sub-routes by redirecting to Admin Dashboard */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
