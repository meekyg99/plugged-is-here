# Email Setup Guide

## Overview
This project uses **Resend** for transactional emails with pre-built, professional templates.

## Environment Variables

Add these to your `.env` file:

```env
# Resend Email Service
VITE_RESEND_API_KEY=re_your_actual_api_key_here
VITE_EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

### Getting Your Resend API Key:
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create a new API key
3. Copy and paste it into your `.env` file

### Setting Up Your Domain:
1. Go to [Resend Domains](https://resend.com/domains)
2. Add your domain (e.g., `yourdomain.com`)
3. Add the DNS records provided by Resend to your domain registrar
4. Wait for verification (usually takes a few minutes to hours)
5. Update `VITE_EMAIL_FROM_ADDRESS` to use your verified domain

## Available Email Templates

### 1. Welcome Email
**Triggered:** When a new user signs up  
**Purpose:** Welcome new users and guide them to start shopping

### 2. Order Confirmation Email
**Triggered:** When an order is successfully placed  
**Purpose:** Confirm order details, show items, totals, and shipping info

### 3. Order Status Updates
**Triggered:** When order status changes  
**Statuses:**
- `processing` - Order is being prepared
- `shipped` - Order has been shipped (includes tracking)
- `delivered` - Order has been delivered

### 4. Admin 2FA Email
**Triggered:** When admin attempts to log in  
**Purpose:** Send verification code for two-factor authentication

### 5. Password Reset Email
**Triggered:** When user requests password reset  
**Purpose:** Provide secure link to reset password

## Email Service Functions

Located in `src/services/emailService.ts`:

```typescript
// Send welcome email
await sendWelcomeEmail(userEmail, userName, shopUrl);

// Send order confirmation
await sendOrderConfirmationEmail(userEmail, orderData);

// Send order status update
await sendOrderStatusEmail(userEmail, {
  orderNumber: "12345",
  status: "shipped",
  customerName: "John Doe",
  trackingNumber: "TRACK123",
  trackingUrl: "https://tracking.com/TRACK123",
  estimatedDelivery: "Dec 10, 2025"
});

// Send admin 2FA code
await sendAdmin2FAEmail(adminEmail, code, expiresInMinutes, ipAddress, userAgent);

// Send password reset
await sendPasswordResetEmail(userEmail, resetUrl, userName);
```

## Testing Emails

### Local Testing (Development):
1. Make sure your `.env` file has the Resend API key
2. Emails will be sent to real addresses (be careful!)
3. Check Resend Dashboard > Logs to see sent emails

### Production:
1. Verify your domain in Resend
2. Update `VITE_EMAIL_FROM_ADDRESS` to use your verified domain
3. Monitor email delivery in Resend Dashboard

## Customization

### Changing Email Styles:
Edit the inline CSS in each template file:
- `src/emails/templates/WelcomeEmail.tsx`
- `src/emails/templates/OrderConfirmationEmail.tsx`
- `src/emails/templates/OrderStatusEmail.tsx`
- `src/emails/templates/Admin2FAEmail.tsx`

### Changing Email Content:
Modify the HTML/text in the `render*Email()` functions in each template file.

### Brand Colors:
Current brand gradient: `#667eea` to `#764ba2`  
Update in the style sections of each template.

## Integration Points

### Signup Flow:
- File: `src/contexts/AuthContext.tsx`
- Function: `signUp()`
- Add: Call `sendWelcomeEmail()` after successful signup

### Order Placement:
- File: `src/pages/Checkout.tsx` (or order submission handler)
- After successful payment: Call `sendOrderConfirmationEmail()`

### Order Status Updates:
- Admin Dashboard: When admin changes order status
- Call: `sendOrderStatusEmail()` with appropriate status

## Troubleshooting

### Emails Not Sending:
1. Check Resend API key is correct in `.env`
2. Check console for error messages
3. Verify domain is verified in Resend
4. Check Resend Dashboard > Logs for delivery status

### Domain Not Verified:
1. Check DNS records are correctly added
2. Wait 24-48 hours for DNS propagation
3. Use "onboarding@resend.dev" for testing before domain is verified

### Emails in Spam:
1. Ensure domain is verified
2. Add SPF, DKIM, and DMARC records (provided by Resend)
3. Start with low volume to build reputation
4. Avoid spam trigger words in subject lines

## Best Practices

1. **Always use verified domains** in production
2. **Test emails** thoroughly before going live
3. **Monitor delivery rates** in Resend Dashboard
4. **Handle errors gracefully** - don't fail user actions if email fails
5. **Log email failures** for debugging
6. **Rate limit** email sending to avoid hitting API limits

## Support

- Resend Documentation: https://resend.com/docs
- Resend Status: https://status.resend.com
- Resend Support: support@resend.com
