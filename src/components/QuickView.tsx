import { X, Heart, ShoppingBag, Share2, ZoomIn } from 'lucide-react';

interface QuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: string;
    category: string;
  };
}

export default function QuickView({ isOpen, onClose, product }: QuickViewProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-white hover:bg-gray-100 rounded-2xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative aspect-[3/4] bg-gray-100 group">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-400 tracking-wider uppercase text-sm">
                {product.category}
              </span>
            </div>
            <button className="absolute bottom-6 right-6 p-2 bg-white hover:bg-gray-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300">
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 md:p-12 flex flex-col justify-between">
            <div>
              <p className="text-xs tracking-wider uppercase text-gray-500 mb-3">
                {product.category}
              </p>
              <h2 className="text-3xl tracking-wider uppercase mb-4">
                {product.name}
              </h2>
              <p className="text-2xl font-light mb-8">{product.price}</p>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-xs tracking-wider uppercase mb-3">
                    Size
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                      <button
                        key={size}
                        className="py-2 border border-black text-sm tracking-wider uppercase hover:bg-black hover:text-white transition-colors rounded-2xl"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs tracking-wider uppercase mb-3">
                    Color
                  </label>
                  <div className="flex space-x-3">
                    {['bg-black', 'bg-gray-300', 'bg-blue-900'].map(
                      (color, idx) => (
                        <button
                          key={idx}
                          className={`w-10 h-10 ${color} border-2 border-gray-300 hover:border-black transition-colors rounded-2xl`}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-gray-600 mb-8">
                Crafted with premium materials and exceptional attention to
                detail. This piece represents the pinnacle of luxury fashion,
                combining timeless design with contemporary aesthetics.
              </p>
            </div>

            <div className="space-y-4">
              <button className="w-full py-3 bg-black text-white flex items-center justify-center space-x-3 hover:bg-gray-800 transition-colors group rounded-2xl">
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm tracking-widest uppercase">
                  Add to Bag
                </span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button className="py-2 border border-black flex items-center justify-center space-x-2 hover:bg-black hover:text-white transition-colors group rounded-2xl">
                  <Heart className="w-4 h-4 group-hover:fill-current" />
                  <span className="text-xs tracking-wider uppercase">
                    Wishlist
                  </span>
                </button>
                <button className="py-2 border border-black flex items-center justify-center space-x-2 hover:bg-black hover:text-white transition-colors rounded-2xl">
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs tracking-wider uppercase">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
