import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { ArrowLeft, Package, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { OrderWithDetails, OrderStatus } from '../../types/database';
import { sendOrderStatusEmail } from '../../services/emailService';
import { orderService } from '../../services/orderService';

export default function OrderDetailPage() {
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending');
  const [adminNotes, setAdminNotes] = useState('');

  const orderId = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
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
      setSelectedStatus(data.status);
      setAdminNotes(data.admin_notes || '');
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!orderId || !order) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: selectedStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Send status update email for key statuses (non-blocking)
      if (['processing', 'shipped', 'delivered'].includes(selectedStatus)) {
        const shippingAddr = order.shipping_address as any;
        sendOrderStatusEmail(order.email, {
          orderNumber: order.order_number,
          trackingId: order.tracking_id,
          status: selectedStatus as 'processing' | 'shipped' | 'delivered',
          customerName: shippingAddr?.full_name || 'Customer',
          trackingNumber: undefined,
          trackingUrl: `${window.location.origin}/track-order`,
          estimatedDelivery: selectedStatus === 'shipped' ? '2-5 business days' : undefined,
        }).catch(err => console.error('Failed to send status email:', err));
      }
      
      await fetchOrderDetails();
      alert('Order status updated successfully. Customer has been notified via email.');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const updateAdminNotes = async () => {
    if (!orderId) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ admin_notes: adminNotes })
        .eq('id', orderId);

      if (error) throw error;
      alert('Notes updated successfully');
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('Failed to update notes');
    } finally {
      setUpdating(false);
    }
  };

  const confirmPayment = async () => {
    if (!orderId || !order) return;
    
    const confirmed = window.confirm(
      'Confirm payment received? This will:\n' +
      '• Mark payment as completed\n' +
      '• Reduce stock for ordered items\n' +
      '• Update order status to "Processing"\n\n' +
      'This action cannot be easily undone.'
    );
    
    if (!confirmed) return;

    setUpdating(true);
    try {
      const result = await orderService.confirmPaymentAndReduceStock(orderId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to confirm payment');
      }

      await fetchOrderDetails();
      alert('Payment confirmed! Stock has been updated.');
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      alert(error.message || 'Failed to confirm payment');
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async () => {
    if (!orderId || !order) return;
    
    const confirmed = window.confirm(
      'Cancel this order? This will:\n' +
      '• Mark order as cancelled\n' +
      '• Mark payment as failed\n' +
      '• Stock will NOT be affected (wasn\'t reduced yet)\n\n' +
      'Continue?'
    );
    
    if (!confirmed) return;

    setUpdating(true);
    try {
      const result = await orderService.cancelOrder(orderId, adminNotes || 'Cancelled by admin');
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel order');
      }

      // Notify customer about cancellation (non-blocking)
      const shippingAddr = order.shipping_address as any;
      sendOrderStatusEmail(order.email, {
        orderNumber: order.order_number,
        trackingId: order.tracking_id,
        status: 'cancelled',
        customerName: shippingAddr?.full_name || 'Customer',
        trackingNumber: undefined,
        trackingUrl: `${window.location.origin}/track-order`,
        estimatedDelivery: undefined,
      }).catch(err => console.error('Failed to send cancellation email:', err));

      await fetchOrderDetails();
      alert('Order cancelled successfully.');
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      alert(error.message || 'Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  const refundOrder = async () => {
    if (!orderId || !order) return;
    
    const confirmed = window.confirm(
      'Refund this order? This will:\n' +
      '• Mark order as refunded\n' +
      '• Mark payment as refunded\n' +
      '• Restore stock for ordered items\n\n' +
      'Continue?'
    );
    
    if (!confirmed) return;

    setUpdating(true);
    try {
      const result = await orderService.restoreStockForOrder(orderId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to refund order');
      }

      await fetchOrderDetails();
      alert('Order refunded! Stock has been restored.');
    } catch (error: any) {
      console.error('Error refunding order:', error);
      alert(error.message || 'Failed to refund order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout activePage="orders">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout activePage="orders">
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-2xl tracking-wider uppercase mb-4">Order not found</h1>
            <a
              href="/admin/orders"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </a>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const payment = Array.isArray(order.payment) ? order.payment[0] : order.payment;

  const statusTimeline = [
    { status: 'pending', label: 'Pending', icon: Package },
    { status: 'processing', label: 'Processing', icon: Package },
    { status: 'shipped', label: 'Shipped', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const currentStatusIndex = statusTimeline.findIndex((s) => s.status === order.status);

  return (
    <AdminLayout activePage="orders">
      <div className="p-8">
        <div className="mb-6">
          <a
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </a>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl tracking-wider uppercase font-light">Order {order.order_number}</h1>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-bold rounded">
              {order.tracking_id}
            </span>
          </div>
          <p className="text-gray-600 mt-2">
            Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
            {new Date(order.created_at).toLocaleTimeString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 shadow-sm">
              <h2 className="text-xl tracking-wider uppercase font-light mb-6">Order Timeline</h2>
              <div className="flex items-center justify-between">
                {statusTimeline.map((item, index) => {
                  const Icon = item.icon;
                  const isCompleted = index <= currentStatusIndex;

                  return (
                    <div key={item.status} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                          isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <p
                        className={`text-xs tracking-wider uppercase ${
                          isCompleted ? 'text-black' : 'text-gray-400'
                        }`}
                      >
                        {item.label}
                      </p>
                      {index < statusTimeline.length - 1 && (
                        <div
                          className={`h-0.5 w-full mt-6 -ml-full ${
                            isCompleted ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 shadow-sm">
              <h2 className="text-xl tracking-wider uppercase font-light mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="w-20 h-20 bg-gray-100 flex-shrink-0">
                      <img
                        src="https://images.pexels.com/photos/5240696/pexels-photo-5240696.jpeg"
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium">{item.product?.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.variant?.color} / {item.variant?.size}
                      </p>
                      <p className="text-sm mt-2">
                        ₦{item.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-medium">₦{item.total.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
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

            <div className="bg-white p-6 shadow-sm">
              <h2 className="text-xl tracking-wider uppercase font-light mb-6">Admin Notes</h2>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="Add internal notes about this order..."
              />
              <button
                onClick={updateAdminNotes}
                disabled={updating}
                className="mt-4 px-6 py-2 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 shadow-sm">
              <h2 className="text-lg tracking-wider uppercase font-light mb-4">Update Status</h2>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors mb-4"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              <button
                onClick={updateOrderStatus}
                disabled={updating || selectedStatus === order.status}
                className="w-full px-6 py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>

            <div className="bg-white p-6 shadow-sm">
              <h2 className="text-lg tracking-wider uppercase font-light mb-4">Customer Info</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Email</p>
                  <p>{order.email}</p>
                </div>
                {order.phone && (
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Phone</p>
                    <p>{order.phone}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 shadow-sm">
              <h2 className="text-lg tracking-wider uppercase font-light mb-4">Shipping Address</h2>
              <div className="text-sm space-y-1">
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

            {payment && (
              <div className="bg-white p-6 shadow-sm">
                <h2 className="text-lg tracking-wider uppercase font-light mb-4">Payment Info</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method</span>
                    <span className="capitalize">{payment.payment_method.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`capitalize font-medium ${
                      payment.status === 'completed' ? 'text-green-600' :
                      payment.status === 'failed' ? 'text-red-600' :
                      payment.status === 'refunded' ? 'text-orange-600' :
                      'text-yellow-600'
                    }`}>{payment.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span>₦{payment.amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Action Buttons */}
                {payment.status === 'pending' && order.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <button
                      onClick={confirmPayment}
                      disabled={updating}
                      className="w-full px-4 py-2 bg-green-600 text-white uppercase tracking-wider text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {updating ? 'Processing...' : 'Confirm Payment'}
                    </button>
                    <button
                      onClick={cancelOrder}
                      disabled={updating}
                      className="w-full px-4 py-2 bg-red-600 text-white uppercase tracking-wider text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                    <p className="text-xs text-gray-500 flex items-start gap-1 mt-2">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      Stock is reserved but not yet deducted. It will only be reduced when payment is confirmed.
                    </p>
                  </div>
                )}

                {/* Refund button for confirmed orders */}
                {payment.status === 'completed' && ['processing', 'shipped', 'delivered'].includes(order.status) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={refundOrder}
                      disabled={updating}
                      className="w-full px-4 py-2 bg-orange-600 text-white uppercase tracking-wider text-sm hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      {updating ? 'Processing...' : 'Refund Order'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      This will restore stock and mark payment as refunded.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
