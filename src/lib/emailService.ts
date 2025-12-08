import { Resend } from 'resend';

const API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const resend = API_KEY && API_KEY !== 'your-resend-api-key-here' ? new Resend(API_KEY) : null;

const FROM_EMAIL = import.meta.env.VITE_EMAIL_FROM_ADDRESS || 'Plugged <noreply@pluggedby212.shop>';
const BRAND_NAME = 'Plugged';
const BRAND_COLOR = '#000000';
const WEBSITE_URL = 'https://pluggedby212.shop';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Base email template wrapper
const emailTemplate = (content: string, preheader?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${BRAND_NAME}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: ${BRAND_COLOR};
      color: #ffffff;
      padding: 30px 40px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 2px;
    }
    .content {
      padding: 40px;
    }
    .footer {
      background-color: #f8f8f8;
      padding: 30px 40px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: ${BRAND_COLOR};
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 20px 0;
    }
    .divider {
      border-top: 1px solid #e0e0e0;
      margin: 30px 0;
    }
    .order-details {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #666666;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 20px !important;
      }
      .header {
        padding: 20px !important;
      }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  <div class="email-container">
    <div class="header">
      <h1>${BRAND_NAME}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>${BRAND_NAME}</strong></p>
      <p>Premium Nigerian Fashion</p>
      <div class="social-links">
        <a href="${WEBSITE_URL}">Website</a> •
        <a href="${WEBSITE_URL}/contact">Contact</a> •
        <a href="${WEBSITE_URL}/faq">FAQ</a>
      </div>
      <p style="margin-top: 20px;">
        You're receiving this email because you have an account with ${BRAND_NAME}.<br>
        <a href="${WEBSITE_URL}/unsubscribe" style="color: #666666;">Unsubscribe</a>
      </p>
      <p style="color: #999999; margin-top: 20px;">
        © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

// Send email function
async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!resend) {
    console.warn('Email service not configured - skipping email send');
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

// Welcome Email
export async function sendWelcomeEmail(email: string, firstName: string) {
  const content = `
    <h2>Welcome to ${BRAND_NAME}! 🎉</h2>
    <p>Hi ${firstName},</p>
    <p>Thank you for joining ${BRAND_NAME}! We're thrilled to have you as part of our fashion community.</p>
    <p>Here's what you can look forward to:</p>
    <ul>
      <li>✨ Exclusive access to premium Nigerian fashion</li>
      <li>🎁 Special offers and early access to new collections</li>
      <li>📦 Fast and reliable delivery</li>
      <li>💳 Secure payment options</li>
    </ul>
    <a href="${WEBSITE_URL}/shop" class="button">Start Shopping</a>
    <div class="divider"></div>
    <p>If you have any questions, our support team is always here to help.</p>
    <p>Best regards,<br>The ${BRAND_NAME} Team</p>
  `;

  return sendEmail({
    to: email,
    subject: `Welcome to ${BRAND_NAME}!`,
    html: emailTemplate(content, `Welcome to ${BRAND_NAME}! Start your fashion journey today.`),
  });
}

// Order Confirmation Email
export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  orderDetails: {
    items: Array<{ name: string; quantity: number; price: number; image?: string }>;
    subtotal: number;
    shipping: number;
    total: number;
    shippingAddress: {
      name: string;
      address: string;
      city: string;
      state: string;
      phone: string;
    };
  }
) {
  const itemsHtml = orderDetails.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 10px;">` : ''}
        <strong>${item.name}</strong>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: center;">×${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">₦${item.price.toLocaleString()}</td>
    </tr>
  `
    )
    .join('');

  const content = `
    <h2>Order Confirmed! 🎉</h2>
    <p>Hi ${orderDetails.shippingAddress.name},</p>
    <p>Thank you for your order! We've received your purchase and we're getting it ready for shipment.</p>
    
    <div class="order-details">
      <p><strong>Order Number:</strong> #${orderNumber}</p>
      <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>

    <h3>Order Items</h3>
    <table style="width: 100%; border-collapse: collapse;">
      ${itemsHtml}
      <tr>
        <td colspan="2" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
        <td style="padding: 10px; text-align: right;">₦${orderDetails.subtotal.toLocaleString()}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
        <td style="padding: 10px; text-align: right;">₦${orderDetails.shipping.toLocaleString()}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 15px 10px; text-align: right;"><strong style="font-size: 18px;">Total:</strong></td>
        <td style="padding: 15px 10px; text-align: right;"><strong style="font-size: 18px;">₦${orderDetails.total.toLocaleString()}</strong></td>
      </tr>
    </table>

    <h3>Shipping Address</h3>
    <div class="order-details">
      <p>
        ${orderDetails.shippingAddress.name}<br>
        ${orderDetails.shippingAddress.address}<br>
        ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state}<br>
        ${orderDetails.shippingAddress.phone}
      </p>
    </div>

    <a href="${WEBSITE_URL}/account/orders/${orderNumber}" class="button">Track Your Order</a>

    <div class="divider"></div>
    <p>You will receive another email when your order ships. If you have any questions, please contact our support team.</p>
    <p>Best regards,<br>The ${BRAND_NAME} Team</p>
  `;

  return sendEmail({
    to: email,
    subject: `Order Confirmed - #${orderNumber}`,
    html: emailTemplate(content, `Your order #${orderNumber} has been confirmed!`),
  });
}

