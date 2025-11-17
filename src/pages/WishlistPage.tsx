import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, X } from 'lucide-react';

export default function WishlistPage() {
  const { items, removeFromWishlist, loading } = useWishlist();
  const { addItem } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-lg tracking-wider">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl tracking-wider uppercase font-light mb-8">
          My Wishlist ({items.length})
        </h1>

        {items.length === 0 ? (
          <div className="bg-white p-12 shadow-sm text-center">
            <p className="text-lg text-gray-500 tracking-wider mb-4">
              Your wishlist is empty
            </p>
            <p className="text-sm text-gray-400 tracking-wide mb-6">
              Start adding items you love to your wishlist
            </p>
            <a
              href="/products"
              className="inline-block px-8 py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;

              const firstImage = product.images?.[0]?.image_url;
              const minPrice = Math.min(...(product.variants?.map(v => v.price) || [0]));
              const defaultVariant = product.variants?.[0]?.id;

              return (
                <div key={item.id} className="bg-white shadow-sm group relative">
                  <button
                    onClick={() => removeFromWishlist(item.product_id)}
                    className="absolute top-2 right-2 z-10 p-2 bg-white hover:bg-gray-100 rounded-full shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                    {firstImage && (
                      <img
                        src={firstImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-xs tracking-wider uppercase text-gray-500 mb-1">
                      {product.category?.name}
                    </p>
                    <h3 className="text-sm tracking-wider uppercase mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm font-light mb-4">
                      ₦{minPrice.toLocaleString()}
                    </p>

                    <button
                      onClick={() => {
                        if (defaultVariant) {
                          addItem(defaultVariant, product.id);
                        }
                      }}
                      className="w-full py-2 bg-black text-white flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-xs tracking-wider uppercase">Add to Cart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
