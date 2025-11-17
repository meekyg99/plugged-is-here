import { CreditCard, Building2, Globe } from 'lucide-react';

interface CheckoutPaymentProps {
  data: {
    paymentMethod: 'paystack' | 'stripe' | 'bank_transfer';
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CheckoutPayment({ data, onUpdate, onNext, onBack }: CheckoutPaymentProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="bg-white p-6 shadow-sm">
      <h2 className="text-2xl tracking-wider uppercase font-light mb-6">Payment Method</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label
            className={`flex items-center p-4 border ${
              data.paymentMethod === 'paystack' ? 'border-black bg-gray-50' : 'border-gray-300'
            } cursor-pointer hover:border-gray-400 transition-colors`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="paystack"
              checked={data.paymentMethod === 'paystack'}
              onChange={(e) => onUpdate({ paymentMethod: e.target.value })}
              className="mr-3"
            />
            <CreditCard className="w-5 h-5 mr-3 text-gray-600" />
            <div className="flex-1">
              <p className="font-medium tracking-wider">Paystack</p>
              <p className="text-sm text-gray-500">Pay with card or bank transfer (Nigerian customers)</p>
            </div>
          </label>

          <label
            className={`flex items-center p-4 border ${
              data.paymentMethod === 'bank_transfer' ? 'border-black bg-gray-50' : 'border-gray-300'
            } cursor-pointer hover:border-gray-400 transition-colors`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="bank_transfer"
              checked={data.paymentMethod === 'bank_transfer'}
              onChange={(e) => onUpdate({ paymentMethod: e.target.value })}
              className="mr-3"
            />
            <Building2 className="w-5 h-5 mr-3 text-gray-600" />
            <div className="flex-1">
              <p className="font-medium tracking-wider">Direct Bank Transfer</p>
              <p className="text-sm text-gray-500">Transfer directly to our bank account</p>
            </div>
          </label>

          <label
            className={`flex items-center p-4 border ${
              data.paymentMethod === 'stripe' ? 'border-black bg-gray-50' : 'border-gray-300'
            } cursor-pointer hover:border-gray-400 transition-colors`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="stripe"
              checked={data.paymentMethod === 'stripe'}
              onChange={(e) => onUpdate({ paymentMethod: e.target.value })}
              className="mr-3"
            />
            <Globe className="w-5 h-5 mr-3 text-gray-600" />
            <div className="flex-1">
              <p className="font-medium tracking-wider">Stripe</p>
              <p className="text-sm text-gray-500">International payment with credit/debit card</p>
            </div>
          </label>
        </div>

        {data.paymentMethod === 'bank_transfer' && (
          <div className="p-4 bg-blue-50 border border-blue-200 text-sm">
            <p className="font-medium mb-2">Bank Transfer Instructions:</p>
            <p className="text-gray-700">
              After placing your order, you will receive bank account details via email.
              Your order will be processed once we confirm your payment.
            </p>
          </div>
        )}

        {data.paymentMethod === 'paystack' && (
          <div className="p-4 bg-gray-50 border border-gray-200 text-sm">
            <p className="text-gray-700">
              You will be redirected to Paystack to complete your payment securely.
              We accept all major Nigerian banks and cards.
            </p>
          </div>
        )}

        {data.paymentMethod === 'stripe' && (
          <div className="p-4 bg-gray-50 border border-gray-200 text-sm">
            <p className="text-gray-700">
              You will be redirected to Stripe to complete your payment securely.
              We accept Visa, Mastercard, and American Express.
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-3 border border-black uppercase tracking-wider hover:bg-gray-100 transition-colors"
          >
            Back to Shipping
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            Review Order
          </button>
        </div>
      </form>
    </div>
  );
}
