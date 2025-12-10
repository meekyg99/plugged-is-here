import { useState } from 'react';
import { X, Heart, ShoppingBag, Share2, ZoomIn } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

interface QuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    description: string;
    price: string;
    category: string;
    images: string[];
    colors: { name: string; hex: string }[];
    sizes?: string[];
    defaultVariantId: string;
  };
}

export default function QuickView({ isOpen, onClose, product }: QuickViewProps) {
  const [selectedColor, setSelectedColor] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  if (!isOpen) return null;

  const handleAddToCart = () => {
    if (product.defaultVariantId) {
      addItem(product.defaultVariantId, product.id);
      onClose();
    }
  };

  const handleToggleWishlist = async () => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-white hover:bg-gray-100 transition-colors shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative bg-gray-100">
            <div className="sticky top-0">
              <div className="relative aspect-[3/4] overflow-hidden group">
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-contain bg-white"
                />
                <button className="absolute bottom-6 right-6 p-2 bg-white hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 p-4 bg-white">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 h-20 overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx
                        ? 'border-black'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 flex flex-col justify-between">
            <div>
              <p className="text-xs tracking-wider uppercase text-gray-500 mb-3">
                {product.category}
              </p>
              <h2 className="text-3xl tracking-wider uppercase mb-4">
                {product.name}
              </h2>

              <p className="text-2xl font-light mb-4">{product.price}</p>

              {product.description && (
                <p className="text-sm text-gray-600 leading-relaxed mb-8">
                  {product.description}
                </p>
              )}

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-xs tracking-wider uppercase mb-3 font-semibold">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(idx)}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === idx
                            ? 'border-black scale-110'
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {selectedColor === idx && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <label className="block text-xs tracking-wider uppercase mb-3 font-semibold">
                      Size {selectedSize && <span className="text-gray-500">— {selectedSize}</span>}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 border text-xs tracking-wider uppercase transition-all ${
                            selectedSize === size
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 bg-white hover:border-black'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {!selectedSize && (
                      <p className="text-xs text-gray-500 mt-2">Please select a size</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={product.sizes && product.sizes.length > 0 && !selectedSize}
                className={`w-full py-3 flex items-center justify-center space-x-3 transition-all group shadow-lg ${
                  product.sizes && product.sizes.length > 0 && !selectedSize
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 hover:shadow-2xl hover:scale-105'
                }`}
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm tracking-widest uppercase">
                  {product.sizes && product.sizes.length > 0 && !selectedSize ? 'Select a Size' : 'Add to Bag'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleToggleWishlist}
                  className="py-2 border border-black flex items-center justify-center space-x-2 hover:bg-black hover:text-white transition-colors group"
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : 'group-hover:fill-current'}`} />
                  <span className="text-xs tracking-wider uppercase">
                    {isInWishlist(product.id) ? 'In Wishlist' : 'Wishlist'}
                  </span>
                </button>
                <button className="py-2 border border-black flex items-center justify-center space-x-2 hover:bg-black hover:text-white transition-colors">
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
