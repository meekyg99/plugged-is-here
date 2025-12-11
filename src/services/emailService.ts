import { renderWelcomeEmail } from '../emails/templates/WelcomeEmail';
import { renderOrderConfirmationEmail } from '../emails/templates/OrderConfirmationEmail';
import { renderOrderStatusEmail } from '../emails/templates/OrderStatusEmail';
import { renderAdmin2FAEmail } from '../emails/templates/Admin2FAEmail';
import { renderPasswordResetEmail } from '../emails/templates/PasswordResetEmail';
import { renderEmailVerificationEmail } from '../emails/templates/EmailVerificationEmail';

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

// Send through our Vercel serverless function to keep secrets server-side
async function sendMailjetEmail({ to, subject, html }: { to: string; subject: string; html: string; }) {
  const endpoint = `${typeof window !== 'undefined' ? '' : 'https://pluggedby212.shop'}/api/send-email`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mailjet send failed (${res.status}): ${text}`);
  }

  const data = await res.json().catch(() => ({}));
  const messageId = (data as any)?.messageId || 'mailjet-api-send';
  return { success: true, messageId } as EmailResponse;
}

// Welcome Email
export async function sendWelcomeEmail(
  to: string,
  userName: string,
  shopUrl?: string
): Promise<EmailResponse> {
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
  try {
    const html = renderOrderStatusEmail(statusData);
    
    const statusTitles = {
      processing: 'Your Order is Being Processed',
      shipped: 'Your Order Has Shipped',
      delivered: 'Your Order Has Been Delivered',
      cancelled: 'Your Order Was Cancelled',
      payment_failed: 'Payment Failed — Action Needed',
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
  try {
    const html = renderPasswordResetEmail({ userName, resetUrl });
    
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

// Email Verification Email
export async function sendEmailVerificationEmail(
  to: string,
  verificationUrl: string,
  userName: string
): Promise<EmailResponse> {
  try {
    const html = renderEmailVerificationEmail({ userName, verificationUrl });

    const result = await sendMailjetEmail({
      to,
      subject: 'Verify Your Email for PLUGGED',
      html,
    });

    return result;
  } catch (error: any) {
    console.error('Exception sending verification email:', error);
    return { success: false, error: error.message };
  }
}
