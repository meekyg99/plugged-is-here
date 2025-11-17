import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useState } from 'react';

interface CheckoutCartProps {
  onNext: () => void;
}

export default function CheckoutCart({ onNext }: CheckoutCartProps) {
  const { items, updateQuantity, removeItem } = useCart();
  const [promoCode, setPromoCode] = useState('');

  return (
    <div className="bg-white p-6 shadow-sm">
      <h2 className="text-2xl tracking-wider uppercase font-light mb-6">Shopping Cart</h2>

      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.variant_id} className="flex gap-4 pb-6 border-b border-gray-200">
            <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
              <img
                src="https://images.pexels.com/photos/5240696/pexels-photo-5240696.jpeg"
                alt={item.product?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-base font-medium tracking-wider">
                    {item.product?.name}
                  </h3>
                  {item.variant && (
                    <p className="text-sm text-gray-500 mt-1">
                      {item.variant.color && `${item.variant.color} / `}
                      {item.variant.size}
                    </p>
                  )}
                  <p className="text-base mt-2">
                    ₦{item.variant?.price.toLocaleString() || 0}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.variant_id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors h-8"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                  className="p-2 border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-base w-12 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                  className="p-2 border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                {item.variant && item.variant.stock_quantity < 10 && (
                  <span className="text-xs text-orange-600 ml-2">
                    Only {item.variant.stock_quantity} left in stock
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Promo code"
            className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
          />
          <button className="px-6 py-3 border border-black uppercase tracking-wider hover:bg-gray-100 transition-colors">
            Apply
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          className="px-8 py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors"
        >
          Continue to Shipping
        </button>
      </div>
    </div>
  );
}
