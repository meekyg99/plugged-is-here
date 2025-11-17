import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ProductWithDetails } from '../../types/database';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          variants:product_variants(*),
          images:product_images(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data as any || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout activePage="products">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl tracking-wider uppercase font-light">Products</h1>
            <p className="text-gray-600 mt-2">Manage your product catalog</p>
          </div>
          <a
            href="/admin/products/new"
            className="px-6 py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </a>
        </div>

        <div className="bg-white shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
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
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-gray-700">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-gray-700">
                      Variants
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs tracking-wider uppercase text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 flex-shrink-0">
                            {product.images?.[0] && (
                              <img
                                src={product.images[0].image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {product.category?.name || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {product.variants?.length || 0} variant(s)
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            product.is_featured
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {product.is_featured ? 'Featured' : 'Regular'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/admin/products/${product.id}`}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
