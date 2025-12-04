import { ReactNode, useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Image,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminSession } from '../../hooks/useAdminSession';

interface AdminLayoutProps {
  children: ReactNode;
  activePage?: string;
}

export default function AdminLayout({ children, activePage }: AdminLayoutProps) {
  const { user } = useAuth();
  const { logoutAdmin } = useAdminSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState<string>('');

  // Update session expiry display
  useEffect(() => {
    const updateExpiry = () => {
      const expiresStr = localStorage.getItem('admin_session_expires');
      if (expiresStr) {
        const expires = parseInt(expiresStr);
        const remaining = expires - Date.now();
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        if (remaining > 0) {
          setSessionExpiry(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setSessionExpiry('Expired');
        }
      }
    };

    updateExpiry();
    const interval = setInterval(updateExpiry, 1000);
    return () => clearInterval(interval);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, id: 'dashboard' },
    { name: 'Products', href: '/admin/products', icon: Package, id: 'products' },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, id: 'orders' },
    { name: 'Customers', href: '/admin/customers', icon: Users, id: 'customers' },
    { name: 'Inventory', href: '/admin/inventory', icon: Package, id: 'inventory' },
    { name: 'Content', href: '/admin/content', icon: Image, id: 'content' },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3, id: 'reports' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, id: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="text-xl font-bold tracking-wider uppercase">Admin</div>
          <div className="w-10" />
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-200 space-y-1">
          <div className="text-xl font-bold tracking-wider uppercase">Admin Portal</div>
          <p className="text-xs text-gray-500">Fashion Store Management</p>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm tracking-wider">{item.name}</span>
              </a>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>Session expires in: {sessionExpiry}</span>
                  </div>
                </div>
                <button
                  onClick={logoutAdmin}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
