# Admin Security Setup Guide

## Quick Start

This guide will help you set up the enhanced admin security features.

## Step 1: Apply Database Migrations

Run the security migration to create necessary tables and functions:

```bash
# If using Supabase CLI
supabase db push

# Or apply the specific migration
supabase migration up
```

The migration file is located at:
`supabase/migrations/20251203163000_add_admin_security_features.sql`

## Step 2: Verify Admin Email

Your current admin email is: **kabbalallana38@gmail.com**

This email is automatically promoted to admin on signup (configured in migration `20251126205606_add_admin_email_auto_promotion.sql`).

## Step 3: Test the Admin Login

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:5173/admin/login`

3. Login flow:
   - Enter email: `kabbalallana38@gmail.com`
   - Enter password
   - A 6-digit 2FA code will be displayed in:
     - Browser console (F12)
     - Alert dialog
   - Enter the 6-digit code
   - You'll be redirected to `/admin/dashboard`

## Step 4: Session Management

- Sessions last **30 minutes**
- Auto-refresh on user activity (clicks, keypress)
- Session timer visible in admin menu dropdown
- Manual logout available in admin sidebar

## Step 5: Production Setup (Important!)

### A. Email Service for 2FA

Currently, 2FA codes are shown in console/alert for development.

**For production, integrate an email service:**

1. Choose an email provider:
   - SendGrid
   - AWS SES
   - Mailgun
   - Postmark

2. Install email library:
   ```bash
   npm install @sendgrid/mail
   # or
   npm install nodemailer
   ```

3. Update `src/pages/admin/AdminLoginPage.tsx`:

   Find these lines:
   ```typescript
   console.log('2FA Code:', code2fa);
   alert(`Your 2FA code is: ${code2fa}...`);
   ```

   Replace with email sending code:
   ```typescript
   // Example with SendGrid
   await fetch('/api/send-2fa-code', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, code: code2fa })
   });
   ```

4. Create email API endpoint or use Supabase Edge Functions

### B. Environment Variables

Create `.env` file:

```env
# Supabase (you already have these)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Email Service for 2FA (add this)
VITE_EMAIL_SERVICE_API_KEY=your_email_service_key
VITE_EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

### C. Security Headers

Add to your hosting configuration (Vercel, Netlify, etc.):

```
# Example vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## Features Implemented

✅ **Separate Admin Login Page**
- URL: `/admin/login`
- Beautiful, professional UI
- Only for admin users

✅ **Two-Factor Authentication**
- 6-digit code required
- 10-minute expiration
- Can resend code

✅ **Rate Limiting**
- Max 5 failed attempts
- 15-minute lockout
- Automatic reset

✅ **Session Management**
- 30-minute timeout
- Auto-refresh on activity
- Secure token storage

✅ **Audit Logging**
- All admin actions logged
- User tracking
- Timestamp and details

✅ **Session Timer**
- Visible countdown in admin panel
- Warns before expiration
- Smooth auto-refresh

## Admin Routes Protected

All these routes now require:
1. Valid admin authentication
2. Active 2FA-verified session
3. Non-expired session token

- `/admin/dashboard`
- `/admin/products`
- `/admin/orders`
- `/admin/customers`
- `/admin/inventory`
- `/admin/content`
- `/admin/reports`

## Using Audit Logging

In any admin component, log actions:

```typescript
import { adminAuditService } from '../services/adminAuditService';

// Example 1: Log product update
const handleUpdateProduct = async (product) => {
  await updateProduct(product);
  await adminAuditService.logProductUpdate(
    product.id,
    product.name,
    { changes: 'Updated price' }
  );
};

// Example 2: Log order status change
await adminAuditService.logOrderStatusChange(
  orderId,
  orderNumber,
  'pending',
  'shipped'
);

// Example 3: Log inventory adjustment
await adminAuditService.logInventoryAdjustment(
  variantId,
  'SKU-123',
  50,
  75,
  'Restock'
);
```

## Monitoring Admin Activity

Query audit logs in Supabase:

```sql
-- Recent admin actions
SELECT * FROM admin_audit_log
ORDER BY created_at DESC
LIMIT 50;

-- Actions by specific admin
SELECT * FROM admin_audit_log
WHERE user_id = 'admin-user-id'
ORDER BY created_at DESC;

-- Failed login attempts
SELECT * FROM admin_login_attempts
WHERE success = false
AND attempt_time > NOW() - INTERVAL '24 hours';
```

## Maintenance Tasks

### Daily Cleanup (Recommended)

Create a cron job or scheduled task:

```sql
SELECT cleanup_admin_security_data();
```

This removes:
- Login attempts older than 7 days
- Expired 2FA codes
- Inactive sessions older than 7 days

### Manual Admin Promotion

To promote a user to admin:

```sql
SELECT promote_user_to_admin('newadmin@example.com');
```

## Troubleshooting

### Can't login - "Too many attempts"
Wait 15 minutes or ask another admin to clear attempts:
```sql
DELETE FROM admin_login_attempts
WHERE email = 'user@example.com';
```

### Session keeps expiring
- Sessions expire after 30 minutes of inactivity
- Make sure you're clicking or typing to keep it active
- Check browser console for session validation errors

### 2FA code not working
- Codes expire in 10 minutes
- Use "Resend Code" button
- Check console/alert for the code (development mode)

### Can't access admin pages
Make sure you have:
1. Logged in via `/admin/login`
2. Completed 2FA verification
3. Valid session (check localStorage for `admin_session_token`)

## Security Checklist

Before going to production:

- [ ] Email service integrated for 2FA
- [ ] Environment variables configured
- [ ] Security headers added to hosting
- [ ] HTTPS enabled
- [ ] Database RLS policies reviewed
- [ ] Admin email verified
- [ ] Audit log monitoring setup
- [ ] Backup admin account created
- [ ] Password strength requirements enforced
- [ ] Regular security audits scheduled

## Support

For issues or questions:
1. Check `ADMIN_SECURITY.md` for detailed documentation
2. Review audit logs for security incidents
3. Contact system administrator

---

**Admin Email:** kabbalallana38@gmail.com
**Session Timeout:** 30 minutes
**2FA Code Expiry:** 10 minutes
**Rate Limit:** 5 attempts / 15 minutes
