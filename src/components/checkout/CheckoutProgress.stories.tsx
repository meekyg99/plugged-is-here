import type { Meta, StoryObj } from '@storybook/react';
import CheckoutProgress from './CheckoutProgress';

const meta = {
  title: 'Checkout/CheckoutProgress',
  component: CheckoutProgress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CheckoutProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CartStep: Story = {
  args: {
    currentStep: 'cart',
  },
};

export const ShippingStep: Story = {
  args: {
    currentStep: 'shipping',
  },
};

export const PaymentStep: Story = {
  args: {
    currentStep: 'payment',
  },
};

export const ReviewStep: Story = {
  args: {
    currentStep: 'review',
  },
};
