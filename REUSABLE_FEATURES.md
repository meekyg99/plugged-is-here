# Reusable E-Commerce Features & Policies

This document captures all the features, policies, and configurations implemented in Baymal Shop that can be reused for other e-commerce projects.

---

## 📧 Email System

### Resend Integration
- **Service**: Resend.com
- **Configuration**:
  - Domain verification required
  - API key stored in Supabase Edge Function secrets
  - Sender email: `orders@baymal.shop`

### Email Templates Implemented

1. **Order Confirmation**
   - Triggered: After successful payment
   - Includes: Order details, items, total, tracking number
   - Template: `supabase/functions/send-order-email/templates/orderConfirmation.ts`

2. **Order Status Updates**
   - **Processing**: Order received and being prepared
   - **Shipped**: Order dispatched with tracking info
   - **Delivered**: Order completed
   - **Cancelled**: Order cancelled with reason
   - Templates: `supabase/functions/send-order-email/templates/*.ts`

3. **Welcome Email**
   - Triggered: New user registration
   - Purpose: Email verification
   - Configured in Supabase Auth settings

---

## 🔐 Authentication & Authorization

### Supabase Auth Configuration
- Email/Password authentication
- Email verification required
- Custom email templates with brand colors
- Redirect to correct domain after verification

### Row-Level Security (RLS) Policies

#### User Profiles
```sql
-- Users can view own profile
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
FOR SELECT USING (is_admin = true);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON user_profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

#### Products
```sql
-- Everyone can view active products
CREATE POLICY "Anyone can view products" ON products
FOR SELECT USING (true);

-- Admins can insert products
CREATE POLICY "Admins can insert products" ON products
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Admins can update products
CREATE POLICY "Admins can update products" ON products
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Admins can delete products
CREATE POLICY "Admins can delete products" ON products
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

#### Orders
```sql
-- Users can view own orders
CREATE POLICY "Users can view own orders" ON orders
FOR SELECT USING (user_id = auth.uid());

-- Users can insert own orders
CREATE POLICY "Users can insert own orders" ON orders
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all orders
CREATE POLICY "Admins view all orders" ON orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Admins can update all orders
CREATE POLICY "Admins manage all orders" ON orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

#### Cart
```sql
-- Users can manage own cart
CREATE POLICY "Users can view own cart" ON cart
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cart items" ON cart
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cart" ON cart
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own cart items" ON cart
FOR DELETE USING (user_id = auth.uid());
```

#### Reviews
```sql
-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews" ON reviews
FOR SELECT USING (status = 'approved');

-- Users can insert reviews for own purchases
CREATE POLICY "Users can create reviews" ON reviews
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update own reviews
CREATE POLICY "Users can update own reviews" ON reviews
FOR UPDATE USING (user_id = auth.uid());

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews" ON reviews
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

---

## 💳 Payment Integration

### Paystack Configuration
- **Test Mode**: For development
- **Production Mode**: For live transactions
- **Configuration**:
  - Public key stored in environment variables
  - Secret key stored securely in Supabase Edge Functions
  - Webhook endpoint for payment verification

### Payment Flow
1. User initiates checkout
2. Paystack popup opens
3. User completes payment
4. Payment verified via Paystack API
5. Order created in database
6. Inventory updated
7. Confirmation email sent

---

## 📦 Inventory Management

### Automatic Inventory Updates
- **On Order**: Reduce product quantity
- **On Cancellation**: Restore product quantity
- **Low Stock Warning**: Alert when quantity < 5
- **Out of Stock**: Prevent orders when quantity = 0

### Database Constraint
```sql
ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));
```

---

## 🎯 SEO Optimization

### Schema Markup Implemented

1. **Organization Schema**
   - Located in: `src/components/schemas/OrganizationSchema.tsx`
   - Type: `Organization`
   - Includes: Logo, contact info, social media

2. **Product Schema**
   - Located in: `src/components/schemas/ProductSchema.tsx`
   - Type: `Product`
   - Includes: Name, description, price, images, reviews

3. **Breadcrumb Schema**
   - Located in: `src/components/schemas/BreadcrumbSchema.tsx`
   - Type: `BreadcrumbList`
   - Dynamic navigation trail

4. **Website Schema**
   - Located in: `src/components/schemas/WebsiteSchema.tsx`
   - Type: `WebSite`
   - Search action integration

### Meta Tags
- Dynamic title and description per page
- Open Graph tags for social sharing
- Twitter Card tags
- Canonical URLs
- Mobile viewport optimization

### Performance Optimizations
- Image lazy loading
- Code splitting
- CDN usage for assets
- Minification and compression

---

## 🚚 Order Tracking System

### Tracking Number Generation
- Format: `BAYM-{timestamp}-{random}`
- Unique per order
- User-facing tracking page at `/track-order`

