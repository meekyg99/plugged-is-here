# 🚀 Resend Email - Quick Start Guide

## Your Current Status

✅ Email templates created (5 templates)  
✅ Email service integrated  
✅ Code integrated into signup, checkout, and admin flows  
⏳ **WAITING:** Domain verification in Resend  
⏳ **WAITING:** Add actual API key to `.env`

---

## 🔑 Your Resend API Key Name in .env:

```env
VITE_RESEND_API_KEY=your_actual_key_here
VITE_EMAIL_FROM_ADDRESS=onboarding@resend.dev
```

**Note:** Change `VITE_EMAIL_FROM_ADDRESS` to `noreply@yourdomain.com` once domain is verified.

---

## 📧 What Emails Will Be Sent?

### 1. Welcome Email
**When:** User signs up  
**To:** New user's email  
**Content:** Welcome message + "Start Shopping" button

### 2. Order Confirmation
**When:** Order is placed  
**To:** Customer's email  
**Content:** Order details, items, total, shipping address

### 3. Order Status Updates
**When:** Admin changes order status  
**To:** Customer's email  
**Statuses:**
- Processing: "We're preparing your order"
- Shipped: "Your order has shipped" + tracking
- Delivered: "Your order was delivered"

### 4. Admin 2FA
**When:** Admin logs in  
**To:** Admin's email  
**Content:** 6-digit verification code

---

## ✅ Final Checklist

- [ ] Domain verification complete in Resend (pending)
- [ ] Update `.env` file with actual Resend API key
- [ ] Change `VITE_EMAIL_FROM_ADDRESS` to your domain email
- [ ] Test signup → check welcome email
- [ ] Test order → check confirmation email
- [ ] Test admin status change → check status email
- [ ] Check Resend Dashboard for delivery logs

---

## 🧪 How to Test (After Domain Verification)

### Test 1: Welcome Email
1. Go to your site
2. Create a new account
3. Check email inbox for welcome email

### Test 2: Order Confirmation
1. Add items to cart
2. Complete checkout
3. Check email for order confirmation

### Test 3: Status Updates
1. Login to admin (`/admin/login`)
2. Go to Orders
3. Select an order
4. Change status to "Shipped"
5. Check customer email for shipping notification

---

## 📊 Monitor Emails

**Resend Dashboard:**  
https://resend.com/emails

See all sent emails, delivery status, opens, clicks, and errors.

---

## 🆘 Troubleshooting

**Emails not sending?**
- Check API key in `.env` is correct
- Check browser console for errors
- Check Resend Dashboard logs

**Emails in spam?**
- Verify domain in Resend
- Add all DNS records (SPF, DKIM, DMARC)

**Domain not verifying?**
- Wait 24-48 hours for DNS propagation
- Double-check DNS records in your domain registrar

---

## 📄 Documentation

- Full setup: `EMAIL_SETUP_GUIDE.md`
- Integration details: `EMAIL_INTEGRATION_COMPLETE.md`
- Resend docs: https://resend.com/docs

---

**You're all set! 🎉**  
Once domain verification completes, emails will start sending automatically.
