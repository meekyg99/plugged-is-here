import type { Meta, StoryObj } from '@storybook/react';
import AdminLayout from './AdminLayout';
import { AuthProvider } from '../../contexts/AuthContext';

const meta = {
  title: 'Admin/AdminLayout',
  component: AdminLayout,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof AdminLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {
  args: {
    activePage: 'dashboard',
    children: (
      <div className="p-8">
        <h1 className="text-3xl tracking-wider uppercase font-light mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 shadow-sm">
            <p className="text-2xl font-light mb-2">145</p>
            <p className="text-sm text-gray-600 tracking-wider uppercase">Total Orders</p>
          </div>
          <div className="bg-white p-6 shadow-sm">
            <p className="text-2xl font-light mb-2">₦2,450,000</p>
            <p className="text-sm text-gray-600 tracking-wider uppercase">Revenue</p>
          </div>
          <div className="bg-white p-6 shadow-sm">
            <p className="text-2xl font-light mb-2">1,234</p>
            <p className="text-sm text-gray-600 tracking-wider uppercase">Customers</p>
          </div>
        </div>
      </div>
    ),
  },
};

export const Products: Story = {
  args: {
    activePage: 'products',
    children: (
      <div className="p-8">
        <h1 className="text-3xl tracking-wider uppercase font-light mb-8">Products</h1>
        <div className="bg-white shadow-sm p-6">
          <p className="text-gray-600">Product management interface</p>
        </div>
      </div>
    ),
  },
};

export const Orders: Story = {
  args: {
    activePage: 'orders',
    children: (
      <div className="p-8">
        <h1 className="text-3xl tracking-wider uppercase font-light mb-8">Orders</h1>
        <div className="bg-white shadow-sm p-6">
          <p className="text-gray-600">Order management interface</p>
        </div>
      </div>
    ),
  },
};