### Order Status Flow
1. **Pending**: Order placed, payment pending
2. **Processing**: Payment confirmed, preparing order
3. **Shipped**: Order dispatched, tracking active
4. **Delivered**: Order received by customer
5. **Cancelled**: Order cancelled (refund if applicable)

### Real-time Status Updates
- Admin updates status in dashboard
- User sees status on order page
- Email notification sent on each status change
- Tracking number clickable and searchable

---

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Touch-friendly interface
- Optimized images for different screen sizes

### User Feedback
- Loading states on all async operations
- Success/error notifications (toast messages)
- Form validation with clear error messages
- Confirmation dialogs for destructive actions

### Cart Management
- Persistent cart (stored in database for logged-in users)
- Real-time quantity updates
- Stock availability checks
- Price calculations with complimentary items

---

## 🔒 Security Features

### Input Validation
- Client-side validation with Zod schemas
- Server-side validation in Edge Functions
- SQL injection prevention via Supabase client
- XSS prevention via React's built-in escaping

### API Security
- Environment variables for sensitive keys
- Edge Functions for server-side operations
- Rate limiting on API endpoints
- CORS configuration

### User Data Protection
- Password hashing via Supabase Auth
- Secure session management
- HTTPS enforcement
- Email verification required

---

## 📊 Admin Dashboard Features

### Order Management
- View all orders with filters
- Update order status
- View customer details
- Send status update emails

### Product Management
- Add/edit/delete products
- Manage inventory
- Set complimentary items
- Upload product images

### Customer Management
- View all customers
- View order history per customer
- Admin role assignment

### Analytics (Planned)
- Sales reports
- Popular products
- Customer insights
- Revenue tracking

---

## 🌐 Deployment Configuration

### Vercel Setup
1. Connect GitHub repository
2. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PAYSTACK_PUBLIC_KEY`
   - `VITE_SITE_URL`
3. Build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

### Supabase Configuration
1. Database tables with RLS policies
2. Edge Functions deployed:
   - `send-order-email`
   - `verify-payment`
3. Environment secrets:
   - `RESEND_API_KEY`
   - `PAYSTACK_SECRET_KEY`
4. Auth settings with custom templates

---

## 📝 Content Policies

### Privacy Policy
- Data collection transparency
- User rights (access, deletion, correction)
- Cookie usage disclosure
- Third-party service disclosure (Paystack, Supabase)

### Terms of Service
- User responsibilities
- Service availability disclaimer
- Intellectual property rights
- Dispute resolution

### Shipping & Delivery Policy
- Delivery timeframes
- Shipping costs
- Delivery restrictions
- Lost package procedures

---

## 🔄 Replication Steps for New Project

### 1. Database Setup
```sql
-- Run schema.sql to create all tables
-- Apply RLS policies from this document
-- Set up triggers for inventory management
```

### 2. Authentication
- Enable Email provider in Supabase Auth
- Configure email templates with brand colors
- Set redirect URLs for your domain

### 3. Edge Functions
- Deploy `send-order-email` function
- Configure Resend API key
- Update email templates with your branding

### 4. Payment Integration
- Sign up for Paystack account
- Configure webhook URL
- Add public/secret keys to environment

### 5. Frontend Setup
- Clone repository structure
- Update branding (colors, logo, name)
- Configure environment variables
- Update SEO schemas with your business info

### 6. Deployment
- Connect to Vercel
- Configure custom domain
- Set up DNS records
- Enable HTTPS

---

## 📦 Key Dependencies

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Supabase JS Client
- React Paystack

### Backend
- Supabase (Database, Auth, Edge Functions)
- Resend (Email service)
- Paystack (Payment processing)

---

## 🎯 Best Practices Applied

1. **Code Organization**
   - Component-based architecture
   - Separated concerns (UI, logic, data)
   - Reusable hooks and utilities
   - Type safety with TypeScript

2. **Performance**
   - Lazy loading
   - Optimistic updates
   - Caching strategies
   - Image optimization

3. **Accessibility**
   - Semantic HTML
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

4. **Testing**
   - Use Paystack test keys for development
   - Test all order statuses
   - Verify email delivery
   - Check responsive design

---

## 📞 Support & Maintenance

### Monitoring
- Set up error tracking (e.g., Sentry)
- Monitor API usage and costs
- Track email delivery rates
- Monitor payment success rates

### Regular Updates
- Keep dependencies updated
- Review and update policies
- Monitor security advisories
- Backup database regularly

---

## 🔗 Quick Reference Links

- **Supabase Docs**: https://supabase.com/docs
- **Resend Docs**: https://resend.com/docs
- **Paystack Docs**: https://paystack.com/docs
- **Schema.org**: https://schema.org
- **Vercel Docs**: https://vercel.com/docs

---

**Last Updated**: November 2024  
**Project**: Baymal Shop  
**Version**: 1.0.0
