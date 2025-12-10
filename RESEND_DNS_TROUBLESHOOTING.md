# 🔧 Resend Domain Verification Troubleshooting

## Current Issue
Your domain DNS records aren't propagating for Resend email verification.

## What You Need to Know

### DNS Propagation Takes Time
- **Typical time**: 4-48 hours
- **Maximum**: Up to 72 hours
- **Current date**: December 9, 2025

### Common Issues & Solutions

## 1️⃣ Check Your DNS Records

### What Domain Are You Verifying?
Based on your project, it should be: **pluggedby212.shop**

### Required DNS Records for Resend

You need to add these records to your domain registrar (where you bought the domain):

#### **SPF Record** (TXT)
```
Name: @
Type: TXT
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600 (or Auto)
```

#### **DKIM Record** (TXT)
Resend will give you a specific record like:
```
Name: resend._domainkey
Type: TXT
Value: [Resend will provide this - it's unique to your account]
TTL: 3600
```

#### **DMARC Record** (TXT) - Optional but recommended
```
Name: _dmarc
Type: TXT
Value: v=DMARC1; p=none; rua=mailto:your-email@domain.com
TTL: 3600
```

## 2️⃣ Common Mistakes

### ❌ Wrong Nameservers
You mentioned updating nameservers - but for Resend, you DON'T need to change nameservers!
- Keep your existing nameservers (from your domain registrar)
- Only add DNS TXT records

### ❌ Records Added to Wrong Place
Make sure you're adding records to your **domain registrar**, not:
- ❌ Vercel
- ❌ Netlify
- ❌ Cloudflare (unless that's your DNS provider)
- ❌ Resend itself

### ❌ Using Root Domain Instead of Subdomain
You can verify faster with a subdomain:
- Instead of: `pluggedby212.shop`
- Use: `mail.pluggedby212.shop` or `noreply.pluggedby212.shop`

## 3️⃣ Check DNS Propagation Status

### Use These Tools to Check:
```
1. https://dnschecker.org/
   - Enter your domain
   - Select "TXT" record type
   - Check if your SPF/DKIM records appear

2. https://mxtoolbox.com/SuperTool.aspx
   - Enter: pluggedby212.shop
   - Click "SPF Record Lookup"

3. Command Line (Windows):
   nslookup -type=txt pluggedby212.shop
```

## 4️⃣ Where is Your Domain Registered?

Common registrars and where to add DNS records:

### **Namecheap**
1. Login → Domain List
2. Click "Manage" next to domain
3. Advanced DNS tab
4. Add New Record → TXT Record

### **GoDaddy**
1. My Products → Domains
2. Click domain → Manage DNS
3. Add → TXT

### **Google Domains / Squarespace**
1. DNS → Custom records
2. Create new record → TXT

### **Cloudflare**
1. DNS → Records
2. Add record → TXT

## 5️⃣ Quick Fix - Use Subdomain

Instead of waiting for root domain verification:

1. **In Resend Dashboard:**
   - Add domain: `mail.pluggedby212.shop`
   - Get the DNS records

2. **Add to DNS:**
   ```
   Name: resend._domainkey.mail
   Type: TXT
   Value: [value from Resend]
   ```

3. **In your .env:**
   ```
   VITE_EMAIL_FROM_ADDRESS=Plugged <noreply@mail.pluggedby212.shop>
   ```

This typically verifies faster (minutes instead of hours)!

## 6️⃣ Temporary Solution - Keep Using Test Email

While waiting for DNS:

```bash
# In .env
VITE_EMAIL_FROM_ADDRESS=onboarding@resend.dev
```

This works but emails will have:
- "via resend.dev" in the from field
- Lower deliverability
- Resend branding

## 7️⃣ Check Resend Dashboard

1. Go to: https://resend.com/domains
2. Click your domain
3. Check the status:
   - 🟡 **Pending** = Still waiting for DNS
   - 🟢 **Verified** = Ready to use!
   - 🔴 **Failed** = DNS records incorrect

4. Click "Verify DNS" to manually trigger check

## 8️⃣ Debug Commands (Run in PowerShell)

```powershell
# Check SPF record
nslookup -type=txt pluggedby212.shop

# Check DKIM record  
nslookup -type=txt resend._domainkey.pluggedby212.shop

# Check if domain resolves
ping pluggedby212.shop
```

## 9️⃣ What Did You Change?

You mentioned changing **nameservers** - but that's not needed for Resend!

### If you changed nameservers:
- **To what?** (Cloudflare, Vercel, etc?)
- You need to add DNS records to wherever the nameservers point
- Example: If NS points to Cloudflare, add records in Cloudflare

### If you only added TXT records:
- Good! Just wait 24-48 hours
- Clear your DNS cache: `ipconfig /flushdns`

## 🎯 Action Plan

1. **Tell me:**
   - What domain registrar do you use?
   - Did you change nameservers or just add TXT records?
   - What does Resend dashboard show?

2. **Quick check:**
   - Run: `nslookup -type=txt pluggedby212.shop`
   - Share the output

3. **Fastest solution:**
   - Use subdomain: `mail.pluggedby212.shop`
   - Or keep using: `onboarding@resend.dev` temporarily

## 📧 Need Immediate Email Sending?

Use the test address for now:
```env
VITE_RESEND_API_KEY=re_your_actual_key_here
VITE_EMAIL_FROM_ADDRESS=onboarding@resend.dev
```

This works immediately while your domain verifies in the background!

---

**Tell me:**
1. What domain registrar are you using?
2. What exactly did you change (nameservers or DNS records)?
3. How long ago did you make the changes?
4. What does Resend dashboard currently show?
