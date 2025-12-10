import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import QuickView from '../components/QuickView';
import { ProductWithDetails } from '../types/database';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Seo } from '../components/Seo';
import { trackViewItemList } from '../lib/analytics';

interface ProductDisplay {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: string;
  minPrice: number;
  maxPrice: number;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  variants: ProductWithDetails['variants'];
  defaultVariantId: string;
  stockBadge: string | null;
  inStock: boolean;
}

export default function CategoryPage() {
  const { category } = useParams();
  const [searchParams, setParams] = useSearchParams();
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductDisplay | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const DEFAULT_OG_IMAGE =
    'https://res.cloudinary.com/darhndmms/image/upload/v1765207904/WhatsApp_Image_2025-10-28_at_11.51.32_0752b31a_-_Copy_ivmyz2.jpg';

  useEffect(() => {
    loadProducts();
  }, [category, searchParams]);

  useEffect(() => {
    const sizes = searchParams.get('sizes');
    const colors = searchParams.get('colors');
    const minP = searchParams.get('minPrice');
    const maxP = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');

    if (sizes) setSelectedSizes(sizes.split(',').filter(Boolean));
    if (colors) setSelectedColors(colors.split(',').filter(Boolean));
    if (minP) setPriceMin(Number(minP));
    if (maxP) setPriceMax(Number(maxP));
    if (sort === 'price-asc' || sort === 'price-desc' || sort === 'newest') setSortBy(sort);
  }, [searchParams]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedSizes.length) params.sizes = selectedSizes.join(',');
    if (selectedColors.length) params.colors = selectedColors.join(',');
    if (priceMin !== null) params.minPrice = String(priceMin);
    if (priceMax !== null) params.maxPrice = String(priceMax);
    if (sortBy && sortBy !== 'newest') params.sort = sortBy;
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.forEach((_, key) => next.delete(key));
      Object.entries(params).forEach(([k, v]) => next.set(k, v));
      return next;
    });
  }, [selectedSizes, selectedColors, priceMin, priceMax, sortBy, setParams]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();

      let filtered = data;

      if (category && category !== 'all') {
        filtered = data.filter((p: ProductWithDetails) =>
          p.category?.name.toLowerCase() === category.toLowerCase() ||
          p.category?.slug === category.toLowerCase()
        );
      }

      const gender = searchParams.get('gender');
      if (gender) {
        filtered = filtered.filter((p: ProductWithDetails) => {
          const g = p.gender?.toLowerCase();
          const target = gender.toLowerCase();
          return g === target || g === 'unisex';
        });
      }

      const displayProducts: ProductDisplay[] = filtered.map((product: ProductWithDetails) => {
        const uniqueColors = product.variants.reduce((acc: { name: string; hex: string }[], variant) => {
          const name = variant.color || variant.color_hex || '';
          const hex = variant.color_hex || (variant.color as string) || '#e5e7eb';
          if (!name && !hex) return acc;

          const key = `${(variant.color || '').toLowerCase()}_${hex.toLowerCase()}`;
          if (!acc.find((c) => `${c.name.toLowerCase()}_${(c.hex || '').toLowerCase()}` === key)) {
            acc.push({ name: name || 'Color', hex });
          }
          return acc;
        }, []);

        const uniqueSizes = product.variants.reduce((acc: string[], variant) => {
          if (variant.size) {
            // Split comma-separated sizes into individual items
            const sizeParts = variant.size.split(',').map(s => s.trim()).filter(Boolean);
            sizeParts.forEach(size => {
              if (!acc.includes(size)) {
                acc.push(size);
              }
            });
          }
          return acc;
        }, []);

        const minPrice = Math.min(...product.variants.map(v => v.price));
        const maxPrice = Math.max(...product.variants.map(v => v.price));

        const positiveStocks = product.variants.map(v => v.stock_quantity).filter(q => q > 0);
        const minPositiveStock = positiveStocks.length > 0 ? Math.min(...positiveStocks) : 0;
        const lowStockThreshold = product.variants.length > 0
          ? Math.min(...product.variants.map(v => v.low_stock_threshold || 1))
          : 1;
        const inStock = positiveStocks.length > 0;
        const isLowStock = minPositiveStock > 0 && minPositiveStock <= lowStockThreshold;
        const stockBadge = !inStock ? 'Sold Out' : isLowStock ? `Only ${minPositiveStock} left` : null;

        return {
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description || '',
          category: product.category?.name || 'Uncategorized',
          minPrice,
          maxPrice,
          price: minPrice === maxPrice
            ? `₦${minPrice.toLocaleString()}`
            : `₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}`,
          images: product.images.sort((a, b) => a.display_order - b.display_order).map(img => img.image_url),
          colors: uniqueColors,
          sizes: uniqueSizes,
          variants: product.variants,
          defaultVariantId: (product.variants.find(v => v.stock_quantity > 0) || product.variants[0])?.id || '',
          stockBadge,
          inStock,
        };
      });

      setProducts(displayProducts);
      if (displayProducts.length > 0) {
        const analyticsItems = displayProducts.map((p) => ({
          item_id: p.id,
          item_name: p.name,
          item_category: p.category,
          price: p.minPrice,
        }));
        trackViewItemList(analyticsItems, category || 'all', 'Category Listing');
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const sizeOk = selectedSizes.length === 0 || selectedSizes.some((s) => p.sizes.includes(s));
        const colorOk = selectedColors.length === 0 || selectedColors.some((c) => p.colors.some((pc) => pc.hex?.toLowerCase() === c.toLowerCase() || pc.name.toLowerCase() === c.toLowerCase()));
        const minOk = priceMin === null || p.minPrice >= priceMin;
        const maxOk = priceMax === null || p.maxPrice <= priceMax;
        return sizeOk && colorOk && minOk && maxOk;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.minPrice - b.minPrice;
        if (sortBy === 'price-desc') return b.minPrice - a.minPrice;
        return 0;
      });
  }, [products, selectedSizes, selectedColors, priceMin, priceMax, sortBy]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const getCategoryTitle = () => {
    if (!category || category === 'all') return 'All Products';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const genderLabel = searchParams.get('gender')
    ? ` for ${searchParams.get('gender')}`
    : '';

  const pageTitle = useMemo(
    () => `${getCategoryTitle()}${genderLabel} | Plugged`,
    [category, genderLabel]
  );

  const pageDescription = useMemo(() => {
    const base = getCategoryTitle();
    if (genderLabel) return `${base}${genderLabel} — curated looks, shoes, and accessories.`;
    return `${base} — curated Nigerian fashion across clothes, shoes, and accessories.`;
  }, [category, genderLabel]);

  const ogImage = products[0]?.images[0] || DEFAULT_OG_IMAGE;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 pt-24">
      <Seo title={pageTitle} description={pageDescription} image={ogImage} />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-light tracking-[0.2em] uppercase mb-4">
            {getCategoryTitle()}
          </h2>
          <p className="text-sm tracking-wider uppercase text-gray-600">
            {products.length} products
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
          <div className="lg:col-span-1 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Sizes</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(products.flatMap((p) => p.sizes))).map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1 text-xs border uppercase ${
                      selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Colors</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  new Map(
                    products
                      .flatMap((p) => p.colors)
                      .map((c) => [`${c.name}-${c.hex}`, c])
                  ).values()
                ).map((color) => (
                  <button
                    key={`${color.name}-${color.hex}`}
                    onClick={() => toggleColor(color.hex || color.name)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColors.includes(color.hex || color.name)
                        ? 'border-black scale-105'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color.hex || '#e5e7eb' }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Price</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={priceMin ?? ''}
                  onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : null)}
                  placeholder="Min"
                  className="w-24 border px-2 py-1 text-sm"
                />
                <span className="text-xs text-gray-500">to</span>
                <input
                  type="number"
                  value={priceMax ?? ''}
                  onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : null)}
                  placeholder="Max"
                  className="w-24 border px-2 py-1 text-sm"
                />
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Sort</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full border px-3 py-2 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg tracking-wider">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg tracking-wider mb-4">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group cursor-pointer transition-all duration-700 flex flex-col h-full"
                    onClick={() => setQuickViewProduct(product)}
                  >
                    <div
                      className="relative aspect-[3/4] bg-gray-100 mb-4 overflow-hidden shadow-md"
                    >
                      {product.stockBadge && (
                        <span className="absolute top-3 left-3 z-10 bg-black text-white text-[11px] tracking-wide uppercase px-3 py-1 shadow-md">
                          {product.stockBadge}
                        </span>
                      )}
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 25vw, (min-width: 640px) 40vw, 50vw"
                        className="absolute inset-0 w-full h-full object-contain bg-white"
                      />
                    </div>

                    <div className="flex flex-col flex-1">
                      <div className="space-y-2 flex-1">
                        <p className="text-xs tracking-wider uppercase text-gray-500">
                          {product.category}
                        </p>
                        <h3 className="text-sm tracking-wider uppercase">{product.name}</h3>

                        <p className="text-sm font-light">{product.price}</p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {product.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-5 h-5 rounded-full border border-gray-200"
                              style={{ backgroundColor: color.hex || color.name || '#e5e7eb' }}
                              title={color.name || 'Color'}
                            />
                          ))}
                        </div>
                      </div>

                      <div
                        className={`mt-4 w-full h-12 flex items-center justify-center space-x-2 cursor-pointer ${
                          product.inStock
                            ? 'bg-black text-white'
                            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-xs tracking-wider uppercase">
                          {product.inStock ? 'View & Add' : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {quickViewProduct && (
        <QuickView
          isOpen={quickViewProduct !== null}
          onClose={() => setQuickViewProduct(null)}
          product={quickViewProduct}
        />
      )}
    </section>
  );
}
