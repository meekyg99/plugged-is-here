// Supabase Edge Function: auth-email
// Generates Supabase auth links (verify/reset) with service role and sends custom HTML via Mailjet
// Expected JSON: { type: 'verify' | 'reset', email: string, redirectUrl?: string, userName?: string }
// Env required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MAILJET_API_KEY, MAILJET_API_SECRET
// Optional env: MAILJET_FROM (e.g., "Plugged <info@pluggedby212.shop>"), VERIFY_REDIRECT, RESET_REDIRECT
/// <reference path="../types.d.ts" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type AuthEmailType = "verify" | "reset";
interface RequestBody {
  type: AuthEmailType;
  email: string;
  redirectUrl?: string;
  userName?: string;
}

const fallbackFrom = { Name: "Plugged", Email: "info@pluggedby212.shop" };
const defaultVerifyRedirect = Deno.env.get("VERIFY_REDIRECT") || "https://pluggedby212.shop/auth/callback";
const defaultResetRedirect = Deno.env.get("RESET_REDIRECT") || "https://pluggedby212.shop/reset-password";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const MAILJET_KEY = Deno.env.get("MAILJET_API_KEY");
const MAILJET_SECRET = Deno.env.get("MAILJET_API_SECRET");
const MAILJET_FROM = Deno.env.get("MAILJET_FROM") || "Plugged <info@pluggedby212.shop>";

const supabase = SUPABASE_URL && SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  : null;

const parseFrom = (raw: string | undefined) => {
  if (!raw) return fallbackFrom;
  const match = raw.match(/^(.*)<(.+)>$/);
  if (match) {
    return { Name: match[1].trim() || fallbackFrom.Name, Email: match[2].trim() };
  }
  return { Name: fallbackFrom.Name, Email: raw.trim() };
};

const buildEmail = (type: AuthEmailType, link: string, userName?: string) => {
  if (type === "verify") {
    return {
      subject: "Verify Your Email for PLUGGED",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #111 0%, #333 100%); padding: 40px 20px; text-align: center; }
    .logo { font-size: 28px; font-weight: bold; color: #fff; letter-spacing: 2px; }
    .content { padding: 40px 30px; }
    .footer { background: #f8f9fa; padding: 24px; text-align: center; font-size: 14px; color: #6c757d; border-top: 1px solid #e9ecef; }
    .btn { display: inline-block; padding: 12px 32px; background: #111; color: #fff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    h1 { color: #111; font-size: 26px; margin: 0 0 18px; font-weight: 700; letter-spacing: 0.5px; }
    p { margin: 0 0 15px; color: #444; }
    .muted { color: #6b7280; font-size: 13px; }
  </style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;">Verify your email</div>
  <div class="wrapper">
    <div class="header">
      <div class="logo">PLUGGED</div>
    </div>
    <div class="content">
      <h1>Confirm Your Email</h1>
      <p>Hi ${userName || "there"},</p>
      <p>Thanks for signing up for PLUGGED. Please confirm your email address to activate your account.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${link}" class="btn">Verify Email</a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p class="muted" style="word-break: break-all;">${link}</p>
      <p style="margin-top:30px;">If you didn't create an account, you can safely ignore this email.</p>
      <p style="margin-top:30px;">See you soon,<br><strong>The PLUGGED Team</strong></p>
    </div>
    <div class="footer">
      <p><strong>PLUGGED</strong><br><a href="mailto:support@pluggedby212.shop" style="color:#111;">support@pluggedby212.shop</a></p>
      <p style="font-size:12px;color:#9ca3af;margin-top:12px;">You received this email because someone registered with this address.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };
  }

  return {
    subject: "Reset Your PLUGGED Password",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #111 0%, #333 100%); padding: 40px 20px; text-align: center; }
    .logo { font-size: 28px; font-weight: bold; color: #fff; letter-spacing: 2px; }
    .content { padding: 40px 30px; }
    .footer { background: #f8f9fa; padding: 24px; text-align: center; font-size: 14px; color: #6c757d; border-top: 1px solid #e9ecef; }
    .btn { display: inline-block; padding: 12px 32px; background: #111; color: #fff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    h1 { color: #111; font-size: 26px; margin: 0 0 18px; font-weight: 700; letter-spacing: 0.5px; }
    p { margin: 0 0 15px; color: #444; }
    .warning-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; }
    .muted { color: #6b7280; font-size: 13px; }
  </style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;">Reset your password</div>
  <div class="wrapper">
    <div class="header">
      <div class="logo">PLUGGED</div>
    </div>
    <div class="content">
      <h1>Reset Your Password</h1>
      <p>Hi ${userName || "there"},</p>
      <p>We received a request to reset the password for your PLUGGED account. Click the button below to choose a new password.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${link}" class="btn">Reset Password</a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p class="muted" style="word-break: break-all;">${link}</p>
      <div class="warning-box">
        <p style="margin:0;"><strong>Expires in 60 minutes.</strong></p>
        <p style="margin:10px 0 0 0;">If you didn't request this, you can safely ignore this email.</p>
      </div>
      <p class="muted">For security, this link can only be used once.</p>
      <p style="margin-top:30px;">Stay secure,<br><strong>The PLUGGED Team</strong></p>
    </div>
    <div class="footer">
      <p><strong>PLUGGED</strong><br><a href="mailto:support@pluggedby212.shop" style="color:#111;">support@pluggedby212.shop</a></p>
      <p style="font-size:12px;color:#9ca3af;margin-top:12px;">You are receiving this email because a password reset was requested for your account.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };
};

async function sendMailjet(to: string, subject: string, html: string) {
  if (!MAILJET_KEY || !MAILJET_SECRET) {
    return { error: "Mailjet secrets not configured" };
  }
  const auth = btoa(`${MAILJET_KEY}:${MAILJET_SECRET}`);
  const payload = {
    Messages: [
      {
        From: parseFrom(MAILJET_FROM),
        To: [{ Email: to }],
        Subject: subject,
        HTMLPart: html,
      },
    ],
  };

  const res = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    return { error: data, status: res.status };
  }

  const messageId = data?.Messages?.[0]?.To?.[0]?.MessageUUID;
  return { ok: true, messageId, data };
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders() });
  }

  if (!supabase) {
    return json({ error: "Supabase service role not configured" }, 500);
  }

  try {
    const body = (await req.json()) as RequestBody;
    if (!body || !body.email || !body.type || !["verify", "reset"].includes(body.type)) {
      return json({ error: "Missing fields: type, email" }, 400);
    }

    const redirectUrl = body.redirectUrl || (body.type === "verify" ? defaultVerifyRedirect : defaultResetRedirect);
    const { data, error } = await supabase.auth.admin.generateLink({
      type: body.type === "verify" ? "signup" : "recovery",
      email: body.email,
      options: { redirectTo: redirectUrl },
    });

    if (error || !data?.properties?.action_link) {
      return json({ error: error?.message || "Failed to generate link" }, 500);
    }

    const { subject, html } = buildEmail(body.type, data.properties.action_link, body.userName);
    const sendResult = await sendMailjet(body.email, subject, html);
    if ((sendResult as any).error) {
      return json({ error: (sendResult as any).error, status: (sendResult as any).status || 500 }, 500);
    }

    return json({ ok: true, messageId: (sendResult as any).messageId });
  } catch (error) {
    return json({ error: String(error) }, 500);
  }
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
  };
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}
