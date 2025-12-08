import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TrackingData {
  id: string;
  tracking_id: string;
  order_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  shipping_address: {
    city: string;
    state: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    color: string;
    size: string;
  }>;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const getStatusIndex = (status: string) => {
  if (status === 'cancelled' || status === 'refunded') return -1;
  return statusSteps.findIndex(s => s.key === status);
};

export default function TrackOrderPage() {
  const [trackingId, setTrackingId] = useState('');
  const [orderData, setOrderData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_order_by_tracking_id', {
        tracking_id_param: trackingId.trim().toUpperCase()
      });

      if (rpcError) throw rpcError;

      if (!data) {
        setError('No order found with this tracking ID. Please check and try again.');
        setOrderData(null);
      } else {
        setOrderData(data);
      }
    } catch (err: any) {
      console.error('Tracking error:', err);
      setError('Failed to look up order. Please try again.');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIndex = orderData ? getStatusIndex(orderData.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-3xl tracking-wider uppercase font-light mb-2">Track Your Order</h1>
          <p className="text-gray-400">Enter your tracking ID to see your order status</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Form */}
        <form onSubmit={handleTrack} className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                placeholder="Enter tracking ID (e.g., PLUG-11000)"
                className="w-full px-4 py-4 pl-12 border border-gray-300 focus:outline-none focus:border-black transition-colors uppercase tracking-wider"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Order Not Found */}
        {searched && !loading && !error && !orderData && (
          <div className="text-center py-12 bg-white shadow-sm">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl tracking-wider uppercase font-light mb-2">Order Not Found</h2>
            <p className="text-gray-600">
              We couldn't find an order with that tracking ID. 
              <br />Please check the ID and try again.
            </p>
          </div>
        )}

        {/* Order Found */}
        {orderData && (
          <div className="space-y-6">
            {/* Tracking Header */}
            <div className="bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider">Tracking ID</p>
                  <p className="text-2xl font-medium">{orderData.tracking_id}</p>
                </div>
                <div className={`px-4 py-2 uppercase tracking-wider text-sm font-medium ${
                  orderData.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  orderData.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  orderData.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  orderData.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  orderData.status === 'refunded' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {orderData.status}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Order Number</p>
                  <p className="font-medium">{orderData.order_number}</p>
                </div>
                <div>
                  <p className="text-gray-500">Order Date</p>
                  <p className="font-medium">{new Date(orderData.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            {orderData.status !== 'cancelled' && orderData.status !== 'refunded' && (
              <div className="bg-white p-6 shadow-sm">
                <h2 className="text-lg tracking-wider uppercase font-light mb-6">Order Progress</h2>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                    />
                  </div>
                  
                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = index <= currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;
                      
                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'bg-white border-gray-300 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className={`mt-2 text-xs tracking-wider uppercase text-center ${
                            isCompleted ? 'text-black font-medium' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-green-600 mt-1">Current</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Last Update */}
                <div className="mt-8 pt-4 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(orderData.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Cancelled/Refunded Status */}
            {(orderData.status === 'cancelled' || orderData.status === 'refunded') && (
              <div className={`p-6 ${orderData.status === 'cancelled' ? 'bg-red-50' : 'bg-orange-50'} shadow-sm`}>
                <div className="flex items-center gap-3">
                  <XCircle className={`w-8 h-8 ${orderData.status === 'cancelled' ? 'text-red-500' : 'text-orange-500'}`} />
                  <div>
                    <h3 className="font-medium text-lg">
                      Order {orderData.status === 'cancelled' ? 'Cancelled' : 'Refunded'}
                    </h3>
                    <p className="text-gray-600">
                      {orderData.status === 'cancelled' 
                        ? 'This order has been cancelled.'
                        : 'This order has been refunded.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="text-lg tracking-wider uppercase font-light mb-4">Items in Order</h2>
              <div className="space-y-3">
                {orderData.items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.color} / {item.size}</p>
                    </div>
                    <p className="text-sm">Qty: {item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Destination */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="text-lg tracking-wider uppercase font-light mb-4">Shipping To</h2>
              <p className="text-gray-700">
                {orderData.shipping_address.city}, {orderData.shipping_address.state}
                <br />
                {orderData.shipping_address.country}
              </p>
            </div>

            {/* Help Section */}
            <div className="bg-gray-100 p-6 text-center">
              <p className="text-gray-600 mb-3">Need help with your order?</p>
              <a 
                href="mailto:support@plugged.com" 
                className="inline-flex items-center gap-2 text-black hover:underline"
              >
                Contact Support <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Example Tracking ID */}
        {!searched && (
          <div className="text-center text-gray-500 text-sm">
            <p>Your tracking ID was sent to your email after placing your order.</p>
            <p className="mt-1">Example format: <span className="font-mono">PLUG-11000</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
