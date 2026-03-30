import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from '../pages/LandingPage';
import MenuPage from '../pages/MenuPage';
import ItemDetailPage from '../pages/ItemDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderTrackingPage from '../pages/OrderTrackingPage';
import OrderSuccessPage from '../pages/OrderSuccessPage';
import ProfilePage from '../pages/ProfilePage';
import MyOrdersPage from '../pages/MyOrdersPage';
import LoyaltyPointsPage from '../pages/LoyaltyPointsPage';
import OffersPage from '../pages/OffersPage';
import FeedbackPage from '../pages/FeedbackPage';
import FavoritesPage from '../pages/FavoritesPage';
import PrivacySettingsPage from '../pages/PrivacySettingsPage';
import AppSettingsPage from '../pages/AppSettingsPage';
import UserLoginPage from '../pages/UserLoginPage';
import UserSignupPage from '../pages/UserSignupPage';

export default function UserRoutes() {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('user_token'); // Mock auth check

  return (
    <div className="select-none touch-pan-y overflow-x-hidden">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to={isLoggedIn ? "/menu" : "/welcome"} replace />} />
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/login" element={<UserLoginPage />} />
          <Route path="/signup" element={<UserSignupPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/item/:id" element={<ItemDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-tracking" element={<OrderTrackingPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/loyalty" element={<LoyaltyPointsPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/privacy" element={<PrivacySettingsPage />} />
          <Route path="/settings" element={<AppSettingsPage />} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
