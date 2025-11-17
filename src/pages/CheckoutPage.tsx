import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '../hooks/useNavigate';
import CheckoutCart from '../components/checkout/CheckoutCart';
import CheckoutShipping from '../components/checkout/CheckoutShipping';
import CheckoutPayment from '../components/checkout/CheckoutPayment';
import CheckoutReview from '../components/checkout/CheckoutReview';
import CheckoutProgress from '../components/checkout/CheckoutProgress';
import { Address } from '../types/database';

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'review';

interface CheckoutData {
  email: string;
  shippingAddress: Address | null;
  billingAddress: Address | null;
  useSameAddress: boolean;
  shippingMethod: string;
  paymentMethod: 'paystack' | 'stripe' | 'bank_transfer';
  guestCheckout: boolean;
  createAccount: boolean;
  promoCode: string;
}

export default function CheckoutPage() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    email: user?.email || '',
    shippingAddress: null,
    billingAddress: null,
    useSameAddress: true,
    shippingMethod: '',
    paymentMethod: 'paystack',
    guestCheckout: !user,
    createAccount: false,
    promoCode: '',
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl tracking-wider uppercase mb-4">Your cart is empty</h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const steps: CheckoutStep[] = ['cart', 'shipping', 'payment', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const updateCheckoutData = (data: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl tracking-wider uppercase font-light mb-8">Checkout</h1>
          <CheckoutProgress currentStep={currentStep} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === 'cart' && (
              <CheckoutCart onNext={handleNext} />
            )}
            {currentStep === 'shipping' && (
              <CheckoutShipping
                data={checkoutData}
                onUpdate={updateCheckoutData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 'payment' && (
              <CheckoutPayment
                data={checkoutData}
                onUpdate={updateCheckoutData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 'review' && (
              <CheckoutReview
                data={checkoutData}
                onBack={handleBack}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-sm sticky top-8">
              <h2 className="text-lg tracking-wider uppercase font-light mb-4 pb-4 border-b border-gray-200">
                Order Summary
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.variant_id} className="flex gap-3">
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
                      <p className="text-sm mt-1">₦{((item.variant?.price || 0) * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
                {checkoutData.shippingMethod && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>₦{checkoutData.shippingMethod === 'standard' ? '2,500' : '5,000'}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>₦0</span>
                </div>
                {checkoutData.promoCode && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₦0</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-medium pt-2 border-t border-gray-200">
                  <span className="tracking-wider uppercase">Total</span>
                  <span>₦{(total + (checkoutData.shippingMethod === 'standard' ? 2500 : checkoutData.shippingMethod === 'express' ? 5000 : 0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
