import { Check } from 'lucide-react';

interface CheckoutProgressProps {
  currentStep: 'cart' | 'shipping' | 'payment' | 'review';
}

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const steps = [
    { id: 'cart', name: 'Cart', order: 1 },
    { id: 'shipping', name: 'Shipping', order: 2 },
    { id: 'payment', name: 'Payment', order: 3 },
    { id: 'review', name: 'Review', order: 4 },
  ];

  const currentOrder = steps.find(s => s.id === currentStep)?.order || 1;

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                step.order < currentOrder
                  ? 'bg-green-600 text-white'
                  : step.order === currentOrder
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {step.order < currentOrder ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm">{step.order}</span>
              )}
            </div>
            <span
              className={`mt-2 text-xs tracking-wider uppercase ${
                step.order <= currentOrder ? 'text-black' : 'text-gray-400'
              }`}
            >
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 transition-all ${
                step.order < currentOrder ? 'bg-green-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
