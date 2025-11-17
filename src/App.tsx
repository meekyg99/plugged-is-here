import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import DevTools from './components/DevTools';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AccountPage from './pages/AccountPage';
import OrdersListPage from './pages/OrdersListPage';
import WishlistPage from './pages/WishlistPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrdersPage from './pages/admin/OrdersPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';
import ProductsPage from './pages/admin/ProductsPage';
import InventoryPage from './pages/admin/InventoryPage';
import CustomersPage from './pages/admin/CustomersPage';
import ReportsPage from './pages/admin/ReportsPage';

function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      {children}
      <Footer />
      <CartDrawer />
      <DevTools />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
              <Route path="/category/:category" element={<AppLayout><CategoryPage /></AppLayout>} />
              <Route path="/products" element={<AppLayout><CategoryPage /></AppLayout>} />
              <Route path="/checkout" element={<AppLayout><CheckoutPage /></AppLayout>} />
              <Route path="/order-success" element={<AppLayout><OrderSuccessPage /></AppLayout>} />
              <Route path="/account" element={<AppLayout><AccountPage /></AppLayout>} />
              <Route path="/orders" element={<AppLayout><OrdersListPage /></AppLayout>} />
              <Route path="/wishlist" element={<AppLayout><WishlistPage /></AppLayout>} />

              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<OrdersPage />} />
              <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
              <Route path="/admin/products" element={<ProductsPage />} />
              <Route path="/admin/inventory" element={<InventoryPage />} />
              <Route path="/admin/customers" element={<CustomersPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
