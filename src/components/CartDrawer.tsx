import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, total, isOpen, toggleCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={toggleCart}
      />
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl tracking-wider uppercase font-light">Shopping Cart</h2>
          <button
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center tracking-wider">
              Your cart is empty
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.variant_id} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 flex-shrink-0 overflow-hidden">
                      {item.product && (
                        <img
                          src={
                            item.image_url ||
                            (Array.isArray((item.product as any)?.images) && (item.product as any).images[0]?.image_url) ||
                            ''
                          }
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium tracking-wider">
                        {item.product?.name || 'Product'}
                      </h3>
                      {item.variant && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.variant.color && `${item.variant.color} / `}
                          {item.variant.size && item.variant.size}
                        </p>
                      )}
                      <p className="text-sm font-light mt-2">
                        ₦{item.variant?.price.toLocaleString() || 0}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                          className="p-1 border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                          className="p-1 border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.variant_id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 space-y-4">
              <div className="flex justify-between text-lg">
                <span className="tracking-wider uppercase">Total</span>
                <span className="font-light">₦{total.toLocaleString()}</span>
              </div>
              <a
                href="/checkout"
                className="w-full py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors block text-center"
              >
                Proceed to Checkout
              </a>
              <button
                onClick={toggleCart}
                className="w-full py-3 border border-black uppercase tracking-wider hover:bg-gray-100 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
