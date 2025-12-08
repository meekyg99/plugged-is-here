export type UserRole = 'customer' | 'admin' | 'manager' | 'support';

export type Gender = 'men' | 'women' | 'unisex';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type PaymentMethod = 'paystack' | 'stripe' | 'bank_transfer';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type InventoryChangeType = 'sale' | 'restock' | 'adjustment' | 'return';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  gender: Gender;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  gender: Gender;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size: string | null;
  color: string | null;
  color_hex: string | null;
  material: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
}

export interface Address {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code?: string;
  country: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  tracking_id: string;
  status: OrderStatus;
  email: string;
  phone: string | null;
  shipping_address: Address;
  billing_address: Address | null;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  payment_provider: string | null;
  transaction_id: string | null;
  status: PaymentStatus;
  amount: number;
  currency: string;
  metadata: Record<string, any> | null;
  verified_at: string | null;
  created_at: string;
}

export interface InventoryLog {
  id: string;
  variant_id: string;
  change_type: InventoryChangeType;
  quantity_change: number;
  quantity_after: number;
  reason: string | null;
  admin_id: string | null;
  order_id: string | null;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  created_at: string;
}

export interface RestockNotification {
  id: string;
  email: string;
  variant_id: string;
  notified: boolean;
  notified_at: string | null;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface ProductWithDetails extends Product {
  category: Category | null;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface OrderWithDetails extends Order {
  items: (OrderItem & {
    product: Product;
    variant: ProductVariant;
  })[];
  payment: Payment | null;
}

export interface CartItem {
  variant_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
  variant?: ProductVariant;
}
