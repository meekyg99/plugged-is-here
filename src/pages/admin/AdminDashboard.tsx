import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Logo from '../../components/Logo';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  lowStockCount: number;
  totalCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRestock, setPendingRestock] = useState(0);
  const [restockPreview, setRestockPreview] = useState<any[]>([]);
  const [restockLoading, setRestockLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchRestockNotifications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('total, created_at, status')
        .order('created_at', { ascending: false });

      const { data: variants } = await supabase
        .from('product_variants')
        .select('stock_quantity, low_stock_threshold');

      const { data: customers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'customer');

      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('*, items:order_items(*, product:products(name))')
        .order('created_at', { ascending: false })
        .limit(5);

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const lowStockCount = variants?.filter(
        v => v.stock_quantity <= v.low_stock_threshold
      ).length || 0;
      const totalCustomers = customers?.length || 0;


      setStats({
        totalRevenue,
        totalOrders,
        lowStockCount,
        totalCustomers,
        revenueGrowth: 12.5,
        ordersGrowth: 8.3,
      });

      setRecentOrders(recentOrdersData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestockNotifications = async () => {
    setRestockLoading(true);
    try {
      const { data, error } = await supabase
        .from('restock_notifications')
        .select('id, email, variant_id, notified, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      const preview = data || [];
      setRestockPreview(preview);
      const pending = preview.filter((item) => item.notified === false).length;
      setPendingRestock(pending);
    } catch (error) {
      console.error('Error fetching restock notifications:', error);
    } finally {
      setRestockLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Revenue',
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: `+${stats.revenueGrowth}%`,
      changeType: 'positive' as const,
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: `+${stats.ordersGrowth}%`,
      changeType: 'positive' as const,
    },
    {
      name: 'Low Stock Items',
      value: stats.lowStockCount.toLocaleString(),
      icon: AlertTriangle,
      change: stats.lowStockCount > 0 ? 'Needs attention' : 'All good',
      changeType: stats.lowStockCount > 0 ? ('negative' as const) : ('neutral' as const),
    },
    {
      name: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      icon: Users,
      change: '+15 this month',
      changeType: 'positive' as const,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout activePage="dashboard">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="dashboard">
      <div className="p-8">
            <div className="mb-8 space-y-2">
              <div className="flex items-center gap-3">
                <Logo />
                <span className="text-xs tracking-wider text-gray-500 uppercase">Admin Dashboard</span>
              </div>
              <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your store.</p>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.name} className="bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                  {card.changeType === 'positive' && <TrendingUp className="w-5 h-5 text-green-600" />}
                </div>
                <p className="text-2xl font-light mb-1">{card.value}</p>
                <p className="text-sm text-gray-600 tracking-wider uppercase">{card.name}</p>
                <p
                  className={`text-xs mt-2 ${
                    card.changeType === 'positive'
                      ? 'text-green-600'
                      : card.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {card.change}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 shadow-sm">
            <h2 className="text-xl tracking-wider uppercase font-light mb-6">Recent Orders</h2>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{order.order_number}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">₦{order.total.toLocaleString()}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              )}
            </div>
            <a
              href="/admin/orders"
              className="block text-center mt-6 py-2 border border-black uppercase tracking-wider text-sm hover:bg-gray-100 transition-colors"
            >
              View All Orders
            </a>
          </div>

          <div className="bg-white p-6 shadow-sm">
            <h2 className="text-xl tracking-wider uppercase font-light mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/admin/products/new"
                className="p-4 border border-gray-300 hover:border-black transition-colors text-center"
              >
                <Package className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                <p className="text-sm tracking-wider">Add Product</p>
              </a>
              <a
                href="/admin/orders"
                className="p-4 border border-gray-300 hover:border-black transition-colors text-center"
              >
                <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                <p className="text-sm tracking-wider">View Orders</p>
              </a>
              <a
                href="/admin/inventory"
                className="p-4 border border-gray-300 hover:border-black transition-colors text-center"
              >
                <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                <p className="text-sm tracking-wider">Low Stock</p>
              </a>
              <a
                href="/admin/reports"
                className="p-4 border border-gray-300 hover:border-black transition-colors text-center"
              >
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                <p className="text-sm tracking-wider">View Reports</p>
              </a>
            </div>
          </div>
        </div>
        </div>

        <div className="bg-white p-6 shadow-sm mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-500">Notification Center</p>
              <p className="text-2xl font-light">{pendingRestock} pending restock alerts</p>
            </div>
            <button
              onClick={fetchRestockNotifications}
              className="px-4 py-2 border border-black uppercase text-xs tracking-wider hover:bg-black hover:text-white transition-colors"
            >
              Refresh
            </button>
          </div>
          <div>
            {restockLoading ? (
              <div className="text-center text-sm text-gray-500">Loading notification queue...</div>
            ) : restockPreview.length === 0 ? (
              <p className="text-sm text-gray-500">No restock subscriptions yet.</p>
            ) : (
              <ul className="space-y-2">
                {restockPreview.map((notification) => (
                  <li key={notification.id} className="flex items-center justify-between text-sm border border-gray-100 px-3 py-2 rounded">
                    <span className="font-medium">
                      {notification.email} · {notification.variant_id}
                    </span>
                    <span className="text-[10px] tracking-wider uppercase text-gray-500">
                      {notification.notified ? 'Sent' : 'Pending'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Notification delivery will be wired up next so you can trigger emails for restock and order updates directly from this view.
          </p>
        </div>
    </AdminLayout>
  );
}
