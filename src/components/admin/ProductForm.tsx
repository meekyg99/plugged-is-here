import { useState, useEffect } from 'react';
import { Plus, X, Upload, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES_EU = ['EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45', 'EU 46', 'EU 47'];

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

  const parseSizeList = (value?: string) =>
    (value || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const setVariantSizes = (index: number, sizes: string[]) => {
    const uniqueSizes = Array.from(new Set(sizes.map((s) => s.trim()).filter(Boolean)));
    updateVariant(index, 'size', uniqueSizes.join(', '));
  };

  const toggleSizeSelection = (index: number, size: string) => {
    const current = parseSizeList(formData.variants[index]?.size);
    const exists = current.includes(size);
    const next = exists ? current.filter((s) => s !== size) : [...current, size];
    setVariantSizes(index, next);
  };

  const handleCustomSizesChange = (index: number, value: string) => {
    setVariantSizes(index, parseSizeList(value));
  };

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
          price: undefined as unknown as number,
          stock_quantity: undefined as unknown as number,
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
    const skuSet = new Set<string>();

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Product slug is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (formData.variants.length === 0) newErrors.variants = 'At least one variant is required';

    formData.variants.forEach((variant, index) => {
      const sku = variant.sku.trim();
      if (!sku) newErrors[`variant_${index}_sku`] = 'SKU is required';
      if (sku) {
        if (skuSet.has(sku)) {
          newErrors[`variant_${index}_sku`] = 'SKU must be unique per product';
        } else {
          skuSet.add(sku);
        }
      }

      const price = typeof variant.price === 'number' ? variant.price : Number(variant.price);
      if (!price || !Number.isFinite(price) || price <= 0) {
        newErrors[`variant_${index}_price`] = 'Price must be greater than 0';
      }

      const stock =
        typeof variant.stock_quantity === 'number'
          ? variant.stock_quantity
          : Number(variant.stock_quantity);
      if (stock === undefined || stock === null || Number.isNaN(stock) || stock < 0) {
        newErrors[`variant_${index}_stock_quantity`] = 'Stock quantity must be 0 or more';
      }
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
      const code = (error as any)?.code || '';
      const message = (error as any)?.message || 'Failed to save product. Please try again.';
      const details = (error as any)?.details || '';

      if (code === '23505' || message.includes('duplicate key value') || details.includes('sku')) {
        setErrors({ submit: 'Duplicate SKU detected. Please ensure each variant SKU is unique.' });
      } else if (code === '23502' || message.includes('null value') || details.includes('stock_quantity')) {
        setErrors({ submit: 'Stock quantity is required for each variant.' });
      } else {
        setErrors({ submit: message });
      }
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
            sku: v.sku.trim(),
            size: v.size?.trim() || null,
            color: v.color?.trim() || null,
            color_hex: v.color_hex || null,
            material: v.material?.trim() || null,
            price: Number(v.price),
            compare_at_price:
              v.compare_at_price === undefined || v.compare_at_price === null
                ? null
                : Number(v.compare_at_price),
            stock_quantity:
              v.stock_quantity === undefined || v.stock_quantity === null
                ? 0
                : Number(v.stock_quantity),
            low_stock_threshold:
              v.low_stock_threshold === undefined || v.low_stock_threshold === null
                ? 5
                : Number(v.low_stock_threshold),
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
    // Update product base info
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

    // Fetch existing variants and images to determine which to update/delete/add
    const { data: existingVariants } = await supabase
      .from('product_variants')
      .select('id')
      .eq('product_id', productId);

    const { data: existingImages } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', productId);

    const existingVariantIds = new Set((existingVariants || []).map(v => v.id));
    const existingImageIds = new Set((existingImages || []).map(img => img.id));

    // Separate variants into updates and inserts
    const variantsToUpdate = formData.variants.filter(v => v.id && existingVariantIds.has(v.id));
    const variantsToInsert = formData.variants.filter(v => !v.id);
    const variantIdsToKeep = new Set(formData.variants.filter(v => v.id).map(v => v.id));
    const variantsToDelete = Array.from(existingVariantIds).filter(id => !variantIdsToKeep.has(id));

    // Update existing variants
    for (const variant of variantsToUpdate) {
      const { error } = await supabase
        .from('product_variants')
        .update({
          sku: variant.sku.trim(),
          size: variant.size?.trim() || null,
          color: variant.color?.trim() || null,
          color_hex: variant.color_hex || null,
          material: variant.material?.trim() || null,
          price: Number(variant.price),
          compare_at_price:
            variant.compare_at_price === undefined || variant.compare_at_price === null
              ? null
              : Number(variant.compare_at_price),
          stock_quantity:
            variant.stock_quantity === undefined || variant.stock_quantity === null
              ? 0
              : Number(variant.stock_quantity),
          low_stock_threshold:
            variant.low_stock_threshold === undefined || variant.low_stock_threshold === null
              ? 5
              : Number(variant.low_stock_threshold),
        })
        .eq('id', variant.id);

      if (error) throw error;
    }

    // Insert new variants
    if (variantsToInsert.length > 0) {
      const { error } = await supabase
        .from('product_variants')
        .insert(
          variantsToInsert.map((v) => ({
            product_id: productId,
            sku: v.sku.trim(),
            size: v.size?.trim() || null,
            color: v.color?.trim() || null,
            color_hex: v.color_hex || null,
            material: v.material?.trim() || null,
            price: Number(v.price),
            compare_at_price:
              v.compare_at_price === undefined || v.compare_at_price === null
                ? null
                : Number(v.compare_at_price),
            stock_quantity:
              v.stock_quantity === undefined || v.stock_quantity === null
                ? 0
                : Number(v.stock_quantity),
            low_stock_threshold:
              v.low_stock_threshold === undefined || v.low_stock_threshold === null
                ? 5
                : Number(v.low_stock_threshold),
          }))
        );

      if (error) throw error;
    }

    // Delete removed variants
    if (variantsToDelete.length > 0) {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .in('id', variantsToDelete);

      if (error) throw error;
    }

    // Separate images into updates and inserts
    const imagesToUpdate = formData.images.filter(img => img.id && existingImageIds.has(img.id));
    const imagesToInsert = formData.images.filter(img => !img.id);
    const imageIdsToKeep = new Set(formData.images.filter(img => img.id).map(img => img.id));
    const imagesToDelete = Array.from(existingImageIds).filter(id => !imageIdsToKeep.has(id));

    // Update existing images
    for (const image of imagesToUpdate) {
      const { error } = await supabase
        .from('product_images')
        .update({
          image_url: image.image_url,
          alt_text: image.alt_text || null,
          display_order: image.display_order,
        })
        .eq('id', image.id);

      if (error) throw error;
    }

    // Insert new images
    if (imagesToInsert.length > 0) {
      const { error } = await supabase
        .from('product_images')
        .insert(
          imagesToInsert.map((img) => ({
            product_id: productId,
            image_url: img.image_url,
            alt_text: img.alt_text || null,
            display_order: img.display_order,
          }))
        );

      if (error) throw error;
    }

    // Delete removed images
    if (imagesToDelete.length > 0) {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .in('id', imagesToDelete);

      if (error) throw error;
    }
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
                    <label className="block text-xs uppercase text-gray-600 mb-1">Sizes (select one or many)</label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {CLOTHING_SIZES.map((size) => {
                          const selected = parseSizeList(variant.size).includes(size);
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => toggleSizeSelection(index, size)}
                              className={`px-2 py-1 border text-xs uppercase tracking-wider ${selected ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'}`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {SHOE_SIZES_EU.map((size) => {
                          const selected = parseSizeList(variant.size).includes(size);
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => toggleSizeSelection(index, size)}
                              className={`px-2 py-1 border text-xs uppercase tracking-wider ${selected ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'}`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>

                      <input
                        type="text"
                        value={variant.size || ''}
                        onChange={(e) => handleCustomSizesChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                        placeholder="Custom sizes (comma separated) or leave blank for accessories"
                      />
                      <p className="text-[11px] text-gray-500">Click to select multiple sizes; custom sizes can be typed, separated by commas.</p>
                    </div>
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
                      value={variant.price ?? ''}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          'price',
                          e.target.value === '' ? undefined : parseFloat(e.target.value)
                        )
                      }
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
                      value={variant.stock_quantity ?? ''}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          'stock_quantity',
                          e.target.value === '' ? undefined : parseInt(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                      placeholder="10"
                    />
                    {errors[`variant_${index}_stock_quantity`] && (
                      <p className="text-red-600 text-xs mt-1">{errors[`variant_${index}_stock_quantity`]}</p>
                    )}
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
