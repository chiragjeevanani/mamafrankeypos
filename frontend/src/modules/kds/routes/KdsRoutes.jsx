import { Routes, Route, Navigate } from 'react-router-dom';
import KdsLayout from '../components/KdsLayout';
import KdsDashboard from '../pages/KdsDashboard';
import IncomingOrders from '../pages/IncomingOrders';
import PreparingOrders from '../pages/PreparingOrders';
import CompletedOrders from '../pages/CompletedOrders';
import KitchenStations from '../pages/KitchenStations';
import PreparationTime from '../pages/PreparationTime';
import PriorityRules from '../pages/PriorityRules';
import KdsLoginPage from '../pages/KdsLoginPage';

export default function KdsRoutes() {
  const isKdsAuthenticated = localStorage.getItem('kds_access'); // Mock auth check

  return (
    <Routes>
      <Route path="/login" element={<KdsLoginPage />} />
      <Route element={<KdsLayout />}>
        <Route path="/" element={<Navigate to={isKdsAuthenticated ? "/kds/dashboard" : "/kds/login"} replace />} />
        <Route path="/dashboard" element={<KdsDashboard />} />
        <Route path="/incoming" element={<IncomingOrders />} />
        <Route path="/preparing" element={<PreparingOrders />} />
        <Route path="/completed" element={<CompletedOrders />} />
        
        {/* Settings Sub-routes */}
        <Route path="/settings/stations" element={<KitchenStations />} />
        <Route path="/settings/prep-time" element={<PreparationTime />} />
        <Route path="/settings/priority" element={<PriorityRules />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/kds" replace />} />
    </Routes>
  );
}