// Order Processing Email
export async function sendOrderProcessingEmail(email: string, orderNumber: string, customerName: string) {
  const content = `
    <h2>Your Order is Being Processed 📦</h2>
    <p>Hi ${customerName},</p>
    <p>Great news! Your order <strong>#${orderNumber}</strong> is now being prepared for shipment.</p>
    
    <div class="order-details">
      <p><strong>Status:</strong> Processing</p>
      <p><strong>Order Number:</strong> #${orderNumber}</p>
      <p><strong>Estimated Processing Time:</strong> 1-2 business days</p>
    </div>

    <p>Our team is carefully packaging your items to ensure they arrive in perfect condition.</p>
    <a href="${WEBSITE_URL}/account/orders/${orderNumber}" class="button">View Order Details</a>

    <div class="divider"></div>
    <p>You'll receive a shipping confirmation email once your order is on its way.</p>
    <p>Best regards,<br>The ${BRAND_NAME} Team</p>
  `;

  return sendEmail({
    to: email,
    subject: `Order Processing - #${orderNumber}`,
    html: emailTemplate(content, `Your order #${orderNumber} is being prepared`),
  });
}

// Order Shipped Email
export async function sendOrderShippedEmail(
  email: string,
  orderNumber: string,
  customerName: string,
  trackingNumber?: string,
  carrier?: string
) {
  const trackingInfo = trackingNumber
    ? `
    <div class="order-details">
      <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
      ${carrier ? `<p><strong>Carrier:</strong> ${carrier}</p>` : ''}
      <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
    </div>
  `
    : '';

  const content = `
    <h2>Your Order Has Shipped! 🚚</h2>
    <p>Hi ${customerName},</p>
    <p>Exciting news! Your order <strong>#${orderNumber}</strong> is on its way to you.</p>
    
    ${trackingInfo}

    <p>Your package should arrive within 3-5 business days. You can track your shipment using the tracking number above.</p>
    
    ${trackingNumber ? `<a href="${WEBSITE_URL}/track/${trackingNumber}" class="button">Track Your Package</a>` : ''}

    <div class="divider"></div>
    <p>If you have any concerns about your delivery, please don't hesitate to contact us.</p>
    <p>Best regards,<br>The ${BRAND_NAME} Team</p>
  `;

  return sendEmail({
    to: email,
    subject: `Order Shipped - #${orderNumber}`,
    html: emailTemplate(content, `Your order #${orderNumber} is on the way!`),
  });
}

// Order Delivered Email
export async function sendOrderDeliveredEmail(email: string, orderNumber: string, customerName: string) {
  const content = `
    <h2>Your Order Has Been Delivered! ✅</h2>
    <p>Hi ${customerName},</p>
    <p>Your order <strong>#${orderNumber}</strong> has been successfully delivered!</p>
    
    <div class="order-details">
      <p><strong>Status:</strong> Delivered</p>
      <p><strong>Delivery Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>

    <p>We hope you love your new items! If you're happy with your purchase, we'd love to hear from you.</p>
    
    <a href="${WEBSITE_URL}/account/orders/${orderNumber}/review" class="button">Leave a Review</a>

    <div class="divider"></div>
    <p><strong>Need help?</strong></p>
    <p>If there's any issue with your order, please contact us within 7 days and we'll be happy to assist you.</p>
    <p>Best regards,<br>The ${BRAND_NAME} Team</p>
  `;

  return sendEmail({
    to: email,
    subject: `Order Delivered - #${orderNumber}`,
    html: emailTemplate(content, `Your order #${orderNumber} has arrived!`),
  });
}

// Password Reset Email
export async function sendPasswordResetEmail(email: string, resetToken: string, firstName?: string) {
  const resetUrl = `${WEBSITE_URL}/reset-password?token=${resetToken}`;
  
  const content = `
    <h2>Reset Your Password 🔐</h2>
    <p>Hi ${firstName || 'there'},</p>
    <p>We received a request to reset your password for your ${BRAND_NAME} account.</p>
    
    <div class="order-details">
      <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
    </div>

    <a href="${resetUrl}" class="button">Reset Password</a>

    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #666666;">${resetUrl}</p>

    <div class="divider"></div>
    <p><strong>Didn't request this?</strong></p>
    <p>If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.</p>
    <p>Best regards,<br>The ${BRAND_NAME} Team</p>
  `;

  return sendEmail({
    to: email,
    subject: `Reset Your ${BRAND_NAME} Password`,
    html: emailTemplate(content, 'Reset your password securely'),
  });
}

// Low Stock Alert (Admin)
export async function sendLowStockAlertEmail(
  adminEmail: string,
  products: Array<{ name: string; sku: string; currentStock: number; threshold: number }>
) {
  const productsHtml = products
    .map(
      (product) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${product.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${product.sku}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: center; color: #d32f2f; font-weight: bold;">${product.currentStock}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: center;">${product.threshold}</td>
    </tr>
  `
    )
    .join('');

  const content = `
    <h2>⚠️ Low Stock Alert</h2>
    <p>The following products are running low on stock and need attention:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="padding: 10px; text-align: left;">Product</th>
          <th style="padding: 10px; text-align: left;">SKU</th>
          <th style="padding: 10px; text-align: center;">Current Stock</th>
          <th style="padding: 10px; text-align: center;">Threshold</th>
        </tr>
      </thead>
      <tbody>
        ${productsHtml}
      </tbody>
    </table>

    <a href="${WEBSITE_URL}/admin/inventory" class="button">Manage Inventory</a>

    <div class="divider"></div>
    <p>Please restock these items to avoid stockouts.</p>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `Low Stock Alert - ${products.length} Product${products.length > 1 ? 's' : ''}`,
    html: emailTemplate(content, `${products.length} products need restocking`),
  });
}

export { sendEmail };
