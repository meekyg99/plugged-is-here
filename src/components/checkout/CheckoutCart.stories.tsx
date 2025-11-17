import type { Meta, StoryObj } from '@storybook/react';
import CheckoutCart from './CheckoutCart';
import { CartProvider } from '../../contexts/CartContext';
import { AuthProvider } from '../../contexts/AuthContext';

const meta = {
  title: 'Checkout/CheckoutCart',
  component: CheckoutCart,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <AuthProvider>
        <CartProvider>
          <div className="p-8 bg-gray-50 min-h-screen">
            <Story />
          </div>
        </CartProvider>
      </AuthProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof CheckoutCart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyCart: Story = {
  args: {
    onNext: () => console.log('Next clicked'),
  },
};

export const WithItems: Story = {
  args: {
    onNext: () => console.log('Next clicked'),
  },
  decorators: [
    (Story) => {
      return (
        <AuthProvider>
          <CartProvider>
            <div className="p-8 bg-gray-50 min-h-screen">
              <Story />
            </div>
          </CartProvider>
        </AuthProvider>
      );
    },
  ],
};
