import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PosRoutes from './modules/pos/routes/PosRoutes';
import AdminRoutes from './modules/admin/routes/AdminRoutes';
import { PosProvider } from './modules/pos/context/PosContext';
import { BranchProvider } from './context/BranchContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <BrowserRouter>
      <PosProvider>
        <BranchProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/pos/*" element={<PosRoutes />} />
              <Route path="/admin/*" element={<AdminRoutes />} />
              <Route path="*" element={<Navigate to="/pos" replace />} />
            </Routes>
          </ErrorBoundary>
        </BranchProvider>
      </PosProvider>
    </BrowserRouter>
  );
}

export default App;

