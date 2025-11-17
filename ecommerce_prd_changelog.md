# Nigerian Fashion E-Commerce Store

## Product Requirements Document (PRD)

------------------------------------------------------------------------

## 1. Overview

A fully functional Nigerian fashion e-commerce platform. The frontend
already exists; this PRD documents the backend admin system, database
requirements, admin dashboards, security, platform features, checkout,
and operational workflows.

------------------------------------------------------------------------

## 2. Objectives

-   Provide a stable backend infrastructure for managing products,
    inventory, orders, customers, and site content.
-   Ensure secure, fast, and seamless shopping and checkout experiences.
-   Support Nigerian users with Paystack and bank transfer options, and
    international users with Stripe.
-   Deliver an easily maintainable admin system with complete oversight
    of store operations.

------------------------------------------------------------------------

## 3. Core Features

### 3.1 Storefront Features

-   Responsive design optimized for all devices.
-   Product listings with variants (size, color, style, price).
-   Multiple product images per variant.
-   Product filters: category, gender, price range, color, size.
-   Wishlist + "Notify Me" for restock or featured products.
-   SEO-friendly pages with editable metadata.
-   Fast browsing with caching and CDN support.

### 3.2 Checkout Flow

-   Best-practice single-page checkout.
-   Guest checkout + optional account creation.
-   Address auto-completion (basic, no external API required).
-   Shipping method selection.
-   Payment methods:
    -   Paystack (cards, bank transfer).
    -   Nigerian direct bank transfer (manual confirmation flow).
    -   Stripe for international users.
-   Post-order success page with receipt.
-   Order confirmation email.

### 3.3 Payment Handling

-   Secure payment tokenization via providers.
-   Server-side verification of all transactions.
-   Automatic order status updates after confirmation.
-   Manual verification for bank transfer.

------------------------------------------------------------------------

## 4. Admin Dashboard

A secure, role-based dashboard for managing all store operations.

### 4.1 User & Role Management

-   Admin roles: Super Admin, Manager, Support.
-   Permissions per role: view/edit restrictions.
-   Admin activity logs.

### 4.2 Product Management

-   Create, edit, delete products.
-   Variant management: size, color, material, price.
-   Upload multiple images.
-   Inventory per variant.
-   Bulk upload via CSV.
-   SEO fields: title, description, alt tags.

### 4.3 Order Management

-   View all orders with filters.
-   Order status updates: Pending → Processing → Shipped → Delivered →
    Cancelled.
-   Refund and return tracking.
-   Payment verification logs.
-   Customer notes.

### 4.4 Inventory Management

-   Automatic stock reduction on purchase.
-   Low-stock alerts.
-   Stock transfer or adjustment features.

### 4.5 Customer Management

-   View customers and profiles.
-   View order history.
-   Manual account suspension.

### 4.6 Content & SEO Tools

-   Manage homepage banners.
-   Featured products.
-   Blog posts.
-   Editable SEO metadata.

### 4.7 Reporting & Analytics

-   Sales reports (daily/weekly/monthly).
-   Inventory movement report.
-   Top products report.
-   Customer acquisition data.

------------------------------------------------------------------------

## 5. Database Requirements

### 5.1 Main Tables

#### Users Table
-   `id` (UUID, primary key)
-   `email` (unique, not null)
-   `password_hash` (not null)
-   `role` (enum: customer, support, manager, super_admin)
-   `first_name`, `last_name`
-   `phone_number`
-   `is_active` (boolean, default true)
-   `email_verified` (boolean)
-   `last_login_at` (timestamp)
-   `created_at`, `updated_at`

#### Products Table
-   `id` (UUID, primary key)
-   `name` (not null)
-   `slug` (unique, not null)
-   `description` (text)
-   `category_id` (foreign key)
-   `gender` (enum: male, female, unisex)
-   `is_featured` (boolean)
-   `is_active` (boolean)
-   `seo_title`, `seo_description`, `seo_keywords`
-   `created_at`, `updated_at`

