/**
 * Security Utilities
 * 
 * This module provides comprehensive security functions for:
 * - Input validation and sanitization
 * - XSS prevention
 * - Generic error messages (no information leakage)
 * - Access control helpers
 */

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  
  return str.replace(/[&<>"'`=/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Remove potentially dangerous characters while preserving readability
 */
export function sanitizeString(str: string, options: {
  maxLength?: number;
  allowSpaces?: boolean;
  allowNewlines?: boolean;
} = {}): string {
  if (typeof str !== 'string') return '';
  
  const { maxLength = 1000, allowSpaces = true, allowNewlines = false } = options;
  
  let sanitized = str
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newlines if allowed
    .replace(allowNewlines ? /[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g : /[\x00-\x1F\x7F]/g, '')
    // Trim whitespace
    .trim();
  
  if (!allowSpaces) {
    sanitized = sanitized.replace(/\s+/g, '');
  }
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitize a name field - allows letters, spaces, hyphens, apostrophes
 */
export function sanitizeName(name: string): string {
  if (typeof name !== 'string') return '';
  
  return name
    // Remove anything that's not a letter, space, hyphen, apostrophe, or period
    .replace(/[^a-zA-ZÀ-ÿ\s\-'.]/g, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    // Limit length
    .substring(0, 100)
    .trim();
}

/**
 * Sanitize phone number - only digits and + for international
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';
  
  return phone
    .replace(/[^\d+]/g, '')
    .substring(0, 20);
}

/**
 * Sanitize an address field
 */
export function sanitizeAddress(address: string): string {
  if (typeof address !== 'string') return '';
  
  return address
    // Allow letters, numbers, spaces, common punctuation
    .replace(/[^a-zA-Z0-9À-ÿ\s\-'.,#/]/g, '')
    .replace(/\s+/g, ' ')
    .substring(0, 500)
    .trim();
}

// ============================================
// INPUT VALIDATION
// ============================================

/**
 * Validate email format strictly
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  
  // RFC 5322 compliant regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return email.length <= 254 && emailRegex.test(email);
}

/**
 * Validate name format
 */
export function isValidName(name: string): boolean {
  if (typeof name !== 'string') return false;
  
  const sanitized = sanitizeName(name);
  
  // Must be 2-100 characters, only allowed characters
  return sanitized.length >= 2 && sanitized.length <= 100 && /^[a-zA-ZÀ-ÿ\s\-'.]+$/.test(sanitized);
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  if (typeof phone !== 'string') return false;
  
  const cleaned = sanitizePhone(phone);
  
  // 10-15 digits, optionally starting with +
  return /^\+?\d{10,15}$/.test(cleaned);
}

/**
 * Validate Nigerian phone number
 */
export function isValidNigerianPhone(phone: string): boolean {
  if (typeof phone !== 'string') return false;
  
  const cleaned = phone.replace(/\D/g, '');
  
  // Nigerian format: 0XXXXXXXXXX or 234XXXXXXXXXX
  return /^(0|234)[789]\d{9}$/.test(cleaned);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  if (typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate positive integer
 */
export function isValidPositiveInteger(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0;
  }
  if (typeof value === 'string') {
    const num = parseInt(value, 10);
    return !isNaN(num) && num > 0 && num.toString() === value;
  }
  return false;
}

/**
 * Validate amount/price (positive number with up to 2 decimal places)
 */
export function isValidAmount(value: unknown): boolean {
  if (typeof value === 'number') {
    return value > 0 && Number.isFinite(value);
  }
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0 && /^\d+(\.\d{1,2})?$/.test(value);
  }
  return false;
}

// ============================================
// SECURE ERROR MESSAGES
// ============================================

/**
 * Generic error messages that don't leak information
 */
export const SecureErrors = {
  // Authentication errors - intentionally vague
  AUTH_FAILED: 'Invalid credentials. Please check your email and password.',
  AUTH_GENERIC: 'Authentication failed. Please try again.',
  AUTH_RATE_LIMITED: 'Too many attempts. Please try again later.',
  AUTH_SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  
  // Authorization errors
  ACCESS_DENIED: 'You do not have permission to perform this action.',
  RESOURCE_NOT_FOUND: 'The requested resource was not found.',
  
  // Validation errors
  INVALID_INPUT: 'Please check your input and try again.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_NAME: 'Please enter a valid name.',
  REQUIRED_FIELD: 'This field is required.',
  
  // Server errors - never expose details
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  
  // Rate limiting
  TOO_MANY_REQUESTS: 'Too many requests. Please wait a moment.',
} as const;

/**
 * Convert any error to a safe, user-friendly message
 * NEVER expose stack traces or internal error details
 */
export function toSafeError(error: unknown, context?: string): string {
  // Log the real error for debugging (server-side only in production)
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    console.error(`[${context || 'Error'}]`, error);
  }
  
  // Check for known safe error types
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Map known error patterns to safe messages
    if (message.includes('invalid login') || message.includes('invalid password')) {
      return SecureErrors.AUTH_FAILED;
    }
    if (message.includes('rate limit') || message.includes('too many')) {
      return SecureErrors.AUTH_RATE_LIMITED;
    }
    if (message.includes('session') || message.includes('expired')) {
      return SecureErrors.AUTH_SESSION_EXPIRED;
    }
    if (message.includes('not found') || message.includes('no rows')) {
      return SecureErrors.RESOURCE_NOT_FOUND;
    }
    if (message.includes('permission') || message.includes('denied') || message.includes('unauthorized')) {
      return SecureErrors.ACCESS_DENIED;
    }
  }
  
  // Default to generic server error
  return SecureErrors.SERVER_ERROR;
}

// ============================================
// ACCESS CONTROL HELPERS
// ============================================

/**
 * Verify that a user owns a resource
 */
export function verifyOwnership(resourceUserId: string | null, currentUserId: string | null): boolean {
  if (!resourceUserId || !currentUserId) return false;
  return resourceUserId === currentUserId;
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string | null | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Check if user is an admin (admin, manager, or support)
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return hasRole(role, ['admin', 'manager', 'support']);
}

// ============================================
// REQUEST VALIDATION
// ============================================

export interface AddressValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitizedData: Record<string, string>;
}

export interface FormValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitizedData: Record<string, unknown>;
}

/**
 * Validate and sanitize checkout shipping address
 */
export function validateAndSanitizeAddress(address: Record<string, unknown>): AddressValidationResult {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, string> = {};
  
  // Full name
  const fullName = String(address.full_name || '');
  sanitizedData.full_name = sanitizeName(fullName);
  if (!isValidName(fullName)) {
    errors.full_name = 'Please enter a valid name (letters only)';
  }
  
  // Phone
  const phone = String(address.phone || '');
  sanitizedData.phone = sanitizePhone(phone);
  if (!isValidPhone(phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  // Address line 1
  const addressLine1 = String(address.address_line1 || '');
  sanitizedData.address_line1 = sanitizeAddress(addressLine1);
  if (sanitizedData.address_line1.length < 5) {
    errors.address_line1 = 'Please enter a valid street address';
  }
  
  // Address line 2 (optional)
  if (address.address_line2) {
    sanitizedData.address_line2 = sanitizeAddress(String(address.address_line2));
  }
  
  // City
  const city = String(address.city || '');
  sanitizedData.city = sanitizeAddress(city);
  if (sanitizedData.city.length < 2) {
    errors.city = 'Please enter a valid city';
  }
  
  // State
  const state = String(address.state || '');
  sanitizedData.state = sanitizeAddress(state);
  if (sanitizedData.state.length < 2) {
    errors.state = 'Please select a state';
  }
  
  // Postal code (optional)
  if (address.postal_code) {
    sanitizedData.postal_code = String(address.postal_code).replace(/[^\d\s-]/g, '').substring(0, 10);
  }
  
  // Country
  const country = String(address.country || 'Nigeria');
  sanitizedData.country = sanitizeAddress(country);
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
}

/**
 * Validate checkout form data
 */
export function validateCheckoutForm(data: Record<string, unknown>): FormValidationResult {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, unknown> = {};
  
  // Email
  const email = String(data.email || '');
  sanitizedData.email = email.toLowerCase().trim();
  if (!isValidEmail(email)) {
    errors.email = SecureErrors.INVALID_EMAIL;
  }
  
  // Shipping method
  const shippingMethod = String(data.shippingMethod || '');
  if (!['standard', 'express'].includes(shippingMethod)) {
    errors.shippingMethod = 'Please select a valid shipping method';
  }
  sanitizedData.shippingMethod = shippingMethod;
  
  // Payment method
  const paymentMethod = String(data.paymentMethod || '');
  if (!['paystack', 'stripe', 'bank_transfer'].includes(paymentMethod)) {
    errors.paymentMethod = 'Please select a valid payment method';
  }
  sanitizedData.paymentMethod = paymentMethod;
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
}

/**
 * Validate order ID parameter
 */
export function validateOrderId(orderId: unknown): { valid: boolean; error?: string; id?: string } {
  if (typeof orderId !== 'string') {
    return { valid: false, error: SecureErrors.INVALID_INPUT };
  }
  
  if (!isValidUUID(orderId)) {
    return { valid: false, error: SecureErrors.INVALID_INPUT };
  }
  
  return { valid: true, id: orderId };
}

/**
 * Validate product variant quantity
 */
export function validateQuantity(quantity: unknown): { valid: boolean; error?: string; value?: number } {
  if (!isValidPositiveInteger(quantity)) {
    return { valid: false, error: 'Please enter a valid quantity' };
  }
  
  const num = typeof quantity === 'number' ? quantity : parseInt(String(quantity), 10);
  
  if (num > 100) {
    return { valid: false, error: 'Maximum quantity is 100' };
  }
  
  return { valid: true, value: num };
}

// ============================================
// ALIASES FOR BACKWARD COMPATIBILITY
// ============================================

/**
 * Alias for sanitizeString - sanitizes user input
 */
export function sanitizeInput(input: string): string {
  return sanitizeString(input, { maxLength: 500 });
}

/**
 * Alias for isValidEmail - validates email format
 */
export function validateEmail(email: string): boolean {
  return isValidEmail(email);
}

/**
 * Alias for isValidName - validates name format
 */
export function validateName(name: string): boolean {
  return isValidName(name);
}
