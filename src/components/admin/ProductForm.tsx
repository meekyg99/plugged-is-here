import { useState, useEffect } from 'react';
import { Plus, X, Upload, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Variant {
  id?: string;
  sku: string;
  size: string;
  color: string;
  color_hex: string;
  material?: string;
  price: number;
  compare_at_price?: number;
  stock_quantity: number;
  low_stock_threshold?: number;
}

interface ProductImage {
  id?: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  category_id: string;
  gender: 'men' | 'women' | 'unisex';
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
  variants: Variant[];
  images: ProductImage[];
}

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProductForm({ productId, onSuccess, onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    gender: 'unisex',
    is_featured: false,
    meta_title: '',
    meta_description: '',
    variants: [],
    images: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchCategories = async () => {
    try {
      console.log('🔍 Fetching categories from database...');
      console.log('🔗 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔑 Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

      const { data, error } = await supabase.from('categories').select('*').order('name');

      console.log('📦 Categories fetched:', data);
      console.log('❌ Error (if any):', error);
      console.log('📊 Number of categories:', data?.length || 0);

      if (error) {
        console.error('🚨 Failed to fetch categories:', error.message, error.details, error.hint);
        setErrors({ category_id: `Error: ${error.message}` });
        return;
      }

      if (data) {
        console.log('✅ Setting categories state with:', data);
        setCategories(data);
        console.log('✅ Categories state set. Current length:', data.length);
      } else {
        console.warn('⚠️ No data returned from database!');
      }
    } catch (err) {
      console.error('💥 Exception while fetching categories:', err);
      setErrors({ category_id: `Exception: ${err}` });
    }
  };

  const fetchProduct = async () => {
    if (!productId) return;

    const { data: product } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(*),
        images:product_images(*)
      `)
      .eq('id', productId)
      .single();

    if (product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        category_id: product.category_id || '',
        gender: product.gender,
        is_featured: product.is_featured || false,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        variants: product.variants || [],
        images: product.images || [],
      });
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

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          sku: '',
          size: '',
          color: '',
          color_hex: '#000000',
          price: 0,
          stock_quantity: 0,
          low_stock_threshold: 5,
        },
      ],
    });
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const addImage = () => {
    const newOrder = formData.images.length;
    setFormData({
      ...formData,
      images: [
        ...formData.images,
        { image_url: '', alt_text: '', display_order: newOrder },
      ],
    });
  };

  const updateImage = (index: number, field: keyof ProductImage, value: any) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], [field]: value };
    setFormData({ ...formData, images: newImages });
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Product slug is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (formData.variants.length === 0) newErrors.variants = 'At least one variant is required';

    formData.variants.forEach((variant, index) => {
      if (!variant.sku.trim()) newErrors[`variant_${index}_sku`] = 'SKU is required';
      if (variant.price <= 0) newErrors[`variant_${index}_price`] = 'Price must be greater than 0';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      if (productId) {
        await updateProduct();
      } else {
        await createProduct();
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async () => {
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        category_id: formData.category_id,
        gender: formData.gender,
        is_featured: formData.is_featured,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
      })
      .select()
      .single();

    if (productError) throw productError;

    if (formData.variants.length > 0) {
      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(
          formData.variants.map((v) => ({
            product_id: product.id,
            ...v,
          }))
        );

      if (variantsError) throw variantsError;
    }

    if (formData.images.length > 0) {
      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(
          formData.images.map((img) => ({
            product_id: product.id,
            ...img,
          }))
        );

      if (imagesError) throw imagesError;
    }
  };

  const updateProduct = async () => {
    const { error: productError } = await supabase
      .from('products')
      .update({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        category_id: formData.category_id,
        gender: formData.gender,
        is_featured: formData.is_featured,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
      })
      .eq('id', productId);

    if (productError) throw productError;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white shadow-sm p-6">
        <h2 className="text-xl font-light uppercase tracking-wider mb-6">Product Information</h2>

        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
            />
            {errors.slug && <p className="text-red-600 text-sm mt-1">{errors.slug}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
              Category * {categories.length > 0 && <span className="text-green-600 text-xs">({categories.length} available)</span>}
            </label>

            <div className="bg-blue-50 border border-blue-200 p-2 mb-2 text-xs">
              <strong>DEBUG:</strong> Categories state length: {categories.length}
              {categories.length > 0 && (
                <div className="mt-1">
                  <strong>Categories:</strong> {categories.map(c => c.name).join(', ')}
                </div>
              )}
            </div>

            <select
              value={formData.category_id}
              onChange={(e) => {
                console.log('Category selected:', e.target.value);
                setFormData({ ...formData, category_id: e.target.value });
              }}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
            >
              <option value="">Select Category</option>
              {categories.length === 0 && <option disabled>Loading categories...</option>}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="text-red-600 text-sm mt-1">{errors.category_id}</p>}
            {categories.length === 0 && (
              <p className="text-yellow-600 text-xs mt-1">
                ⚠️ No categories found. Check browser console (F12) for errors.
              </p>
            )}
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

          <div className="col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm uppercase tracking-wider text-gray-700">Featured Product</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-light uppercase tracking-wider">Variants *</h2>
            <p className="text-xs text-gray-500 mt-1">Add different sizes and colors for this product</p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="px-4 py-2 bg-black text-white uppercase tracking-wider text-sm hover:bg-gray-800 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Variant
          </button>
        </div>

        {errors.variants && <p className="text-red-600 text-sm mb-4">{errors.variants}</p>}

        {formData.variants.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 text-sm">No variants yet. Add your first variant to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.variants.map((variant, index) => (
              <div key={index} className="border border-gray-200 p-4 relative hover:border-gray-400 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  {variant.color_hex && (
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: variant.color_hex }}
                      title={variant.color || 'Color'}
                    />
                  )}
                  <div className="flex-1">
                    <span className="text-sm font-medium">{variant.color || 'No Color'}</span>
                    {variant.size && <span className="text-xs text-gray-500 ml-2">• Size: {variant.size}</span>}
                    {variant.sku && <span className="text-xs text-gray-400 ml-2">• SKU: {variant.sku}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-gray-600 mb-1">SKU *</label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                      placeholder="PROD-001"
                    />
                    {errors[`variant_${index}_sku`] && (
                      <p className="text-red-600 text-xs mt-1">{errors[`variant_${index}_sku`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-gray-600 mb-1">Size</label>
                    <input
                      type="text"
                      value={variant.size}
                      onChange={(e) => updateVariant(index, 'size', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                      placeholder="M, L, XL"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-gray-600 mb-1">Color Name</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) => updateVariant(index, 'color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                        placeholder="Royal Blue"
                      />
                      <input
                        type="color"
                        value={variant.color_hex}
                        onChange={(e) => updateVariant(index, 'color_hex', e.target.value)}
                        className="w-12 h-10 border border-gray-300 cursor-pointer"
                        title="Pick color"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-gray-600 mb-1">Price (₦) *</label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                      placeholder="25000"
                    />
                    {errors[`variant_${index}_price`] && (
                      <p className="text-red-600 text-xs mt-1">{errors[`variant_${index}_price`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-gray-600 mb-1">Compare Price (₦)</label>
                    <input
                      type="number"
                      value={variant.compare_at_price || ''}
                      onChange={(e) => updateVariant(index, 'compare_at_price', parseFloat(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                      placeholder="30000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-gray-600 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      value={variant.stock_quantity}
                      onChange={(e) => updateVariant(index, 'stock_quantity', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-light uppercase tracking-wider">Images</h2>
          <button
            type="button"
            onClick={addImage}
            className="px-4 py-2 bg-black text-white uppercase tracking-wider text-sm hover:bg-gray-800 inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Add Image
          </button>
        </div>

        <div className="space-y-4">
          {formData.images.map((image, index) => (
            <div key={index} className="border border-gray-200 p-4 relative">
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs uppercase text-gray-600 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={image.image_url}
                    onChange={(e) => updateImage(index, 'image_url', e.target.value)}
                    placeholder="https://images.pexels.com/..."
                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs uppercase text-gray-600 mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={image.alt_text || ''}
                    onChange={(e) => updateImage(index, 'alt_text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {image.image_url && (
                <div className="mt-3">
                  <img
                    src={image.image_url}
                    alt={image.alt_text || 'Product image'}
                    className="w-32 h-32 object-cover border border-gray-200"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-sm p-6">
        <h2 className="text-xl font-light uppercase tracking-wider mb-6">SEO</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={formData.meta_title || ''}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm uppercase tracking-wider text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={formData.meta_description || ''}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
            />
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3">
          {errors.submit}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 border border-gray-300 uppercase tracking-wider hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
