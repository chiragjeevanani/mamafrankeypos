import { Routes, Route, Navigate } from 'react-router-dom';
import PosLayout from '../components/layout/PosLayout';
import PosLoginPage from '../pages/PosLoginPage';

// Orders sub-pages
import ActiveOrders from '../pages/orders/ActiveOrders';
import OrderDashboard from '../pages/orders/OrderDashboard';
import CompletedOrders from '../pages/orders/CompletedOrders';
import CancelledOrders from '../pages/orders/CancelledOrders';

// Menu sub-pages
import MenuManagement from '../pages/menu/MenuManagement';

// Operations sub-pages
import OperationsDashboard from '../pages/operations/OperationsDashboard';

// Tables sub-pages
import TableView from '../pages/tables/TableView';
import PosOrderPage from '../pages/tables/PosOrderPage';
import { PosProvider } from '../context/PosContext';

export default function PosRoutes() {
  const isPosAuthenticated = localStorage.getItem('pos_access'); // Mock auth check

  return (
    <Routes>
      <Route path="/login" element={<PosLoginPage />} />
      <Route element={<PosLayout />}>
        <Route path="/" element={<Navigate to={isPosAuthenticated ? "/pos/tables" : "/pos/login"} replace />} />

        {/* Orders Routes */}
        <Route path="/orders/active" element={<ActiveOrders />} />
        <Route path="/dashboard" element={<OrderDashboard />} />
        <Route path="/menu" element={<MenuManagement />} />
        <Route path="/operations" element={<OperationsDashboard />} />
        <Route path="/orders/completed" element={<CompletedOrders />} />
        <Route path="/orders/cancelled" element={<CancelledOrders />} />

        {/* Tables Routes */}
        <Route path="/tables" element={<TableView />} />
        <Route path="/order/:tableId" element={<PosOrderPage />} />

        {/* Fallback for any other /pos/* matching routes */}
        <Route path="*" element={<Navigate to="/pos/tables" replace />} />
      </Route>
    </Routes>
  );
}
