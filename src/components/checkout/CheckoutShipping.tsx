import { useEffect, useState } from 'react';
import { NIGERIAN_STATES } from '../../constants/nigerianStates';
import { Address } from '../../types/database';
import { validateAddress, validateEmail } from '../../utils/validation';
import { sanitizeInput } from '../../utils/security';

interface CheckoutShippingProps {
  data: {
    email: string;
    shippingAddress: Address | null;
    billingAddress: Address | null;
    useSameAddress: boolean;
    shippingMethod: string;
    guestCheckout: boolean;
    createAccount: boolean;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CheckoutShipping({ data, onUpdate, onNext, onBack }: CheckoutShippingProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shippingForm, setShippingForm] = useState<Address>(
    data.shippingAddress || {
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      country: 'Nigeria',
    }
  );

  useEffect(() => {
    const saved = localStorage.getItem('checkoutProfile');
    if (saved && !data.shippingAddress) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.shippingAddress) {
          setShippingForm(parsed.shippingAddress);
          onUpdate({
            email: parsed.email || data.email,
            shippingAddress: parsed.shippingAddress,
            billingAddress: parsed.billingAddress || parsed.shippingAddress,
          });
        }
      } catch (error) {
        console.warn('Failed to load saved checkout profile', error);
      }
    }
  }, [data.email, data.shippingAddress, onUpdate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (data.guestCheckout && (!data.email || !validateEmail(data.email))) {
      newErrors.email = data.email ? 'Please enter a valid email address' : 'Email is required';
    }

    const addressValidation = validateAddress({
      ...shippingForm,
      country: shippingForm.country || 'Nigeria',
    });

    if (!addressValidation.valid) {
      Object.assign(newErrors, addressValidation.errors);
    }

    if (!data.shippingMethod) {
      newErrors.shippingMethod = 'Please select a shipping method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Sanitize all form data before saving
      const sanitizedForm: Address = {
        full_name: sanitizeInput(shippingForm.full_name),
        phone: sanitizeInput(shippingForm.phone),
        address_line1: sanitizeInput(shippingForm.address_line1),
        address_line2: shippingForm.address_line2 ? sanitizeInput(shippingForm.address_line2) : '',
        city: sanitizeInput(shippingForm.city),
        state: sanitizeInput(shippingForm.state),
        country: shippingForm.country || 'Nigeria',
      };
      
      onUpdate({
        shippingAddress: sanitizedForm,
        billingAddress: data.useSameAddress ? sanitizedForm : data.billingAddress,
      });

      localStorage.setItem('checkoutProfile', JSON.stringify({
        email: data.email,
        shippingAddress: sanitizedForm,
        billingAddress: data.useSameAddress ? sanitizedForm : data.billingAddress,
      }));
      onNext();
    }
  };

  const updateField = (field: keyof Address, value: string) => {
    setShippingForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white p-6 shadow-sm">
      <h2 className="text-2xl tracking-wider uppercase font-light mb-6">Shipping Information</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {data.guestCheckout && (
          <div>
            <label className="block text-sm tracking-wider uppercase mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
              className={`w-full px-4 py-3 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-black transition-colors`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm tracking-wider uppercase mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={shippingForm.full_name}
              onChange={(e) => updateField('full_name', e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.full_name ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-black transition-colors`}
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
          </div>

          <div>
            <label className="block text-sm tracking-wider uppercase mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={shippingForm.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-black transition-colors`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm tracking-wider uppercase mb-2">
            Address Line 1 *
          </label>
          <input
            type="text"
            value={shippingForm.address_line1}
            onChange={(e) => updateField('address_line1', e.target.value)}
            className={`w-full px-4 py-3 border ${
              errors.address_line1 ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:border-black transition-colors`}
          />
          {errors.address_line1 && <p className="text-red-500 text-xs mt-1">{errors.address_line1}</p>}
        </div>

        <div>
          <label className="block text-sm tracking-wider uppercase mb-2">
            Address Line 2
          </label>
          <input
            type="text"
            value={shippingForm.address_line2 || ''}
            onChange={(e) => updateField('address_line2', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm tracking-wider uppercase mb-2">
              City *
            </label>
            <input
              type="text"
              value={shippingForm.city}
              onChange={(e) => updateField('city', e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-black transition-colors`}
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm tracking-wider uppercase mb-2">
              State *
            </label>
            <select
              value={shippingForm.state}
              onChange={(e) => updateField('state', e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-black transition-colors`}
            >
              <option value="">Select State</option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>

        </div>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg tracking-wider uppercase font-light mb-4">Shipping Method</h3>
          <div className="space-y-3">
            <label className={`flex items-center justify-between p-4 border ${
              data.shippingMethod === 'standard' ? 'border-black bg-gray-50' : 'border-gray-300'
            } cursor-pointer hover:border-gray-400 transition-colors`}>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="shippingMethod"
                  value="standard"
                  checked={data.shippingMethod === 'standard'}
                  onChange={(e) => onUpdate({ shippingMethod: e.target.value })}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium tracking-wider">Standard Shipping</p>
                  <p className="text-sm text-gray-500">5-7 business days</p>
                </div>
              </div>
              <span className="font-medium">₦2,500</span>
            </label>

            <label className={`flex items-center justify-between p-4 border ${
              data.shippingMethod === 'express' ? 'border-black bg-gray-50' : 'border-gray-300'
            } cursor-pointer hover:border-gray-400 transition-colors`}>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="shippingMethod"
                  value="express"
                  checked={data.shippingMethod === 'express'}
                  onChange={(e) => onUpdate({ shippingMethod: e.target.value })}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium tracking-wider">Express Shipping</p>
                  <p className="text-sm text-gray-500">2-3 business days</p>
                </div>
              </div>
              <span className="font-medium">₦5,000</span>
            </label>
          </div>
          {errors.shippingMethod && <p className="text-red-500 text-xs mt-2">{errors.shippingMethod}</p>}
        </div>

        {data.guestCheckout && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="createAccount"
              checked={data.createAccount}
              onChange={(e) => onUpdate({ createAccount: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="createAccount" className="text-sm text-gray-700">
              Create an account for faster checkout next time
            </label>
          </div>
        )}

        <div className="flex gap-4 justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-3 border border-black uppercase tracking-wider hover:bg-gray-100 transition-colors"
          >
            Back to Cart
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
}