#### Product Variants Table
-   `id` (UUID, primary key)
-   `product_id` (foreign key)
-   `sku` (unique, not null)
-   `size` (varchar)
-   `color` (varchar)
-   `material` (varchar)
-   `price` (decimal, not null)
-   `compare_at_price` (decimal, nullable)
-   `stock_quantity` (integer, default 0)
-   `low_stock_threshold` (integer, default 5)
-   `weight` (decimal)
-   `is_active` (boolean)
-   `created_at`, `updated_at`

#### Product Images Table
-   `id` (UUID, primary key)
-   `variant_id` (foreign key)
-   `image_url` (not null)
-   `alt_text` (varchar)
-   `display_order` (integer)
-   `created_at`

#### Categories Table
-   `id` (UUID, primary key)
-   `name` (not null)
-   `slug` (unique, not null)
-   `description` (text)
-   `parent_category_id` (foreign key, nullable)
-   `display_order` (integer)
-   `is_active` (boolean)
-   `created_at`, `updated_at`

#### Orders Table
-   `id` (UUID, primary key)
-   `user_id` (foreign key, nullable for guest checkout)
-   `order_number` (unique, not null)
-   `status` (enum: pending, processing, shipped, delivered, cancelled, refunded)
-   `subtotal` (decimal, not null)
-   `shipping_cost` (decimal)
-   `tax` (decimal)
-   `discount` (decimal)
-   `total` (decimal, not null)
-   `currency` (varchar, default NGN)
-   `shipping_address` (jsonb)
-   `billing_address` (jsonb)
-   `shipping_method` (varchar)
-   `customer_email` (not null)
-   `customer_phone` (not null)
-   `customer_notes` (text)
-   `admin_notes` (text)
-   `shipped_at`, `delivered_at`, `cancelled_at`
-   `created_at`, `updated_at`

#### Order Items Table
-   `id` (UUID, primary key)
-   `order_id` (foreign key)
-   `variant_id` (foreign key)
-   `product_name` (snapshot)
-   `variant_details` (jsonb snapshot)
-   `quantity` (integer, not null)
-   `unit_price` (decimal, not null)
-   `total_price` (decimal, not null)
-   `created_at`

#### Payments Table
-   `id` (UUID, primary key)
-   `order_id` (foreign key)
-   `payment_method` (enum: paystack, stripe, bank_transfer)
-   `provider_reference` (varchar)
-   `amount` (decimal, not null)
-   `currency` (varchar)
-   `status` (enum: pending, completed, failed, refunded)
-   `payment_data` (jsonb for provider response)
-   `verified_at` (timestamp)
-   `created_at`, `updated_at`

#### Inventory Logs Table
-   `id` (UUID, primary key)
-   `variant_id` (foreign key)
-   `change_type` (enum: sale, restock, adjustment, return)
-   `quantity_change` (integer)
-   `previous_quantity` (integer)
-   `new_quantity` (integer)
-   `reference_id` (UUID, nullable - links to order/adjustment)
-   `notes` (text)
-   `created_by` (foreign key to users)
-   `created_at`

#### Notify Me Table
-   `id` (UUID, primary key)
-   `variant_id` (foreign key)
-   `email` (not null)
-   `user_id` (foreign key, nullable)
-   `notified` (boolean, default false)
-   `notified_at` (timestamp)
-   `created_at`

#### Banners Table
-   `id` (UUID, primary key)
-   `title` (not null)
-   `image_url` (not null)
-   `link_url` (varchar)
-   `display_order` (integer)
-   `is_active` (boolean)
-   `start_date`, `end_date` (timestamps)
-   `created_at`, `updated_at`

#### Audit Logs Table
-   `id` (UUID, primary key)
-   `user_id` (foreign key)
-   `action` (varchar, not null)
-   `entity_type` (varchar)
-   `entity_id` (UUID)
-   `changes` (jsonb)
-   `ip_address` (varchar)
-   `user_agent` (text)
-   `created_at`

#### Wishlists Table
-   `id` (UUID, primary key)
-   `user_id` (foreign key)
-   `variant_id` (foreign key)
-   `created_at`
-   Unique constraint on (user_id, variant_id)

### 5.2 Key Relationships

-   Product → Variants (1-to-many)
-   Variant → Images (1-to-many)
-   Order → Order Items (1-to-many)
-   Order → Payments (1-to-many)
-   User → Orders (1-to-many)
-   User → Wishlists (1-to-many)
-   Category → Products (1-to-many)
-   Category → Categories (self-referential for hierarchy)
-   Variant → Inventory Logs (1-to-many)
-   Variant → Notify Me (1-to-many)

