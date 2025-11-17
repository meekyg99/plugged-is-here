import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Calendar, TrendingUp, Package, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [] as any[],
  });

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const fetchReportsData = async () => {
    try {
      const today = new Date();
      let startDate = new Date();

      if (dateRange === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'week') {
        startDate.setDate(today.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate.setMonth(today.getMonth() - 1);
      } else if (dateRange === 'year') {
        startDate.setFullYear(today.getFullYear() - 1);
      }

      const { data: orders } = await supabase
        .from('orders')
        .select('total, created_at')
        .gte('created_at', startDate.toISOString())
        .eq('status', 'delivered');

      const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const { data: topProductsData } = await supabase
        .from('order_items')
        .select(`
          product:products(name),
          quantity,
          total
        `)
        .limit(10);

      const productMap = new Map();
      topProductsData?.forEach((item: any) => {
        const name = item.product?.name || 'Unknown';
        if (productMap.has(name)) {
          const existing = productMap.get(name);
          existing.quantity += item.quantity;
          existing.revenue += item.total;
        } else {
          productMap.set(name, {
            name,
            quantity: item.quantity,
            revenue: item.total,
          });
        }
      });

      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setSalesData({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topProducts,
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout activePage="reports">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl tracking-wider uppercase font-light">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">View sales performance and insights</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-gray-700" />
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-light">₦{salesData.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-600 tracking-wider uppercase">Total Revenue</p>
              </div>

              <div className="bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Package className="w-8 h-8 text-gray-700" />
                </div>
                <p className="text-2xl font-light">{salesData.totalOrders}</p>
                <p className="text-sm text-gray-600 tracking-wider uppercase">Total Orders</p>
              </div>

              <div className="bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 text-gray-700" />
                </div>
                <p className="text-2xl font-light">₦{salesData.averageOrderValue.toLocaleString()}</p>
                <p className="text-sm text-gray-600 tracking-wider uppercase">Avg Order Value</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 shadow-sm">
                <h2 className="text-xl tracking-wider uppercase font-light mb-6">Top Selling Products</h2>
                <div className="space-y-4">
                  {salesData.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{product.quantity} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">₦{product.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {salesData.topProducts.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No data available</p>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 shadow-sm">
                <h2 className="text-xl tracking-wider uppercase font-light mb-6">Sales Overview</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed Orders</span>
                    <span className="text-sm font-medium">{salesData.totalOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Revenue</span>
                    <span className="text-sm font-medium">₦{salesData.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Order Value</span>
                    <span className="text-sm font-medium">₦{salesData.averageOrderValue.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Data for selected date range. Use the dropdown above to change the period.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
