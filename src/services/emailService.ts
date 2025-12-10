import { renderWelcomeEmail } from '../emails/templates/WelcomeEmail';
import { renderOrderConfirmationEmail } from '../emails/templates/OrderConfirmationEmail';
import { renderOrderStatusEmail } from '../emails/templates/OrderStatusEmail';
import { renderAdmin2FAEmail } from '../emails/templates/Admin2FAEmail';

const mailjetKey = import.meta.env.VITE_MAILJET_API_KEY;
const mailjetSecret = import.meta.env.VITE_MAILJET_API_SECRET;
const fromEmailRaw = import.meta.env.VITE_EMAIL_FROM_ADDRESS || 'Plugged <info@pluggedby212.shop>';

const parseFrom = (raw: string) => {
  const match = raw.match(/^(.*)<(.+)>$/);
  if (match) {
    return { name: match[1].trim() || 'Plugged', email: match[2].trim() };
  }
  return { name: 'Plugged', email: raw.trim() };
};

const { name: fromName, email: fromEmail } = parseFrom(fromEmailRaw);

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Helper to check if email is configured
function isEmailConfigured(): boolean {
  return Boolean(mailjetKey && mailjetSecret);
}

async function sendMailjetEmail({ to, subject, html }: { to: string; subject: string; html: string; }) {
  const auth = btoa(`${mailjetKey}:${mailjetSecret}`);
  const payload = {
    Messages: [
      {
        From: { Email: fromEmail, Name: fromName },
        To: [{ Email: to }],
        Subject: subject,
        HTMLPart: html,
      },
    ],
  };

  const res = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mailjet send failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const messageId = data?.Messages?.[0]?.To?.[0]?.MessageUUID;
  return { success: true, messageId } as EmailResponse;
}

// Welcome Email
export async function sendWelcomeEmail(
  to: string,
  userName: string,
  shopUrl?: string
): Promise<EmailResponse> {
  if (!isEmailConfigured()) {
    console.warn('Email not configured - skipping welcome email');
    return { success: true, messageId: 'skipped-no-api-key' };
  }
  
  try {
    const html = renderWelcomeEmail({ userName, shopUrl });
    
    const result = await sendMailjetEmail({
      to,
      subject: `Welcome to PLUGGED, ${userName}! 🎉`,
      html,
    });

    return result;
  } catch (error: any) {
    console.error('Exception sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

// Order Confirmation Email
export async function sendOrderConfirmationEmail(
  to: string,
  orderData: Parameters<typeof renderOrderConfirmationEmail>[0]
): Promise<EmailResponse> {
  if (!isEmailConfigured()) {
    console.warn('Email not configured - skipping order confirmation email');
    return { success: true, messageId: 'skipped-no-api-key' };
  }
  
  try {
    const html = renderOrderConfirmationEmail(orderData);
    
    const result = await sendMailjetEmail({
      to,
      subject: `Order Confirmation - #${orderData.orderNumber}`,
      html,
    });

    return result;
  } catch (error: any) {
    console.error('Exception sending order confirmation:', error);
    return { success: false, error: error.message };
  }
}

// Order Status Update Email
export async function sendOrderStatusEmail(
  to: string,
  statusData: Parameters<typeof renderOrderStatusEmail>[0]
): Promise<EmailResponse> {
  if (!isEmailConfigured()) {
    console.warn('Email not configured - skipping order status email');
    return { success: true, messageId: 'skipped-no-api-key' };
  }
  
  try {
    const html = renderOrderStatusEmail(statusData);
    
    const statusTitles = {
      processing: 'Your Order is Being Processed',
      shipped: 'Your Order Has Shipped',
      delivered: 'Your Order Has Been Delivered',
    };
    
    const result = await sendMailjetEmail({
      to,
      subject: `${statusTitles[statusData.status]} - #${statusData.orderNumber}`,
      html,
    });

    return result;
  } catch (error: any) {
    console.error('Exception sending order status email:', error);
    return { success: false, error: error.message };
  }
}

// Admin 2FA Email
export async function sendAdmin2FAEmail(
  to: string,
  code: string,
  expiresInMinutes: number = 5,
  ipAddress?: string,
  userAgent?: string
): Promise<EmailResponse> {
  if (!isEmailConfigured()) {
    console.warn('Email not configured - skipping 2FA email');
    return { success: true, messageId: 'skipped-no-api-key' };
  }
  
  try {
    const html = renderAdmin2FAEmail({
      code,
      expiresInMinutes,
      ipAddress,
      userAgent,
    });
    
    const result = await sendMailjetEmail({
      to,
      subject: `🔐 Admin Login Verification Code: ${code}`,
      html,
    });

    return result;
  } catch (error: any) {
    console.error('Exception sending 2FA email:', error);
    return { success: false, error: error.message };
  }
}

// Password Reset Email (for future use)
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  userName: string
): Promise<EmailResponse> {
  if (!isEmailConfigured()) {
    console.warn('Email not configured - skipping password reset email');
    return { success: true, messageId: 'skipped-no-api-key' };
  }
  
  try {
    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
      .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
      .logo { font-size: 32px; font-weight: bold; color: #fff; }
      .content { padding: 40px 30px; }
      .footer { background: #f8f9fa; padding: 30px; text-align: center; font-size: 14px; color: #6c757d; border-top: 1px solid #e9ecef; }
      .btn { display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
      h1 { color: #1a1a1a; font-size: 28px; margin: 0 0 20px; font-weight: 700; }
      p { margin: 0 0 15px; color: #555; }
      .warning-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <div class="logo">⚡ PLUGGED</div>
      </div>
      <div class="content">
        <h1>Reset Your Password</h1>
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password for your PLUGGED account.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${resetUrl}" class="btn">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <div class="warning-box">
          <p style="margin:0;"><strong>⚠️ Didn't request this?</strong></p>
          <p style="margin:10px 0 0 0;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        </div>
        <p style="margin-top:30px;">
          Stay secure,<br>
          <strong>The PLUGGED Team</strong>
        </p>
      </div>
      <div class="footer">
        <p><strong>PLUGGED</strong><br>Your trusted online store<br><a href="mailto:support@plugged.com" style="color:#667eea;">support@plugged.com</a></p>
        <p style="font-size:12px;color:#999;margin-top:20px;">This is an automated security email.</p>
      </div>
    </div>
  </body>
</html>
    `.trim();
    
    const result = await sendMailjetEmail({
      to,
      subject: 'Reset Your PLUGGED Password',
      html,
    });

    return result;
  } catch (error: any) {
    console.error('Exception sending password reset email:', error);
    return { success: false, error: error.message };
  }
}
