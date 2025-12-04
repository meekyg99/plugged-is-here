# Admin Security Features

This document describes the enhanced security features implemented for the admin portal.

## Overview

The admin portal now includes comprehensive security measures including:
- Separate admin login page
- Two-factor authentication (2FA)
- Rate limiting on login attempts
- Session management with 30-minute timeout
- Audit logging for all admin actions
- Automatic session refresh on activity

## Features

### 1. Separate Admin Login Page

**URL:** `/admin/login`

- Dedicated login page for administrators only
- Non-admin users attempting to login are blocked
- Beautiful, professional UI with security indicators
- All login attempts are logged

### 2. Two-Factor Authentication (2FA)

**How it works:**
1. Admin enters email and password
2. System validates credentials and admin role
3. 6-digit verification code is generated
4. Code is sent to admin's email (currently shown in console/alert for development)
5. Admin enters code to complete login
6. Session is created upon successful verification

**Code Expiration:** 10 minutes

**Implementation Notes:**
- In development, 2FA codes are shown in console and alert dialog
- **TODO for Production:** Integrate with email service (SendGrid, AWS SES, etc.) to send codes via email
- See `AdminLoginPage.tsx` lines with `console.log` and `alert` for email integration points

### 3. Rate Limiting

**Policy:**
- Maximum 5 failed login attempts per email address
- 15-minute lockout period after exceeding limit
- Automatic reset after lockout period
- IP address tracking (optional, currently set to null)

**Database Table:** `admin_login_attempts`

### 4. Session Management

**Features:**
- 30-minute session timeout
- Automatic session refresh on user activity
- Session validation every 5 minutes
- Manual logout option
- Session token stored in localStorage
- Session timer displayed in admin panel

**Session Extension:**
- Any user activity (click, keypress) within 5 minutes of expiration triggers refresh
- Each validation extends the session by 30 minutes

**Database Table:** `admin_sessions`

### 5. Audit Logging

**Tracked Actions:**
- Admin login/logout
- Product creation, updates, deletion
- Order status changes
- Inventory adjustments
- Customer profile views
- User role changes
- Content/banner modifications
- Report generation

**Usage Example:**
```typescript
import { adminAuditService } from '../services/adminAuditService';

// Log a product update
await adminAuditService.logProductUpdate(
  productId,
  productName,
  { price: { old: 100, new: 120 } }
);
```

**Database Table:** `admin_audit_log`

## Database Schema

### Tables Created

1. **admin_login_attempts** - Track login attempts for rate limiting
2. **admin_sessions** - Active admin sessions with timeout tracking
3. **admin_2fa_codes** - Generated 2FA codes
4. **admin_audit_log** - Comprehensive audit trail

### Functions Created

- `check_admin_login_rate_limit()` - Validate if user can attempt login
- `log_admin_login_attempt()` - Record login attempt
- `generate_admin_2fa_code()` - Create 6-digit verification code
- `verify_admin_2fa_code()` - Validate entered code
- `create_admin_session()` - Initialize new admin session
- `validate_admin_session()` - Check and refresh session
- `log_admin_action()` - Record admin action to audit log
- `cleanup_admin_security_data()` - Remove old/expired data

## Setup Instructions

### 1. Run Database Migration

```bash
# Apply the security features migration
supabase db push
# or
supabase migration up
```

### 2. Configure Admin Email

The admin email is set in the migration file:
`20251126205606_add_admin_email_auto_promotion.sql`

Current admin email: `kabbalallana38@gmail.com`

To add more admin emails, update the `handle_new_user()` function in the migration.

### 3. Email Service Integration (Production)

**Replace the following in `AdminLoginPage.tsx`:**

```typescript
// DEVELOPMENT - Remove this
console.log('2FA Code:', code2fa);
alert(`Your 2FA code is: ${code2fa}...`);

// PRODUCTION - Add this
await sendEmail({
  to: email,
  subject: 'Your Admin Login Code',
  body: `Your verification code is: ${code2fa}. Valid for 10 minutes.`
});
```

**Recommended Email Services:**
- SendGrid
- AWS SES
- Mailgun
- Postmark

### 4. Environment Variables

Add to your `.env` file:

```env
# Email Service (for 2FA codes)
VITE_EMAIL_SERVICE_API_KEY=your_key_here
VITE_EMAIL_FROM_ADDRESS=noreply@yourdomain.com

# Optional: IP Tracking Service
VITE_IP_TRACKING_API_KEY=your_key_here
```

## Security Best Practices

