# Supabase Auth Email Setup (Custom Templates)

Use this to wire Supabase Auth to our custom HTML emails via the `auth-email` edge function.

## Disable Supabase default auth emails
1) In Supabase Dashboard: **Settings → Authentication → Email** (or Email Templates).
2) Turn off/disable default confirmation emails so Supabase stops sending its built-ins.

## Required secrets (Supabase project → Config → Secrets)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (service role; needed to generate verify/reset links)
- `MAILJET_API_KEY`
- `MAILJET_API_SECRET`
- `MAILJET_FROM` (optional, e.g., `Plugged <info@pluggedby212.shop>`)
- `VERIFY_REDIRECT` (optional; defaults to `https://pluggedby212.shop/auth/callback`)
- `RESET_REDIRECT` (optional; defaults to `https://pluggedby212.shop/reset-password`)

## Deploy edge functions
```bash
supabase functions deploy auth-email --project-ref <project-ref>
supabase functions deploy send-email --project-ref <project-ref>  # if you want Supabase-hosted sender
```

## Where templates live
- Auth (verify/reset): `supabase/functions/auth-email/index.ts` (HTML embedded)
- Transactional: `src/emails/templates/` (confirmation, status, welcome, admin 2FA, password reset, verification)

## Frontend usage
- Signup: already calls `auth-email` (verify) in `AuthContext`.
- Forgot password: call `supabase.functions.invoke('auth-email', { body: { type: 'reset', email, userName } })`.

## Notes
- Keep all transactional emails going through serverless senders (`/api/send-email` on Vercel or Supabase `send-email`).
- Avoid client-side Mailjet keys entirely.