### 5.3 Indexes

-   Products: `slug`, `category_id`, `is_featured`, `is_active`
-   Variants: `product_id`, `sku`, `stock_quantity`
-   Orders: `user_id`, `order_number`, `status`, `created_at`
-   Order Items: `order_id`, `variant_id`
-   Payments: `order_id`, `status`, `provider_reference`
-   Inventory Logs: `variant_id`, `created_at`
-   Audit Logs: `user_id`, `entity_type`, `entity_id`, `created_at`

------------------------------------------------------------------------

## 6. Security Requirements

-   JWT or OAuth-based authentication.
-   Strong password hashing (bcrypt/argon2).
-   Admin 2FA (email or authenticator app).
-   SQL injection, XSS, CSRF protections.
-   Secure session cookies.
-   Rate limiting for login attempts.
-   Transaction verification with payment providers.
-   Role-based access control (RBAC).
-   Encrypted sensitive fields.

------------------------------------------------------------------------

## 7. Performance & Scalability

-   Caching for product listings.
-   CDN for images.
-   Database indexing.
-   Background workers for notifications and emails.
-   Lazy loading for images.
-   Queue for processing large uploads.

------------------------------------------------------------------------

## 8. Notifications System

-   Restock notifications.
-   Order emails: confirmation, shipped, delivered.
-   Admin alerts: low stock, failed payments.

------------------------------------------------------------------------

## 9. API Endpoints Specification

### 9.1 Public Storefront API

#### Products
-   `GET /api/products` - List products with filters (pagination, category, gender, price range, search)
-   `GET /api/products/:slug` - Get product details with variants and images
-   `GET /api/categories` - List all active categories
-   `GET /api/categories/:slug` - Get category details and products

#### Cart & Checkout
-   `POST /api/cart/add` - Add item to cart (session-based or user-based)
-   `GET /api/cart` - Get cart contents
-   `PUT /api/cart/update` - Update cart item quantity
-   `DELETE /api/cart/remove/:item_id` - Remove item from cart
-   `POST /api/checkout/validate` - Validate cart and shipping details
-   `POST /api/checkout/create-order` - Create order (returns payment intent)
-   `POST /api/checkout/confirm-payment` - Confirm payment completion

#### User Account
-   `POST /api/auth/register` - Register new user
-   `POST /api/auth/login` - User login
-   `POST /api/auth/logout` - User logout
-   `POST /api/auth/forgot-password` - Request password reset
-   `POST /api/auth/reset-password` - Reset password with token
-   `GET /api/user/profile` - Get user profile
-   `PUT /api/user/profile` - Update user profile
-   `GET /api/user/orders` - Get user order history
-   `GET /api/user/orders/:id` - Get order details

#### Wishlist & Notifications
-   `POST /api/wishlist/add` - Add to wishlist
-   `GET /api/wishlist` - Get user wishlist
-   `DELETE /api/wishlist/remove/:variant_id` - Remove from wishlist
-   `POST /api/notify-me` - Subscribe to restock notification

#### Content
-   `GET /api/banners` - Get active banners
-   `POST /api/newsletter/subscribe` - Subscribe to newsletter

### 9.2 Admin API

#### Authentication & Users
-   `POST /api/admin/auth/login` - Admin login with 2FA
-   `POST /api/admin/auth/verify-2fa` - Verify 2FA code
-   `GET /api/admin/users` - List all users with filters
-   `PUT /api/admin/users/:id` - Update user details
-   `POST /api/admin/users/:id/suspend` - Suspend user account

#### Product Management
-   `POST /api/admin/products` - Create product
-   `PUT /api/admin/products/:id` - Update product
-   `DELETE /api/admin/products/:id` - Delete product
-   `POST /api/admin/products/:id/variants` - Add variant
-   `PUT /api/admin/variants/:id` - Update variant
-   `DELETE /api/admin/variants/:id` - Delete variant
-   `POST /api/admin/variants/:id/images` - Upload images
-   `DELETE /api/admin/images/:id` - Delete image
-   `POST /api/admin/products/bulk-upload` - Bulk product upload via CSV

