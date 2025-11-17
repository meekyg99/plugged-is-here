import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuickView from './QuickView';
import { ProductWithDetails } from '../types/database';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

interface ProductDisplay {
  id: string;
  name: string;
  category: string;
  price: string;
  rating: number;
  reviewCount: number;
  images: string[];
  colors: { name: string; hex: string }[];
  defaultVariantId: string;
}

export default function ProductGrid() {
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductDisplay | null>(null);
  const [visibleProducts, setVisibleProducts] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getFeaturedProducts();

      if (!data || data.length === 0) {
        setProducts([]);
        return;
      }

      const displayProducts: ProductDisplay[] = data
        .filter((product: ProductWithDetails) => {
          return product.variants && product.variants.length > 0 && product.images && product.images.length > 0;
        })
        .map((product: ProductWithDetails) => {
          const uniqueColors = product.variants.reduce((acc: { name: string; hex: string }[], variant) => {
            if (variant.color && variant.color_hex && !acc.find(c => c.name === variant.color)) {
              acc.push({ name: variant.color, hex: variant.color_hex });
            }
            return acc;
          }, []);

          const validPrices = product.variants.map(v => v.price).filter(p => p > 0);
          const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
          const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;

          const sortedImages = [...product.images].sort((a, b) => a.display_order - b.display_order);

          return {
            id: product.id,
            name: product.name,
            category: product.category?.name || 'Uncategorized',
            price: minPrice === maxPrice
              ? `₦${minPrice.toLocaleString()}`
              : `₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}`,
            rating: 4.5,
            reviewCount: Math.floor(Math.random() * 50) + 10,
            images: sortedImages.map(img => img.image_url),
            colors: uniqueColors,
            defaultVariantId: product.variants[0]?.id || '',
          };
        });
      setProducts(displayProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSwitch = (productId: string) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [productId]: prev[productId] === 1 ? 0 : 1,
    }));
  };

  useEffect(() => {
    const observers = products.map((product, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleProducts((prev) => [...prev, product.id]);
          }
        },
        { threshold: 0.1 }
      );

      if (productRefs.current[index]) {
        observer.observe(productRefs.current[index]!);
      }

      return observer;
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [products]);

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-light tracking-[0.2em] uppercase mb-4">
            New Arrivals
          </h2>
          <p className="text-sm tracking-wider uppercase text-gray-600">
            Discover our newest collection
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg tracking-wider">
              Loading products...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg tracking-wider mb-4">
              {error}
            </p>
            <button
              onClick={loadProducts}
              className="px-8 py-3 bg-black text-white text-sm tracking-widest uppercase hover:bg-gray-800 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg tracking-wider mb-4">
              No products available yet
            </p>
            <p className="text-sm text-gray-400 tracking-wide">
              Use the "Seed DB" button to add sample products
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {products.map((product, index) => (
            <div
              key={product.id}
              ref={(el) => (productRefs.current[index] = el)}
              className={`group cursor-pointer transition-all duration-700 ${
                visibleProducts.includes(product.id)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div
                className="relative aspect-[3/4] bg-gray-100 mb-4 overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-500"
                onMouseEnter={() => handleImageSwitch(product.id)}
                onMouseLeave={() => handleImageSwitch(product.id)}
              >
                <img
                  src={product.images[currentImageIndex[product.id] || 0]}
                  alt={product.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                    hoveredProduct === product.id ? 'scale-110' : 'scale-100'
                  }`}
                />

                <div className="absolute top-3 right-3 flex gap-1">
                  {product.images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        (currentImageIndex[product.id] || 0) === idx
                          ? 'bg-white w-4'
                          : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>

                {/* Overlay Actions */}
                <div
                  className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center space-x-3 transition-opacity duration-300 ${
                    hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickViewProduct(product);
                    }}
                    className="p-2 bg-white hover:bg-gray-100 rounded-2xl transition-all duration-300 transform hover:scale-110"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="p-2 bg-white hover:bg-gray-100 rounded-2xl transition-all duration-300 transform hover:scale-110"
                  >
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        isInWishlist(product.id)
                          ? 'fill-black'
                          : 'fill-none'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs tracking-wider uppercase text-gray-500">
                  {product.category}
                </p>
                <h3 className="text-sm tracking-wider uppercase">
                  {product.name}
                </h3>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : i < product.rating
                            ? 'fill-yellow-400 text-yellow-400 opacity-50'
                            : 'fill-none text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>

                <p className="text-sm font-light">{product.price}</p>

                <div className="flex gap-1.5 pt-1">
                  {product.colors.slice(0, 3).map((color, idx) => (
                    <div
                      key={idx}
                      className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-black transition-colors cursor-pointer"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                  {product.colors.length > 3 && (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs text-gray-500">
                      +{product.colors.length - 3}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.defaultVariantId) {
                    addItem(product.defaultVariantId, product.id);
                  }
                }}
                className="mt-4 w-full py-2 bg-black text-white transition-all duration-300 flex items-center justify-center space-x-2 hover:bg-gray-800 shadow-md hover:shadow-lg hover:scale-105"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs tracking-wider uppercase">Add to Cart</span>
              </button>
            </div>
          ))}
        </div>
        )}

        {products.length > 0 && (
          <div className="text-center mt-16">
            <Link
              to="/products"
              className="inline-block px-12 py-3 bg-black text-white text-sm tracking-widest uppercase hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
            >
              View All Products
            </Link>
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
