import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from '../../hooks/useNavigate';
import { supabase } from '../../lib/supabase';

interface CheckoutReviewProps {
  data: {
    email: string;
    shippingAddress: any;
    billingAddress: any;
    shippingMethod: string;
    paymentMethod: 'paystack' | 'stripe' | 'bank_transfer';
  };
  onBack: () => void;
}

export default function CheckoutReview({ data, onBack }: CheckoutReviewProps) {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const shippingCost = data.shippingMethod === 'standard' ? 2500 : 5000;
  const orderTotal = total + shippingCost;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          order_number: orderNumber,
          status: 'pending',
          email: data.email,
          phone: data.shippingAddress.phone,
          shipping_address: data.shippingAddress,
          billing_address: data.billingAddress || data.shippingAddress,
          subtotal: total,
          tax: 0,
          shipping_cost: shippingCost,
          total: orderTotal,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.variant?.price || 0,
        total: (item.variant?.price || 0) * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrement_stock', {
          variant_id: item.variant_id,
          quantity: item.quantity,
        });

        if (stockError) console.error('Stock update error:', stockError);
      }

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_method: data.paymentMethod,
          amount: orderTotal,
          currency: 'NGN',
          status: 'pending',
        });

      if (paymentError) throw paymentError;

      clearCart();
      navigate(`/order-success/${order.id}`);
    } catch (err: any) {
      console.error('Order creation error:', err);
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white p-6 shadow-sm">
      <h2 className="text-2xl tracking-wider uppercase font-light mb-6">Review Your Order</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm tracking-wider uppercase font-medium mb-3 pb-2 border-b border-gray-200">
            Contact Information
          </h3>
          <p className="text-gray-700">{data.email}</p>
        </div>

        <div>
          <h3 className="text-sm tracking-wider uppercase font-medium mb-3 pb-2 border-b border-gray-200">
            Shipping Address
          </h3>
          {data.shippingAddress && (
            <div className="text-gray-700 space-y-1">
              <p>{data.shippingAddress.full_name}</p>
              <p>{data.shippingAddress.phone}</p>
              <p>{data.shippingAddress.address_line1}</p>
              {data.shippingAddress.address_line2 && <p>{data.shippingAddress.address_line2}</p>}
              <p>
                {data.shippingAddress.city}, {data.shippingAddress.state}
              </p>
              {data.shippingAddress.postal_code && <p>{data.shippingAddress.postal_code}</p>}
              <p>{data.shippingAddress.country}</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm tracking-wider uppercase font-medium mb-3 pb-2 border-b border-gray-200">
            Shipping Method
          </h3>
          <div className="flex justify-between items-center">
            <p className="text-gray-700">
              {data.shippingMethod === 'standard' ? 'Standard Shipping (5-7 days)' : 'Express Shipping (2-3 days)'}
            </p>
            <p className="font-medium">₦{shippingCost.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm tracking-wider uppercase font-medium mb-3 pb-2 border-b border-gray-200">
            Payment Method
          </h3>
          <p className="text-gray-700">
            {data.paymentMethod === 'paystack' && 'Paystack (Card/Bank Transfer)'}
            {data.paymentMethod === 'stripe' && 'Stripe (International Card)'}
            {data.paymentMethod === 'bank_transfer' && 'Direct Bank Transfer'}
          </p>
        </div>

        <div>
          <h3 className="text-sm tracking-wider uppercase font-medium mb-3 pb-2 border-b border-gray-200">
            Order Items
          </h3>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.variant_id} className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                  <img
                    src="https://images.pexels.com/photos/5240696/pexels-photo-5240696.jpeg"
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{item.product?.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.variant?.color} / {item.variant?.size} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    ₦{((item.variant?.price || 0) * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span>₦{shippingCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span>₦0</span>
          </div>
          <div className="flex justify-between text-lg font-medium pt-2 border-t border-gray-200">
            <span className="tracking-wider uppercase">Total</span>
            <span>₦{orderTotal.toLocaleString()}</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4 justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={isProcessing}
            className="px-8 py-3 border border-black uppercase tracking-wider hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back to Payment
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="px-8 py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
