import { Routes, Route, Navigate } from 'react-router-dom';
import PosLayout from '../components/layout/PosLayout';
import PosLoginPage from '../pages/PosLoginPage';
import ProtectedRoute from '../../../components/common/ProtectedRoute';

// Orders sub-pages
import ActiveOrders from '../pages/orders/ActiveOrders';
import OrderDashboard from '../pages/orders/OrderDashboard';
import CompletedOrders from '../pages/orders/CompletedOrders';
import CancelledOrders from '../pages/orders/CancelledOrders';
import GenerateBill from '../pages/billing/GenerateBill';
import PaymentHistory from '../pages/billing/PaymentHistory';
import CashRegister from '../pages/billing/CashRegister';
import CustomerList from '../pages/customers/CustomerList';
import AddCustomer from '../pages/customers/AddCustomer';
import LoyaltyPoints from '../pages/customers/LoyaltyPoints';

// Menu sub-pages
import MenuManagement from '../pages/menu/MenuManagement';

// Operations sub-pages
import OperationsDashboard from '../pages/operations/OperationsDashboard';

// Tables sub-pages
import TableView from '../pages/tables/TableView';
import TableLayout from '../pages/tables/TableLayout';
import TableList from '../pages/tables/TableList';
import Reservations from '../pages/tables/Reservations';
import PosOrderPage from '../pages/tables/PosOrderPage';

export default function PosRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PosLoginPage />} />
      
      <Route element={
        <ProtectedRoute authKey="pos_access" redirectPath="/pos/login">
          <PosLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/pos/tables" replace />} />

        {/* Orders Routes */}
        <Route path="orders/active" element={<ActiveOrders />} />
        <Route path="dashboard" element={<OrderDashboard />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="operations" element={<OperationsDashboard />} />
        <Route path="orders/completed" element={<CompletedOrders />} />
        <Route path="orders/cancelled" element={<CancelledOrders />} />

        {/* Billing Routes */}
        <Route path="billing" element={<Navigate to="/pos/billing/generate" replace />} />
        <Route path="billing/generate" element={<GenerateBill />} />
        <Route path="billing/history" element={<PaymentHistory />} />
        <Route path="billing/register" element={<CashRegister />} />

        {/* Customer Routes */}
        <Route path="customers" element={<Navigate to="/pos/customers/list" replace />} />
        <Route path="customers/list" element={<CustomerList />} />
        <Route path="customers/add" element={<AddCustomer />} />
        <Route path="customers/loyalty" element={<LoyaltyPoints />} />

        {/* Tables Routes */}
        <Route path="tables" element={<TableView />} />
        <Route path="tables/layout" element={<TableLayout />} />
        <Route path="tables/list" element={<TableList />} />
        <Route path="tables/reservations" element={<Reservations />} />
        <Route path="order/:tableId" element={<PosOrderPage />} />

        {/* Fallback for any other /pos/* matching routes */}
        <Route path="*" element={<Navigate to="/pos/tables" replace />} />
      </Route>
    </Routes>
  );
}
