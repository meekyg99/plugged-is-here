import { useState, useMemo } from 'react';
import { X, Heart, ShoppingBag, Share2, ZoomIn, Truck, RefreshCcw, ShieldCheck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { ProductVariant } from '../types/database';

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
    variants: ProductVariant[];
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

  const selectedColorHex = product.colors[selectedColor]?.hex?.toLowerCase() || null;

  const activeVariant = useMemo(() => {
    return (
      product.variants.find((v) => {
        const sizeMatch = selectedSize
          ? (v.size || '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
              .includes(selectedSize)
          : true;

        const colorValue = (v.color_hex || v.color || '').toLowerCase();
        const colorMatch = selectedColorHex ? colorValue === selectedColorHex : true;

        return sizeMatch && colorMatch;
      }) || product.variants[0]
    );
  }, [product.variants, selectedColorHex, selectedSize]);

  const isSizeRequired = product.sizes && product.sizes.length > 0;
  const sizeNotSelected = isSizeRequired && !selectedSize;
  const outOfStock = activeVariant ? activeVariant.stock_quantity <= 0 : false;
  const lowStock = activeVariant
    ? activeVariant.stock_quantity > 0 &&
      activeVariant.stock_quantity <= (activeVariant.low_stock_threshold || 1)
    : false;

  const displayPrice = activeVariant
    ? `₦${activeVariant.price.toLocaleString()}`
    : product.price;

  const compareAt = activeVariant?.compare_at_price;
  const hasDiscount = compareAt !== null && compareAt !== undefined && compareAt > (activeVariant?.price || 0);
  const discountPercent = hasDiscount && compareAt
    ? Math.round(((compareAt - (activeVariant?.price || 0)) / compareAt) * 100)
    : null;
  const isAddDisabled = sizeNotSelected || outOfStock || !activeVariant;

  const handleAddToCart = () => {
    if (isAddDisabled || !activeVariant) return;
    addItem(activeVariant.id, product.id);
    onClose();
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
          aria-label="Close quick view"
          className="absolute top-6 right-6 z-10 p-2 bg-white hover:bg-gray-100 transition-colors shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
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
                  loading="eager"
                  decoding="async"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="w-full h-full object-contain bg-white"
                />
                <button
                  aria-label="Zoom product image"
                  className="absolute bottom-6 right-6 p-2 bg-white hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 p-4 bg-white">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    aria-label={`Show image ${idx + 1}`}
                    className={`relative w-20 h-20 overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx
                        ? 'border-black'
                        : 'border-gray-200 hover:border-gray-400'
                    } focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      loading="lazy"
                      decoding="async"
                      sizes="(min-width: 768px) 10vw, 25vw"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 flex flex-col justify-between">
            <div>
              {isSizeRequired && (
                <p className="text-xs tracking-wider uppercase text-gray-500 mb-3">
                  {product.category}
                </p>
              )}
              <h2 className="text-3xl tracking-wider uppercase mb-4">
                {product.name}
              </h2>

              {isSizeRequired && (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-2xl font-light">{displayPrice}</p>
                    {hasDiscount && compareAt && (
                      <>
                        <span className="text-sm text-gray-500 line-through">₦{compareAt.toLocaleString()}</span>
                        {discountPercent !== null && (
                          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                            -{discountPercent}%
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {outOfStock && (
                    <p className="text-sm text-red-600 mb-4">Out of stock</p>
                  )}
                  {!outOfStock && lowStock && (
                    <p className="text-sm text-amber-600 mb-4">Low stock — order soon</p>
                  )}
                </>
              )}

              {product.description && (
                <p className="text-sm text-gray-600 leading-relaxed mb-8">
                  {product.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8" aria-label="Trust and service information">
                <div className="flex items-start gap-3 border border-gray-200 p-3">
                  <Truck className="w-5 h-5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold tracking-wide uppercase">Fast delivery</p>
                    <p className="text-xs text-gray-600">Ships in 2-5 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border border-gray-200 p-3">
                  <RefreshCcw className="w-5 h-5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold tracking-wide uppercase">Easy returns</p>
                    <p className="text-xs text-gray-600">7-day hassle-free returns</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border border-gray-200 p-3">
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold tracking-wide uppercase">Secure payments</p>
                    <p className="text-xs text-gray-600">SSL encrypted checkout</p>
                  </div>
                </div>
              </div>

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
                        aria-label={`Select color ${color.name || idx + 1}`}
                        aria-pressed={selectedColor === idx}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === idx
                            ? 'border-black scale-110'
                            : 'border-gray-300 hover:border-gray-500'
                        } focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2`}
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
                          aria-label={`Select size ${size}`}
                          aria-pressed={selectedSize === size}
                          className={`px-4 py-2 border text-xs tracking-wider uppercase transition-all ${
                            selectedSize === size
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 bg-white hover:border-black'
                          } focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2`}
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
                disabled={isAddDisabled}
                aria-label={outOfStock ? 'Out of stock' : sizeNotSelected ? 'Select a size' : 'Add to bag'}
                className={`w-full py-3 flex items-center justify-center space-x-3 transition-all group shadow-lg ${
                  isAddDisabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 hover:shadow-2xl hover:scale-105'
                } focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2`}
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm tracking-widest uppercase">
                  {outOfStock ? 'Out of Stock' : sizeNotSelected ? 'Select a Size' : 'Add to Bag'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleToggleWishlist}
                  aria-pressed={isInWishlist(product.id)}
                  aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  className="py-2 border border-black flex items-center justify-center space-x-2 hover:bg-black hover:text-white transition-colors group focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
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
