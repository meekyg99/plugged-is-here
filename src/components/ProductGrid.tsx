import { useState } from 'react';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import QuickView from './QuickView';

const products = [
  {
    id: 1,
    name: 'Leather Jacket',
    price: '₦1,156,000',
    category: 'Outerwear',
  },
  {
    id: 2,
    name: 'Denim Jeans',
    price: '₦356,000',
    category: 'Denim',
  },
  {
    id: 3,
    name: 'Logo T-Shirt',
    price: '₦136,000',
    category: 'Tops',
  },
  {
    id: 4,
    name: 'Bandana Boots',
    price: '₦636,000',
    category: 'Footwear',
  },
  {
    id: 5,
    name: 'Varsity Jacket',
    price: '₦1,280,000',
    category: 'Outerwear',
  },
  {
    id: 6,
    name: 'Silk Shirt',
    price: '₦580,000',
    category: 'Tops',
  },
  {
    id: 7,
    name: 'Bandana Print Hoodie',
    price: '₦356,000',
    category: 'Tops',
  },
  {
    id: 8,
    name: 'Leather Sneakers',
    price: '₦396,000',
    category: 'Footwear',
  },
];

export default function ProductGrid() {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<typeof products[0] | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const toggleWishlist = (productId: number) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
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
          {products.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div className="relative aspect-[3/4] bg-gray-100 mb-4 overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gray-200 transition-transform duration-500 ${
                    hoveredProduct === product.id ? 'scale-105' : 'scale-100'
                  }`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-400 text-xs tracking-wider uppercase">
                    {product.category}
                  </span>
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
                className="mt-4 w-full py-1.5 bg-black text-white rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 group hover:bg-gray-800"
              >
                <ShoppingCart className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button className="px-10 py-2 bg-black text-white text-sm tracking-widest uppercase rounded-2xl hover:bg-gray-800 transition-colors">
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
