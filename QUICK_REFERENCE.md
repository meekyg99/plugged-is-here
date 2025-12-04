# Admin Security - Quick Reference Card

## 🚀 Quick Start

```bash
# 1. Apply migration
supabase db push

# 2. Start dev server
npm run dev

# 3. Open admin login
http://localhost:5173/admin/login
```

## 🔑 Admin Credentials

**Email:** kabbalallana38@gmail.com  
**2FA Location (Dev):** Browser console + Alert dialog  
**Session Duration:** 30 minutes

## 📍 Important URLs

| URL | Purpose |
|-----|---------|
| `/admin/login` | Admin login page |
| `/admin/dashboard` | Admin dashboard (protected) |
| `/admin/products` | Product management (protected) |
| `/admin/orders` | Order management (protected) |

## 🔐 Security Features

| Feature | Details |
|---------|---------|
| **2FA** | 6-digit code, 10-min expiry |
| **Session** | 30-min timeout, auto-refresh |
| **Rate Limit** | 5 attempts / 15 minutes |
| **Audit Log** | All admin actions tracked |

## 📝 Logging Actions

```typescript
import { adminAuditService } from '../services/adminAuditService';

// Product actions
await adminAuditService.logProductCreate(id, name);
await adminAuditService.logProductUpdate(id, name, changes);
await adminAuditService.logProductDelete(id, name);

// Order actions
await adminAuditService.logOrderStatusChange(
  orderId, orderNumber, oldStatus, newStatus
);

// Inventory
await adminAuditService.logInventoryAdjustment(
  variantId, sku, oldQty, newQty, reason
);
```

## 🔧 Common Tasks

### Create New Admin
```sql
SELECT promote_user_to_admin('newadmin@example.com');
```

### Check Failed Logins
```sql
SELECT * FROM admin_login_attempts
WHERE success = false
AND attempt_time > NOW() - INTERVAL '24 hours';
```

### Clear Rate Limit
```sql
DELETE FROM admin_login_attempts
WHERE email = 'user@example.com';
```

### View Active Sessions
```sql
SELECT * FROM admin_sessions
WHERE is_active = true AND expires_at > NOW();
```

### Daily Cleanup
```sql
SELECT cleanup_admin_security_data();
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Too many attempts | Wait 15 min or clear attempts |
| 2FA code not working | Request new code (10 min expiry) |
| Session expired | Re-login (happens after 30 min) |
| Can't access admin | Check: logged in → 2FA done → session valid |

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `admin_login_attempts` | Rate limiting |
| `admin_sessions` | Session management |
| `admin_2fa_codes` | 2FA verification |
| `admin_audit_log` | Action tracking |

## ⚠️ Production TODOs

- [ ] Integrate email service for 2FA
- [ ] Add real IP tracking
- [ ] Configure security headers
- [ ] Enable HTTPS only
- [ ] Set up monitoring alerts

## 📚 Full Documentation

- **Quick Setup:** `ADMIN_SETUP_GUIDE.md`
- **Security Details:** `ADMIN_SECURITY.md`
- **Implementation:** `IMPLEMENTATION_SUMMARY.md`

## 🆘 Emergency Access

If locked out:

```sql
-- Clear all rate limits
DELETE FROM admin_login_attempts;

-- Deactivate all sessions (force re-login)
UPDATE admin_sessions SET is_active = false;

-- Promote user to admin
SELECT promote_user_to_admin('emergency@example.com');
```

## 📞 Support

1. Check documentation files
2. Review audit logs
3. Check Supabase logs
4. Clear browser localStorage

---

**Quick Tip:** Press F12 in browser to see 2FA codes during development!
