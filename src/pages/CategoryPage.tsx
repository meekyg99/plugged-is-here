import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import QuickView from '../components/QuickView';
import { ProductWithDetails } from '../types/database';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Seo } from '../components/Seo';

interface ProductDisplay {
  id: string;
  name: string;
  category: string;
  price: string;
  images: string[];
  colors: { name: string; hex: string }[];
   sizes: string[];
  defaultVariantId: string;
}

export default function CategoryPage() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductDisplay | null>(null);
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const DEFAULT_OG_IMAGE =
    'https://res.cloudinary.com/darhndmms/image/upload/v1765207904/WhatsApp_Image_2025-10-28_at_11.51.32_0752b31a_-_Copy_ivmyz2.jpg';

  useEffect(() => {
    loadProducts();
  }, [category, searchParams]);

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
          if (variant.size && !acc.includes(variant.size)) {
            acc.push(variant.size);
          }
          return acc;
        }, []);

        const minPrice = Math.min(...product.variants.map(v => v.price));
        const maxPrice = Math.max(...product.variants.map(v => v.price));

        return {
          id: product.id,
          name: product.name,
          category: product.category?.name || 'Uncategorized',
          price: minPrice === maxPrice
            ? `₦${minPrice.toLocaleString()}`
            : `₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}`,
          images: product.images.sort((a, b) => a.display_order - b.display_order).map(img => img.image_url),
          colors: uniqueColors,
          sizes: uniqueSizes,
          defaultVariantId: product.variants[0]?.id || '',
        };
      });

      setProducts(displayProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
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

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg tracking-wider">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg tracking-wider mb-4">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer transition-all duration-700 flex flex-col h-full"
                onClick={() => setQuickViewProduct(product)}
              >
                <div
                  className="relative aspect-[3/4] bg-gray-100 mb-4 overflow-hidden shadow-md"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
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

                  <div className="mt-4 w-full h-12 bg-black text-white flex items-center justify-center space-x-2 cursor-pointer">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-xs tracking-wider uppercase">View & Add</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
