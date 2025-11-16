import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import QuickView from './QuickView';

const products = [
  {
    id: 1,
    name: 'Leather Jacket',
    price: '₦1,156,000',
    category: 'Outerwear',
    image: 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 2,
    name: 'Denim Jeans',
    price: '₦356,000',
    category: 'Denim',
    image: 'https://images.pexels.com/photos/1346187/pexels-photo-1346187.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 3,
    name: 'Logo T-Shirt',
    price: '₦136,000',
    category: 'Tops',
    image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 4,
    name: 'Bandana Boots',
    price: '₦636,000',
    category: 'Footwear',
    image: 'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 5,
    name: 'Varsity Jacket',
    price: '₦1,280,000',
    category: 'Outerwear',
    image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 6,
    name: 'Silk Shirt',
    price: '₦580,000',
    category: 'Tops',
    image: 'https://images.pexels.com/photos/1972115/pexels-photo-1972115.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 7,
    name: 'Bandana Print Hoodie',
    price: '₦356,000',
    category: 'Tops',
    image: 'https://images.pexels.com/photos/3054973/pexels-photo-3054973.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 8,
    name: 'Leather Sneakers',
    price: '₦396,000',
    category: 'Footwear',
    image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function ProductGrid() {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<typeof products[0] | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [visibleProducts, setVisibleProducts] = useState<number[]>([]);
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);

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
  }, []);

  const toggleWishlist = (productId: number) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
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
              <div className="relative aspect-[3/4] bg-gray-100 mb-4 overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-500">
                <img
                  src={product.image}
                  alt={product.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
                    hoveredProduct === product.id ? 'scale-110' : 'scale-100'
                  }`}
                />

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
                        wishlist.includes(product.id)
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
                <p className="text-sm font-light">{product.price}</p>
              </div>

              <button
                className="mt-4 w-full py-2 bg-black text-white transition-all duration-300 flex items-center justify-center space-x-2 hover:bg-gray-800 shadow-md hover:shadow-lg hover:scale-105"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs tracking-wider uppercase">Add to Cart</span>
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button className="px-12 py-3 bg-black text-white text-sm tracking-widest uppercase hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105">
            View All Products
          </button>
        </div>
      </div>

      <QuickView
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct || products[0]}
      />
    </section>
  );
}
