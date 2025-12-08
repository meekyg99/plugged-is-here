import { useEffect, useState } from 'react';
import { CheckCircle, Download, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { OrderWithDetails } from '../types/database';

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = window.location.pathname.split('/').pop();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items(
              *,
              product:products(*),
              variant:product_variants(*)
            ),
            payment:payments(*)
          `)
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data as any);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 tracking-wider">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl tracking-wider uppercase mb-4">Order not found</h1>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  const payment = Array.isArray(order.payment) ? order.payment[0] : order.payment;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white p-8 shadow-sm text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl tracking-wider uppercase font-light mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been received.
            </p>
          </div>

          {/* Tracking ID - Primary Display */}
          <div className="mb-6 p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg">
            <p className="text-sm opacity-80 mb-1 tracking-wider uppercase">Your Tracking ID</p>
            <p className="text-3xl font-bold tracking-wider">{order.tracking_id}</p>
            <p className="text-sm opacity-80 mt-2">Save this ID to track your order anytime</p>
          </div>

          <div className="mb-6">
            <a
              href="/track-order"
              className="inline-block px-8 py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              Track Your Order
            </a>
          </div>

          <div className="mb-8 p-4 bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1 tracking-wider uppercase">Order Number</p>
            <p className="text-xl font-medium">{order.order_number}</p>
          </div>

          {payment?.payment_method === 'bank_transfer' && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 text-left">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900 mb-2">Bank Transfer Instructions</p>
                  <p className="text-sm text-blue-800 mb-3">
                    Please transfer ₦{order.total.toLocaleString()} to the account below:
                  </p>
                  <div className="space-y-1 text-sm text-blue-900">
                    <p><strong>Bank:</strong> Example Bank</p>
                    <p><strong>Account Name:</strong> Fashion Store Ltd</p>
                    <p><strong>Account Number:</strong> 0123456789</p>
                    <p><strong>Reference:</strong> {order.tracking_id}</p>
                  </div>
                  <p className="text-xs text-blue-700 mt-3">
                    Your order will be processed once we confirm your payment.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8 text-left">
            <h2 className="text-lg tracking-wider uppercase font-light mb-4 pb-2 border-b border-gray-200">
              Order Details
            </h2>

            <div className="space-y-4 mb-6">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                    <img
                      src="https://images.pexels.com/photos/5240696/pexels-photo-5240696.jpeg"
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.product?.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.variant?.color} / {item.variant?.size} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₦{item.total.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₦{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>₦{order.shipping_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>₦{order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-medium pt-2 border-t border-gray-200">
                <span className="tracking-wider uppercase">Total</span>
                <span>₦{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mb-8 text-left">
            <h3 className="text-sm tracking-wider uppercase font-medium mb-3">Shipping Address</h3>
            <div className="text-gray-700 space-y-1 text-sm">
              <p>{order.shipping_address.full_name}</p>
              <p>{order.shipping_address.phone}</p>
              <p>{order.shipping_address.address_line1}</p>
              {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
              <p>
                {order.shipping_address.city}, {order.shipping_address.state}
              </p>
              {order.shipping_address.postal_code && <p>{order.shipping_address.postal_code}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 px-6 py-3 border border-black uppercase tracking-wider hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
            <a
              href="/"
              className="flex-1 px-6 py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors inline-flex items-center justify-center"
            >
              Continue Shopping
            </a>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            A confirmation email has been sent to <strong>{order.email}</strong>
          </p>
          <p className="mt-2">
            Questions? Contact us at support@fashionstore.ng
          </p>
        </div>
      </div>
    </div>
  );
}
