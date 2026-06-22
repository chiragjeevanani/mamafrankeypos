import { Routes, Route, Navigate } from 'react-router-dom';
import PosLayout from '../components/layout/PosLayout';
import PosLoginPage from '../pages/PosLoginPage';
import ProtectedRoute from '../../../components/common/ProtectedRoute';

// Orders sub-pages
import ActiveOrders from '../pages/orders/ActiveOrders';

// Operations sub-pages
import OperationsDashboard from '../pages/operations/OperationsDashboard';

// Tables sub-pages
import TableView from '../pages/tables/TableView';
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
        <Route path="operations" element={<OperationsDashboard />} />

        {/* Tables Routes */}
        <Route path="tables" element={<TableView />} />
        <Route path="order/:tableId" element={<PosOrderPage />} />
        <Route path="*" element={<Navigate to="/pos/tables" replace />} />
      </Route>
    </Routes>
  );
}
