import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './modules/user/context/CartContext';
import { ThemeProvider } from './modules/user/context/ThemeContext';
import UserRoutes from './modules/user/routes/UserRoutes';
import StaffRoutes from './modules/staff/routes/StaffRoutes';
import KdsRoutes from './modules/kds/routes/KdsRoutes';
import PosRoutes from './modules/pos/routes/PosRoutes';
import AdminRoutes from './modules/admin/routes/AdminRoutes';
import { OrderProvider } from './context/OrderContext';
import { PosProvider } from './modules/pos/context/PosContext';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CartProvider>
          <PosProvider>
            <OrderProvider>
              <Routes>
                <Route path="/staff/*" element={<StaffRoutes />} />
                <Route path="/kds/*" element={<KdsRoutes />} />
                <Route path="/pos/*" element={<PosRoutes />} />
                <Route path="/admin/*" element={<AdminRoutes />} />
                <Route path="/*" element={<UserRoutes />} />
              </Routes>
            </OrderProvider>
          </PosProvider>
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
