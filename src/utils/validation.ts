import { NIGERIAN_STATES } from '../constants/nigerianStates';
import { sanitizeInput, isValidName as securityValidateName } from './security';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

export const validateNigerianPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  const nigerianPhoneRegex = /^(0|\+?234)?[789]\d{9}$/;
  return nigerianPhoneRegex.test(cleanPhone);
};

export const validatePostalCode = (postalCode: string): boolean => {
  const cleanPostalCode = postalCode.replace(/\s/g, '');
  return /^\d{6}$/.test(cleanPostalCode);
};

export const validateNigerianState = (state: string): boolean => {
  return NIGERIAN_STATES.some(s => s.toLowerCase() === state.toLowerCase());
};

export const validateRequiredField = (value: string | undefined | null): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

// Validate name has only letters, spaces, hyphens, and apostrophes
export const validateFullName = (name: string): boolean => {
  if (!name || name.trim().length < 2 || name.trim().length > 100) {
    return false;
  }
  return securityValidateName(name);
};

// Validate city name (letters, spaces, hyphens)
export const validateCityName = (city: string): boolean => {
  if (!city || city.trim().length < 2 || city.trim().length > 100) {
    return false;
  }
  // City names: letters, spaces, hyphens, periods allowed
  return /^[a-zA-Z\s\-\.]+$/.test(city.trim());
};

// Validate street address (alphanumeric with common punctuation)
export const validateStreetAddress = (address: string): boolean => {
  if (!address || address.trim().length < 5 || address.trim().length > 200) {
    return false;
  }
  // Allow letters, numbers, spaces, commas, periods, hyphens, slashes, #
  return /^[a-zA-Z0-9\s,.\-\/#]+$/.test(address.trim());
};

export interface AddressValidationErrors {
  full_name?: string;
  phone?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export const validateAddress = (address: {
  full_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}): { valid: boolean; errors: AddressValidationErrors } => {
  const errors: AddressValidationErrors = {};

  if (!validateRequiredField(address.full_name)) {
    errors.full_name = 'Full name is required';
  } else if (address.full_name && !validateFullName(address.full_name)) {
    errors.full_name = 'Please enter a valid name (letters only)';
  }

  if (!validateRequiredField(address.phone)) {
    errors.phone = 'Phone number is required';
  } else if (address.phone && address.country === 'Nigeria' && !validateNigerianPhone(address.phone)) {
    errors.phone = 'Please enter a valid Nigerian phone number';
  } else if (address.phone && !validatePhone(address.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (!validateRequiredField(address.address_line1)) {
    errors.address_line1 = 'Street address is required';
  } else if (address.address_line1 && !validateStreetAddress(address.address_line1)) {
    errors.address_line1 = 'Please enter a valid street address';
  }

  if (!validateRequiredField(address.city)) {
    errors.city = 'City is required';
  } else if (address.city && !validateCityName(address.city)) {
    errors.city = 'Please enter a valid city name';
  }

  if (!validateRequiredField(address.state)) {
    errors.state = 'State is required';
  } else if (address.state && address.country === 'Nigeria' && !validateNigerianState(address.state)) {
    errors.state = 'Please select a valid Nigerian state';
  }

  if (address.postal_code && address.country === 'Nigeria' && !validatePostalCode(address.postal_code)) {
    errors.postal_code = 'Postal code must be 6 digits';
  }

  if (!validateRequiredField(address.country)) {
    errors.country = 'Country is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCheckoutData = (data: {
  email?: string;
  shippingAddress?: any;
  shippingMethod?: string;
  paymentMethod?: string;
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!validateRequiredField(data.email)) {
    errors.email = 'Email is required';
  } else if (data.email && !validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.shippingAddress) {
    errors.shippingAddress = 'Shipping address is required';
  }

  if (!validateRequiredField(data.shippingMethod)) {
    errors.shippingMethod = 'Please select a shipping method';
  }

  if (!validateRequiredField(data.paymentMethod)) {
    errors.paymentMethod = 'Please select a payment method';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