### Current Implementation
✅ Separate admin login endpoint
✅ 2FA required for all admin logins
✅ Rate limiting (5 attempts / 15 minutes)
✅ Session timeout (30 minutes)
✅ Audit logging for all admin actions
✅ Secure session token storage
✅ Automatic session refresh

### Recommended Enhancements
⚠️ Implement email service for 2FA codes (currently in development mode)
⚠️ Add IP address tracking for security monitoring
⚠️ Implement HTTPS-only cookies for session storage
⚠️ Add security headers (CSP, HSTS, etc.)
⚠️ Implement account lockout after multiple failed 2FA attempts
⚠️ Add admin notification for suspicious login attempts
⚠️ Regular security audit of admin actions
⚠️ Implement backup codes for 2FA

## Usage

### Admin Login Flow

1. Navigate to `/admin/login`
2. Enter admin email and password
3. Receive 6-digit code (via email in production)
4. Enter verification code
5. Access admin dashboard

### Logging Admin Actions

Import and use the audit service in any admin component:

```typescript
import { adminAuditService } from '../services/adminAuditService';

// Example: Log product deletion
const handleDeleteProduct = async (product) => {
  await deleteProduct(product.id);
  await adminAuditService.logProductDelete(product.id, product.name);
};
```

### Checking Session Status

The session is automatically validated and displayed in the admin layout:

```typescript
import { useAdminSession } from '../hooks/useAdminSession';

const { sessionValid, checking, logoutAdmin } = useAdminSession();
```

### Manual Logout

The logout button in the admin layout automatically:
1. Invalidates the admin session
2. Clears session tokens
3. Signs out from Supabase
4. Redirects to admin login page

## Maintenance

### Cleanup Old Data

Run periodically to remove old audit logs and expired sessions:

```sql
SELECT cleanup_admin_security_data();
```

**Recommended Schedule:**
- Daily cleanup via cron job or scheduled task
- Keeps last 7 days of login attempts
- Keeps last 7 days of inactive sessions
- Removes expired 2FA codes after 1 day

### Monitoring

**Key Metrics to Monitor:**
- Failed login attempts per hour
- Active admin sessions count
- Average session duration
- Most common admin actions
- Suspicious patterns (multiple failed logins, unusual access times)

**Query Examples:**

```sql
-- Failed login attempts in last hour
SELECT COUNT(*) FROM admin_login_attempts
WHERE success = false AND attempt_time > NOW() - INTERVAL '1 hour';

-- Active admin sessions
SELECT COUNT(*) FROM admin_sessions
WHERE is_active = true AND expires_at > NOW();

-- Top admin actions today
SELECT action, COUNT(*) as count
FROM admin_audit_log
WHERE created_at >= CURRENT_DATE
GROUP BY action
ORDER BY count DESC;
```

## Troubleshooting

### "Too many login attempts"
- Wait 15 minutes or contact system administrator
- Admin can manually clear attempts from database if needed

### "Invalid or expired verification code"
- Request a new code (codes expire in 10 minutes)
- Check email spam folder
- Ensure system time is correct

### "Session expired"
- Normal after 30 minutes of inactivity
- Simply log in again
- Sessions auto-refresh with activity

### 2FA Code Not Received
- Check console/alert in development mode
- In production, check email spam folder
- Verify email service configuration
- Check admin_2fa_codes table for generated codes

## Admin User Management

### Creating a New Admin User

```sql
-- Promote existing user to admin
SELECT promote_user_to_admin('user@example.com');

-- Or manually update profile
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

### Admin Roles

- **admin** - Full access to all features
- **manager** - Full access (same as admin)
- **support** - Full access (same as admin)

All three roles have identical permissions but can be used for organizational purposes.

## Security Incident Response

If suspicious activity is detected:

1. **Immediate Actions:**
   - Disable affected admin account
   - Review audit logs for unauthorized actions
   - Check for data modifications
   - Change passwords immediately

2. **Investigation:**
   ```sql
   -- Review all actions by user
   SELECT * FROM admin_audit_log
   WHERE user_id = 'suspected_user_id'
   ORDER BY created_at DESC;
   
   -- Check login attempts
   SELECT * FROM admin_login_attempts
   WHERE email = 'suspected@email.com'
   ORDER BY attempt_time DESC;
   ```

3. **Recovery:**
   - Revert unauthorized changes if needed
   - Update security measures
   - Notify relevant stakeholders

## Contact

For security concerns or questions, contact the system administrator.

---

**Last Updated:** 2025-12-03
**Version:** 1.0.0
