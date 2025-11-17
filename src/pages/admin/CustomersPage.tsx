import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Search, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const customersWithOrders = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: orders } = await supabase
            .from('orders')
            .select('id, total')
            .eq('user_id', profile.id);

          const orderCount = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, order) => sum + order.total, 0) || 0;

          return {
            ...profile,
            orderCount,
            totalSpent,
          };
        })
      );

      setCustomers(customersWithOrders);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout activePage="customers">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl tracking-wider uppercase font-light">Customers</h1>
          <p className="text-gray-600 mt-2">View and manage customer accounts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 shadow-sm">
            <p className="text-2xl font-light">{customers.length}</p>
            <p className="text-sm text-gray-600 tracking-wider uppercase">Total Customers</p>
          </div>

          <div className="bg-white p-6 shadow-sm">
            <p className="text-2xl font-light">
              {customers.filter((c) => c.orderCount > 0).length}
            </p>
            <p className="text-sm text-gray-600 tracking-wider uppercase">Active Customers</p>
          </div>

          <div className="bg-white p-6 shadow-sm">
            <p className="text-2xl font-light">
              ₦{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 tracking-wider uppercase">Total Revenue</p>
          </div>
        </div>

        <div className="bg-white shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-gray-700">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-gray-700">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-gray-700">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-gray-700">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-gray-700">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{customer.full_name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{customer.id}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {customer.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {customer.orderCount}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        ₦{customer.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`/admin/customers/${customer.id}`}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCustomers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No customers found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
