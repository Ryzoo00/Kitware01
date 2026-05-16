import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import AdminMainLayout from '../layouts/AdminMainLayout.jsx';
import ProtectedRoute from '../components/Auth/ProtectedRoute.jsx';
import AdminRoute from '../components/Auth/AdminRoute.jsx';

// Public Pages
import Home from '../pages/Home.jsx';
import Products from '../pages/Products.jsx';
import ProductDetail from '../pages/ProductDetail.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import VerifyOTP from '../pages/VerifyOTP.jsx';
import Cart from '../pages/Cart.jsx';
import Checkout from '../pages/Checkout.jsx';

// Protected Pages
import Profile from '../pages/Profile.jsx';
import Orders from '../pages/Orders.jsx';
import Wishlist from '../pages/Wishlist.jsx';
import OrderSuccess from '../pages/OrderSuccess.jsx';

// Special Pages
import GiftProducts from '../pages/GiftProducts.jsx';

// Admin Pages
import Dashboard from '../pages/Admin/Dashboard.jsx';
import AdminProducts from '../pages/Admin/Products.jsx';
import AdminOrders from '../pages/Admin/Orders.jsx';
import Users from '../pages/Admin/Users.jsx';
import Analytics from '../pages/Admin/Analytics.jsx';
import Reports from '../pages/Admin/Reports.jsx';
import SiteReviews from '../pages/Admin/SiteReviews.jsx';
import SpecialProducts from '../pages/Admin/SpecialProducts.jsx';
import Heroes from '../pages/Admin/Heroes.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/gift-products" element={<GiftProducts />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminMainLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/heroes" element={<Heroes />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/site-reviews" element={<SiteReviews />} />
          <Route path="/admin/special-products" element={<SpecialProducts />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
