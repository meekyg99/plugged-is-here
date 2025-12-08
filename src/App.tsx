import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import DevTools from './components/DevTools';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import TrackOrderPage from './pages/TrackOrderPage';
import AccountPage from './pages/AccountPage';
import OrdersListPage from './pages/OrdersListPage';
import WishlistPage from './pages/WishlistPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrdersPage from './pages/admin/OrdersPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';
import ProductsPage from './pages/admin/ProductsPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import InventoryPage from './pages/admin/InventoryPage';
import CustomersPage from './pages/admin/CustomersPage';
import ReportsPage from './pages/admin/ReportsPage';
import ContentPage from './pages/admin/ContentPage';

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
      {/* DevTools removed - database already seeded */}
      {/* <DevTools /> */}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
              <Route path="/category/:category" element={<AppLayout><CategoryPage /></AppLayout>} />
              <Route path="/products" element={<AppLayout><CategoryPage /></AppLayout>} />
              <Route path="/checkout" element={<AppLayout><CheckoutPage /></AppLayout>} />
              <Route path="/order-success" element={<AppLayout><OrderSuccessPage /></AppLayout>} />
              <Route path="/order-success/:orderId" element={<AppLayout><OrderSuccessPage /></AppLayout>} />
              <Route path="/track-order" element={<AppLayout><TrackOrderPage /></AppLayout>} />
              <Route path="/account" element={<AppLayout><ProtectedRoute><AccountPage /></ProtectedRoute></AppLayout>} />
              <Route path="/orders" element={<AppLayout><ProtectedRoute><OrdersListPage /></ProtectedRoute></AppLayout>} />
              <Route path="/wishlist" element={<AppLayout><ProtectedRoute><WishlistPage /></ProtectedRoute></AppLayout>} />

              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
              <Route path="/admin/orders" element={<AdminProtectedRoute><OrdersPage /></AdminProtectedRoute>} />
              <Route path="/admin/orders/:id" element={<AdminProtectedRoute><OrderDetailPage /></AdminProtectedRoute>} />
              <Route path="/admin/products" element={<AdminProtectedRoute><ProductsPage /></AdminProtectedRoute>} />
              <Route path="/admin/products/new" element={<AdminProtectedRoute><ProductEditPage /></AdminProtectedRoute>} />
              <Route path="/admin/products/:id" element={<AdminProtectedRoute><ProductEditPage /></AdminProtectedRoute>} />
              <Route path="/admin/inventory" element={<AdminProtectedRoute><InventoryPage /></AdminProtectedRoute>} />
              <Route path="/admin/customers" element={<AdminProtectedRoute><CustomersPage /></AdminProtectedRoute>} />
              <Route path="/admin/content" element={<AdminProtectedRoute><ContentPage /></AdminProtectedRoute>} />
              <Route path="/admin/reports" element={<AdminProtectedRoute><ReportsPage /></AdminProtectedRoute>} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
