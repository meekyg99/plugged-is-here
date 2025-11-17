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

-   **Users** (admin + customers)
-   **Products**
-   **Product Variants**
-   **Product Images**
-   **Categories**
-   **Orders**
-   **Order Items**
-   **Payments**
-   **Inventory Logs**
-   **Notifications (Notify Me)**
-   **Banners / CMS**
-   **Audit Logs**

### 5.2 Key Relationships

-   Product → Variants (1-to-many)
-   Variant → Images (1-to-many)
-   Order → Order Items (1-to-many)
-   User → Orders (1-to-many)

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

## 9. Testing Requirements

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

## v1.2.0 --- Future Roadmap

### Planned

-   Automated abandoned cart recovery.
-   Gift cards and discount system.
-   Advanced loyalty points.
-   Multiple warehouse inventory routing.

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
