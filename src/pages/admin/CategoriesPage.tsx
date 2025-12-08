import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  gender: 'men' | 'women' | 'unisex';
  description?: string;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    gender: 'unisex' as 'men' | 'women' | 'unisex',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) return;

    try {
      const { error } = await supabase.from('categories').insert({
        name: formData.name,
        slug: formData.slug,
        gender: formData.gender,
        description: formData.description || null,
      });

      if (error) throw error;

      setFormData({ name: '', slug: '', gender: 'unisex', description: '' });
      setIsAdding(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. It may be in use by products.');
    }
  };

  const addDefaultCategories = async () => {
    const defaults = [
      { name: 'Agbada', slug: 'agbada', gender: 'men', description: 'Traditional Nigerian flowing robe' },
      { name: 'Ankara Dresses', slug: 'ankara-dresses', gender: 'women', description: 'Vibrant African print dresses' },
      { name: 'Kaftan', slug: 'kaftan', gender: 'unisex', description: 'Elegant flowing garments' },
      { name: 'Accessories', slug: 'accessories', gender: 'unisex', description: 'Jewelry, bags, and more' },
      { name: 'Aso Oke', slug: 'aso-oke', gender: 'unisex', description: 'Hand-woven traditional fabric' },
    ];

    try {
      const { error } = await supabase.from('categories').insert(defaults);
      if (error) throw error;
      fetchCategories();
      alert('Default categories added successfully!');
    } catch (error) {
      console.error('Error adding default categories:', error);
      alert('Failed to add default categories. Some may already exist.');
    }
  };

  if (loading) {
    return (
      <AdminLayout activePage="categories">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="categories">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-wider uppercase mb-2">Categories</h1>
            <p className="text-gray-600">Manage product categories</p>
          </div>
          <div className="flex gap-3">
            {categories.length === 0 && (
              <button
                onClick={addDefaultCategories}
                className="px-4 py-2 border border-black text-black uppercase tracking-wider text-sm hover:bg-black hover:text-white transition-colors"
              >
                Add Default Categories
              </button>
            )}
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-black text-white uppercase tracking-wider text-sm hover:bg-gray-800 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white shadow-sm p-6 mb-6">
          <h2 className="text-lg uppercase tracking-wider mb-4">New Category</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="e.g., Ankara Dresses"
              />
            </div>
            <div>
              <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="ankara-dresses"
              />
            </div>
            <div>
              <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
            <div>
              <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="Brief description"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-black text-white uppercase tracking-wider text-sm hover:bg-gray-800"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Save
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setFormData({ name: '', slug: '', gender: 'unisex', description: '' });
              }}
              className="px-6 py-2 border border-gray-300 uppercase tracking-wider text-sm hover:bg-gray-50"
            >
              <X className="w-4 h-4 inline mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No categories yet. Add your first category to get started.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex px-2 py-1 text-xs uppercase tracking-wider bg-gray-100 rounded">
                      {category.gender}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900 ml-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
