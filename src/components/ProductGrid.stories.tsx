import type { Meta, StoryObj } from '@storybook/react';
import ProductGrid from './ProductGrid';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { WishlistProvider } from '../contexts/WishlistContext';

const meta = {
  title: 'Components/ProductGrid',
  component: ProductGrid,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Story />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ProductGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithProducts: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Product grid showing available products with hover effects, wishlist, and quick view functionality.',
      },
    },
  },
};
