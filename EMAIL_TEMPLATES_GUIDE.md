# Email Templates System Guide

## Overview
This guide covers the comprehensive email notification system for the Plugged e-commerce platform. All emails are sent via Resend API with beautiful, branded HTML templates.

## Table of Contents
1. [Email Templates Available](#email-templates-available)
2. [Setup Instructions](#setup-instructions)
3. [Usage Examples](#usage-examples)
4. [Template Customization](#template-customization)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Email Templates Available

### 1. **Welcome Email** (`sendWelcomeEmail`)
- **Trigger**: User completes registration
- **Purpose**: Welcome new customers and introduce brand benefits
- **Contents**:
  - Personalized greeting
  - List of platform features and benefits
  - Call-to-action button to start shopping
  - Support information

### 2. **Order Confirmation** (`sendOrderConfirmationEmail`)
- **Trigger**: Order is successfully placed
- **Purpose**: Confirm order details and payment receipt
- **Contents**:
  - Order number and date
  - Complete list of items with images, quantities, and prices
  - Subtotal, shipping, and total amounts
  - Shipping address details
  - Track order button
  - Expected processing timeline

### 3. **Order Processing** (`sendOrderProcessingEmail`)
- **Trigger**: Order status changes to "Processing"
- **Purpose**: Notify customer that order is being prepared
- **Contents**:
  - Current order status
  - Estimated processing time (1-2 business days)
  - Reassurance about packaging quality
  - Link to view order details

### 4. **Order Shipped** (`sendOrderShippedEmail`)
- **Trigger**: Order status changes to "Shipped"
- **Purpose**: Provide shipping confirmation and tracking info
- **Contents**:
  - Shipping confirmation
  - Tracking number (if available)
  - Carrier name (if available)
  - Estimated delivery date (3-5 business days)
  - Track package button
  - Delivery support information

### 5. **Order Delivered** (`sendOrderDeliveredEmail`)
- **Trigger**: Order status changes to "Delivered"
- **Purpose**: Confirm delivery and request feedback
- **Contents**:
  - Delivery confirmation
  - Delivery date
  - Call-to-action to leave a review
  - Support information for issues
  - 7-day issue reporting window

### 6. **Password Reset** (`sendPasswordResetEmail`)
- **Trigger**: User requests password reset
- **Purpose**: Provide secure password reset link
- **Contents**:
  - Password reset button
  - Copy-paste fallback link
  - 1-hour expiration notice
  - Security disclaimer
  - Support contact if not requested

### 7. **Low Stock Alert** (`sendLowStockAlertEmail`)
- **Trigger**: Product inventory falls below threshold (Admin only)
- **Purpose**: Alert admin team to restock products
- **Contents**:
  - List of low-stock products
  - Current stock levels
  - Stock thresholds
  - Link to inventory management
  - Urgent action required notice

### 8. **Admin OTP** (existing, in `AdminLogin.tsx`)
- **Trigger**: Admin login attempt
- **Purpose**: Provide 2FA verification code
- **Contents**:
  - 6-digit OTP code
  - 5-minute expiration notice
  - Security tips
  - Support contact

---

## Setup Instructions

### Step 1: Get Resend API Key
1. Go to [https://resend.com](https://resend.com)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Name it (e.g., "Plugged Production")
6. Copy the API key (starts with `re_`)

### Step 2: Domain Verification (Production Only)
1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain: `pluggedby212.shop`
4. Add the DNS records provided by Resend to your domain registrar:
   - **TXT record** for domain verification
   - **CNAME records** for email sending
5. Wait for verification (usually 5-30 minutes)
6. Once verified, you can send from `noreply@pluggedby212.shop`

**Note**: For testing, you can use `onboarding@resend.dev` without verification.

### Step 3: Configure Environment Variables
Add these to your `.env` file:

```env
# Resend Configuration
VITE_RESEND_API_KEY=re_your_actual_api_key_here
VITE_EMAIL_FROM_ADDRESS=Plugged <noreply@pluggedby212.shop>
```

### Step 4: Test Email Delivery
```typescript
import { sendWelcomeEmail } from './lib/emailService';

// Test the welcome email
await sendWelcomeEmail('your-test-email@example.com', 'Test User');
```

---

## Usage Examples

### Example 1: Send Welcome Email After Registration
```typescript
// In your registration handler
import { sendWelcomeEmail } from '@/lib/emailService';

async function handleRegistration(email: string, firstName: string) {
  // ... create user in database ...
  
  // Send welcome email
  await sendWelcomeEmail(email, firstName);
}
```

### Example 2: Send Order Confirmation After Checkout
```typescript
import { sendOrderConfirmationEmail } from '@/lib/emailService';

async function handleOrderCreation(order: Order) {
  const orderDetails = {
    items: order.items.map(item => ({
      name: item.product_name,
      quantity: item.quantity,
      price: item.unit_price,
      image: item.image_url,
    })),
    subtotal: order.subtotal,
    shipping: order.shipping_cost,
    total: order.total,
    shippingAddress: {
      name: order.customer_name,
      address: order.shipping_address.street,
      city: order.shipping_address.city,
      state: order.shipping_address.state,
      phone: order.customer_phone,
    },
  };

  await sendOrderConfirmationEmail(
    order.customer_email,
    order.order_number,
    orderDetails
  );
}
```

### Example 3: Send Order Status Updates
```typescript
import {
  sendOrderProcessingEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
} from '@/lib/emailService';

async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  trackingInfo?: { number: string; carrier: string }
) {
  const order = await getOrder(orderId);

  switch (newStatus) {
    case 'processing':
      await sendOrderProcessingEmail(
        order.customer_email,
        order.order_number,
        order.customer_name
      );
      break;

    case 'shipped':
      await sendOrderShippedEmail(
        order.customer_email,
        order.order_number,
        order.customer_name,
        trackingInfo?.number,
        trackingInfo?.carrier
      );
      break;

    case 'delivered':
      await sendOrderDeliveredEmail(
        order.customer_email,
        order.order_number,
        order.customer_name
      );
      break;
  }
}
```

### Example 4: Password Reset Flow
```typescript
import { sendPasswordResetEmail } from '@/lib/emailService';
import crypto from 'crypto';

async function requestPasswordReset(email: string) {
  // Generate secure reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Store token in database with expiration (1 hour)
  await storeResetToken(email, resetToken, Date.now() + 3600000);
  
  // Get user info
  const user = await getUserByEmail(email);
  
  // Send reset email
  await sendPasswordResetEmail(email, resetToken, user?.first_name);
}
```

### Example 5: Low Stock Alert (Automated)
```typescript
import { sendLowStockAlertEmail } from '@/lib/emailService';

// Run this as a daily cron job
async function checkInventoryLevels() {
  const lowStockProducts = await supabase
    .from('product_variants')
    .select('name, sku, stock_quantity, low_stock_threshold')
    .lt('stock_quantity', supabase.raw('low_stock_threshold'));

  if (lowStockProducts.data && lowStockProducts.data.length > 0) {
    const adminEmail = 'admin@pluggedby212.shop';
    
    await sendLowStockAlertEmail(
      adminEmail,
      lowStockProducts.data.map(p => ({
        name: p.name,
        sku: p.sku,
        currentStock: p.stock_quantity,
        threshold: p.low_stock_threshold,
      }))
    );
  }
}
```

---

## Template Customization

### Modify Brand Settings
Edit `src/lib/emailService.ts`:

```typescript
const BRAND_NAME = 'Plugged'; // Your brand name
const BRAND_COLOR = '#000000'; // Primary brand color (hex)
const WEBSITE_URL = 'https://pluggedby212.shop'; // Your website URL
```

### Customize Email Templates
Each email function accepts parameters and returns formatted HTML. To customize:

1. **Edit content**: Modify the `content` variable in each function
2. **Update styling**: Edit the `<style>` section in `emailTemplate()`
3. **Add new sections**: Use HTML with inline styles

Example - Add a promo banner to welcome email:
```typescript
const content = `
  <h2>Welcome to ${BRAND_NAME}! 🎉</h2>
  <p>Hi ${firstName},</p>
  
  <!-- NEW: Promo Banner -->
  <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0; font-weight: bold; color: #856404;">
      🎁 SPECIAL OFFER: Get 10% off your first order with code WELCOME10
    </p>
  </div>
  
  <p>Thank you for joining ${BRAND_NAME}!...</p>
`;
```

### Add Social Media Links
In `emailTemplate()` function, update the footer social links:

```typescript
<div class="social-links">
  <a href="https://instagram.com/pluggedby212">Instagram</a> •
  <a href="https://twitter.com/pluggedby212">Twitter</a> •
  <a href="https://facebook.com/pluggedby212">Facebook</a>
</div>
```

---

## Testing

### Test in Development
1. Use `onboarding@resend.dev` as FROM address (no verification needed)
2. Send test emails to your personal email
3. Check Resend dashboard for delivery logs

### Test Email Delivery
```typescript
// Create a test script: test-email.ts
import { sendWelcomeEmail } from './src/lib/emailService';

async function testEmail() {
  const result = await sendWelcomeEmail(
    'your-email@example.com',
    'Test User'
  );
  
  console.log('Email sent:', result);
}

testEmail();
```

Run with: `npx tsx test-email.ts`

### Preview Emails
Use tools like:
- **Litmus** (https://litmus.com) - Email testing across clients
- **Email on Acid** (https://www.emailonacid.com) - Email preview
- **Resend Preview** - Built-in preview in Resend dashboard

### Check Email Logs
1. Go to [Resend Dashboard](https://resend.com/emails)
2. View **Emails** tab for delivery status
3. Check **Logs** for errors
4. View open/click rates (if enabled)

---

## Troubleshooting

### Issue: Emails Not Sending

**Check 1**: Verify API Key
```typescript
console.log('Resend API Key:', import.meta.env.VITE_RESEND_API_KEY);
// Should output: re_xxxxxxxx...
```

**Check 2**: Check FROM Address Format
```typescript
// ✅ Correct formats:
'noreply@pluggedby212.shop'
'Plugged <noreply@pluggedby212.shop>'

// ❌ Wrong formats:
'noreply@pluggedby212.shop <Plugged>' // Name after email
'<noreply@pluggedby212.shop>' // Missing name or email only
```

**Check 3**: Domain Verification (Production)
- Ensure domain is verified in Resend dashboard
- Check DNS records are properly set
- Use `onboarding@resend.dev` for testing

**Check 4**: Review Error Logs
```typescript
const result = await sendWelcomeEmail(email, name);
if (!result.success) {
  console.error('Email error:', result.error);
}
```

### Issue: Emails Going to Spam

**Solution 1**: Verify Domain (Production)
- Complete domain verification in Resend
- Add SPF, DKIM, and DMARC records

**Solution 2**: Avoid Spam Triggers
- Don't use all caps in subject lines
- Avoid excessive exclamation marks
- Include unsubscribe link (already in template)
- Use real FROM address (not no-reply)

**Solution 3**: Warm Up Domain
- Start with low volume
- Gradually increase daily sending
- Monitor bounce rates

### Issue: Broken Email Design

**Check 1**: Test Across Email Clients
- Gmail, Outlook, Apple Mail, Yahoo
- Use Litmus or Email on Acid for testing

**Check 2**: Use Inline Styles
```html
<!-- ✅ Good: Inline styles -->
<p style="color: #333; font-size: 16px;">Text</p>

<!-- ❌ Bad: CSS classes (may not work) -->
<p class="text-gray">Text</p>
```

**Check 3**: Avoid Advanced CSS
- No flexbox, grid, or transforms
- Use tables for layout
- Keep it simple and compatible

### Issue: Rate Limiting

Resend free tier limits:
- **100 emails per day**
- **3,000 emails per month**

**Solution**: Upgrade to paid plan for higher limits

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid API key | Check `VITE_RESEND_API_KEY` in `.env` |
| `403 Forbidden` | Domain not verified | Verify domain or use `onboarding@resend.dev` |
| `429 Too Many Requests` | Rate limit exceeded | Upgrade plan or wait |
| `422 Validation Error` | Invalid email format | Check FROM/TO email addresses |

---

## Production Checklist

Before going live, ensure:

- [ ] Domain verified in Resend dashboard
- [ ] DNS records properly configured (SPF, DKIM, DMARC)
- [ ] FROM address uses verified domain
- [ ] API key is production key (not test key)
- [ ] All email templates tested across major clients
- [ ] Unsubscribe functionality implemented
- [ ] Error logging and monitoring set up
- [ ] Rate limiting considered (upgrade plan if needed)
- [ ] Backup email service configured (optional)
- [ ] GDPR compliance (if applicable)
- [ ] Email analytics configured (open/click tracking)

---

## Best Practices

1. **Always include unsubscribe link** - Required by law in many countries
2. **Use transactional emails only** - Don't send marketing emails without consent
3. **Keep templates mobile-friendly** - Most emails are read on mobile
4. **Test before sending** - Always test with real email clients
5. **Monitor delivery rates** - Check bounce and complaint rates
6. **Personalize content** - Use customer names and relevant info
7. **Set expectations** - Tell customers what emails they'll receive
8. **Include support info** - Always provide a way to get help
9. **Use clear subject lines** - Make it obvious what the email is about
10. **Track important metrics** - Monitor open rates, click rates, conversions

---

## Support

### Resend Support
- Documentation: https://resend.com/docs
- Email: support@resend.com
- Discord: https://discord.gg/resend

### Plugged Development Team
- Technical issues: Open GitHub issue
- Email problems: Check Resend dashboard logs first
- Template customization: Edit `src/lib/emailService.ts`

---

**Last Updated**: December 4, 2025  
**Version**: 1.0.0  
**Author**: Plugged Development Team
