import { Routes, Route, Navigate } from 'react-router-dom';
import StaffLogin from '../pages/StaffLogin';
import StaffDashboard from '../pages/StaffDashboard';
import MyTables from '../pages/MyTables';
import ActiveOrders from '../pages/ActiveOrders';
import ReadyOrders from '../pages/ReadyOrders';
import CreateOrder from '../pages/CreateOrder';
import AddCustomer from '../pages/AddCustomer';
import CustomerList from '../pages/CustomerList';
import MyProfile from '../pages/MyProfile';
import Attendance from '../pages/Attendance';
import TableOrderScreen from '../pages/TableOrderScreen';
import AlertsPage from '../pages/AlertsPage';
import ViewKOT from '../pages/ViewKOT';
import SettleBill from '../pages/SettleBill';

export default function StaffRoutes() {
  const isStaffAuthenticated = localStorage.getItem('staff_access'); // Mock auth check

  return (
    <div className="staff-module min-h-screen">
      <Routes>
        <Route path="/" element={<Navigate to={isStaffAuthenticated ? "/staff/dashboard" : "/staff/login"} replace />} />
        <Route path="/login" element={<StaffLogin />} />
        <Route path="/dashboard" element={<StaffDashboard />} />
        <Route path="/tables" element={<MyTables />} />
        
        {/* Order Routes */}
        <Route path="/active-orders" element={<ActiveOrders />} />
        <Route path="/ready-orders" element={<ReadyOrders />} />
        <Route path="/create-order" element={<CreateOrder />} />
        <Route path="/table/:id" element={<TableOrderScreen />} />
        <Route path="/table/:id/kots" element={<ViewKOT />} />
        <Route path="/table/:id/settle" element={<SettleBill />} />
        
        {/* Customer Routes */}
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/add" element={<AddCustomer />} />
        
        {/* Profile Routes */}
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/alerts" element={<AlertsPage />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/staff/dashboard" replace />} />
      </Routes>
    </div>
  );
}

