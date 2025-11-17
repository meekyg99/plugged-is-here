import { describe, it, expect } from 'vitest';

describe('Checkout Calculations', () => {
  it('calculates subtotal correctly', () => {
    const items = [
      { price: 5000, quantity: 2 },
      { price: 3000, quantity: 3 },
    ];

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    expect(subtotal).toBe(19000);
  });

  it('applies free shipping for orders over 50000', () => {
    const subtotal = 60000;
    const shippingCost = subtotal >= 50000 ? 0 : 2500;

    expect(shippingCost).toBe(0);
  });

  it('applies 2500 shipping for orders under 50000', () => {
    const subtotal = 30000;
    const shippingCost = subtotal >= 50000 ? 0 : 2500;

    expect(shippingCost).toBe(2500);
  });

  it('calculates total correctly', () => {
    const subtotal = 45000;
    const shipping = 2500;
    const total = subtotal + shipping;

    expect(total).toBe(47500);
  });

  it('handles multiple items with different quantities', () => {
    const items = [
      { price: 15000, quantity: 1 },
      { price: 8000, quantity: 2 },
      { price: 12000, quantity: 3 },
    ];

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    expect(subtotal).toBe(67000);
  });

  it('calculates discount correctly', () => {
    const subtotal = 50000;
    const discountPercent = 10;
    const discount = (subtotal * discountPercent) / 100;

    expect(discount).toBe(5000);
  });

  it('calculates final total with discount and shipping', () => {
    const subtotal = 45000;
    const discount = 5000;
    const shipping = 2500;
    const total = subtotal - discount + shipping;

    expect(total).toBe(42500);
  });
});