#### Order Management
-   `GET /api/admin/orders` - List all orders with filters
-   `GET /api/admin/orders/:id` - Get order details
-   `PUT /api/admin/orders/:id/status` - Update order status
-   `POST /api/admin/orders/:id/refund` - Process refund
-   `PUT /api/admin/orders/:id/notes` - Add admin notes

#### Inventory Management
-   `GET /api/admin/inventory` - List inventory with low-stock alerts
-   `POST /api/admin/inventory/adjust` - Manual stock adjustment
-   `GET /api/admin/inventory/logs` - Get inventory change logs

#### Content & SEO
-   `POST /api/admin/banners` - Create banner
-   `PUT /api/admin/banners/:id` - Update banner
-   `DELETE /api/admin/banners/:id` - Delete banner
-   `PUT /api/admin/products/:id/seo` - Update product SEO

#### Reports & Analytics
-   `GET /api/admin/reports/sales` - Sales report with date range
-   `GET /api/admin/reports/inventory` - Inventory movement report
-   `GET /api/admin/reports/top-products` - Top selling products
-   `GET /api/admin/reports/customers` - Customer acquisition data

#### Audit & Activity
-   `GET /api/admin/audit-logs` - View audit logs with filters

### 9.3 Webhook Endpoints

-   `POST /api/webhooks/paystack` - Paystack payment webhook
-   `POST /api/webhooks/stripe` - Stripe payment webhook

------------------------------------------------------------------------

## 10. Deployment & Infrastructure

### 10.1 Hosting Requirements

-   **Frontend**: Static hosting (Vercel, Netlify, Cloudflare Pages)
-   **Backend**: Serverless or container-based (Supabase Edge Functions, AWS Lambda, or VPS)
-   **Database**: Managed PostgreSQL (Supabase, AWS RDS, or DigitalOcean)
-   **File Storage**: CDN-backed object storage (Supabase Storage, AWS S3, Cloudflare R2)
-   **Email Service**: Transactional email provider (Resend, SendGrid, AWS SES)

### 10.2 Environment Configuration

#### Required Environment Variables
-   `DATABASE_URL` - PostgreSQL connection string
-   `SUPABASE_URL` and `SUPABASE_ANON_KEY` - Supabase credentials
-   `JWT_SECRET` - Authentication token secret
-   `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` - Paystack credentials
-   `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` - Stripe credentials
-   `EMAIL_SERVICE_API_KEY` - Email provider credentials
-   `CDN_URL` - CDN base URL for images
-   `ADMIN_2FA_SECRET` - 2FA encryption key

### 10.3 CI/CD Pipeline

-   Automated testing on pull requests
-   Staging environment for pre-production testing
-   Database migration scripts run automatically
-   Zero-downtime deployments
-   Automated rollback on failure
-   Environment-specific configuration management

### 10.4 Monitoring & Logging

-   Application performance monitoring (APM)
-   Error tracking and alerting (Sentry, LogRocket)
-   Database query performance monitoring
-   Payment transaction logs
-   Admin activity monitoring
-   Uptime monitoring and alerts

### 10.5 Backup & Disaster Recovery

-   Automated daily database backups
-   Point-in-time recovery capability
-   File storage redundancy
-   Database replication for high availability
-   Disaster recovery plan with RTO/RPO targets

------------------------------------------------------------------------

## 11. Success Metrics & KPIs

### 11.1 Business Metrics

-   **Conversion Rate**: Percentage of visitors who complete a purchase (Target: 2-5%)
-   **Average Order Value (AOV)**: Average total per order (Target: track and optimize)
-   **Cart Abandonment Rate**: Percentage of carts not completed (Target: <70%)
-   **Customer Lifetime Value (CLV)**: Total revenue per customer over time
-   **Repeat Purchase Rate**: Percentage of customers making multiple purchases (Target: >20%)
-   **Revenue Growth**: Month-over-month and year-over-year growth

### 11.2 Technical Metrics

