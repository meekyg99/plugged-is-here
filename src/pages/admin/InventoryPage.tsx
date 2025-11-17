import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AlertTriangle, Package, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function InventoryPage() {
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low_stock'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInventory();
  }, [filter]);

  const fetchInventory = async () => {
    try {
      let query = supabase
        .from('product_variants')
        .select(`
          *,
          product:products(name, slug)
        `)
        .order('stock_quantity', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];
      if (filter === 'low_stock') {
        filteredData = filteredData.filter(
          (v) => v.stock_quantity <= v.low_stock_threshold
        );
      }

      setVariants(filteredData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVariants = variants.filter((variant) =>
    variant.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variant.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = variants.filter(
    (v) => v.stock_quantity <= v.low_stock_threshold
  ).length;

  return (
    <AdminLayout activePage="inventory">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl tracking-wider uppercase font-light">Inventory</h1>
          <p className="text-gray-600 mt-2">Monitor and manage stock levels</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-gray-700" />
            </div>
            <p className="text-2xl font-light">{variants.length}</p>
            <p className="text-sm text-gray-600 tracking-wider uppercase">Total Variants</p>
          </div>

          <div className="bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-2xl font-light">{lowStockCount}</p>
            <p className="text-sm text-gray-600 tracking-wider uppercase">Low Stock Items</p>
          </div>

          <div className="bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-gray-700" />
            </div>
            <p className="text-2xl font-light">
              {variants.reduce((sum, v) => sum + v.stock_quantity, 0)}
            </p>
            <p className="text-sm text-gray-600 tracking-wider uppercase">Total Stock</p>
          </div>
        </div>

        <div className="bg-white shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'low_stock')}
                className="px-4 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors"
              >
                <option value="all">All Items</option>
                <option value="low_stock">Low Stock Only</option>
              </select>
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
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-gray-700">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-gray-700">
                      Variant
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-gray-700">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-gray-700">
                      Threshold
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredVariants.map((variant) => {
                    const isLowStock = variant.stock_quantity <= variant.low_stock_threshold;
                    const isOutOfStock = variant.stock_quantity === 0;

                    return (
                      <tr key={variant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">
                          {variant.product?.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {variant.sku}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {variant.color && `${variant.color} / `}
                          {variant.size}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {variant.stock_quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {variant.low_stock_threshold}
                        </td>
                        <td className="px-6 py-4">
                          {isOutOfStock ? (
                            <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                              In Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredVariants.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No inventory items found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