-   **Page Load Time**: Time to interactive for key pages (Target: <3 seconds)
-   **API Response Time**: Average API latency (Target: <500ms)
-   **Uptime**: System availability (Target: 99.9%)
-   **Error Rate**: Percentage of failed requests (Target: <0.1%)
-   **Payment Success Rate**: Successful transactions vs. attempts (Target: >95%)
-   **Database Query Performance**: Average query execution time

### 11.3 User Experience Metrics

-   **Bounce Rate**: Percentage of single-page visits (Target: <60%)
-   **Time on Site**: Average session duration
-   **Pages per Session**: Average pages viewed per visit
-   **Checkout Completion Time**: Time from cart to order confirmation
-   **Mobile vs. Desktop Conversion**: Conversion rate by device type
-   **Search Success Rate**: Percentage of searches leading to product views

### 11.4 Operational Metrics

-   **Order Processing Time**: Time from order to shipment
-   **Customer Support Tickets**: Volume and resolution time
-   **Inventory Turnover**: Rate at which inventory is sold
-   **Return Rate**: Percentage of orders returned
-   **Low Stock Incidents**: Frequency of out-of-stock situations

------------------------------------------------------------------------

## 12. Testing Requirements

-   Unit tests for backend services.
-   Integration tests for checkout.
-   Security and penetration testing.
-   Load testing on checkout and product pages.

------------------------------------------------------------------------

# CHANGE LOG (Markdown)

## v1.0.0 --- Initial Release

### Added

-   Full PRD for Nigerian fashion e-commerce backend.
-   Definition of admin dashboard modules.
-   Checkout flow with Paystack, Stripe, and bank transfer.
-   Inventory, order, customer, and product management.
-   Security standards (JWT, RBAC, hashing).
-   SEO and content management sections.
-   Database schema overview.

------------------------------------------------------------------------

## v1.1.0 --- Enhancements

### Updated

-   Improved product variant modeling.
-   Added restock notification system.
-   Clarified reporting and analytics requirements.

------------------------------------------------------------------------

## v1.2.0 --- Detailed Specifications

### Added

-   Complete database schema with all field specifications and data types.
-   Comprehensive API endpoints specification for storefront and admin.
-   Deployment and infrastructure requirements.
-   Success metrics and KPIs across business, technical, UX, and operational dimensions.
-   Webhook endpoints specification for payment providers.
-   Environment configuration details.
-   CI/CD pipeline requirements.
-   Monitoring, logging, and disaster recovery specifications.

--------------------------------------------------------------------------

## v2.0.0 --- Future Roadmap

### Planned

-   Automated abandoned cart recovery.
-   Gift cards and discount system.
-   Advanced loyalty points.
-   Multiple warehouse inventory routing.
-   Mobile app (iOS/Android).
-   Advanced search with filters and sorting.
-   Product reviews and ratings system.
-   Social media integration for sharing.

--------------------------------------------------------------------------

## Implementation Alignment (Nov 17, 2025)

To keep delivery synchronized across teams, we will start execution with the following phased plan:

1. **Shared Domain Layer**
    - Introduce TypeScript domain models, enums, and mocked services in `src/domain` for products, variants, orders, payments, users, inventory logs, and notifications.
    - These contracts unblock parallel frontend/backend work and ensure naming consistency early.

2. **Checkout & Cart Experience**
    - Build the single-page checkout wizard (cart → address → shipping → payment) with validation, Paystack/Stripe placeholders, and Nigerian bank-transfer confirmation UI.
    - Include order review/success states plus hooks for confirmation emails per the PRD.

3. **Admin Shell & RBAC**
    - Scaffold the admin dashboard with routed sections for Products, Orders, Inventory, Customers, Content/SEO, and Reports.
    - Implement role guards (Super Admin/Manager/Support) and placeholder actions for stock adjustments, refunds, and workflow notes.

4. **Engagement Features**
    - Wire wishlist and "Notify Me" widgets on catalog/detail views, plus admin tooling for restock notifications.
    - Extend Newsletter + notification pipelines so messaging ties back to customer preferences.

5. **Testing & Tooling**
    - Configure Vitest + React Testing Library for checkout calculations, cart state, and admin flows.
    - Add component preview tooling (Storybook/Ladle) to accelerate QA for high-traffic UI such as checkout and dashboard tables.

This alignment section should be updated as milestones close so product, design, and engineering share a single source of truth before implementation begins.
