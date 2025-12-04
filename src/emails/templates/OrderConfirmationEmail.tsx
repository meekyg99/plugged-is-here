import React from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  estimatedDelivery?: string;
  trackingUrl?: string;
}

export function renderOrderConfirmationEmail(props: OrderConfirmationEmailProps): string {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ${props.orderNumber}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
      .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
      .logo { font-size: 32px; font-weight: bold; color: #fff; }
      .content { padding: 40px 30px; }
      .footer { background: #f8f9fa; padding: 30px; text-align: center; font-size: 14px; color: #6c757d; border-top: 1px solid #e9ecef; }
      .btn { display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
      h1 { color: #1a1a1a; font-size: 28px; margin: 0 0 20px; font-weight: 700; }
      h2 { color: #333; font-size: 20px; margin: 30px 0 15px; font-weight: 600; }
      p { margin: 0 0 15px; color: #555; }
      .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .order-info-row { display: flex; justify-content: space-between; padding: 8px 0; }
      .order-info-label { font-weight: 600; color: #333; }
      .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      .items-table th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; color: #333; border-bottom: 2px solid #dee2e6; }
      .items-table td { padding: 15px 12px; border-bottom: 1px solid #e9ecef; }
      .item-image { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; }
      .totals { margin: 20px 0; }
      .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
      .totals-row.total { font-size: 20px; font-weight: 700; color: #667eea; padding-top: 15px; border-top: 2px solid #dee2e6; margin-top: 10px; }
      .address-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .highlight-box { background: #e7f3ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
      .social { margin: 20px 0; }
      .social a { display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none; }
    </style>
  </head>
  <body>
    <div style="display:none;max-height:0;overflow:hidden;">Your order ${props.orderNumber} has been confirmed!</div>
    <div class="wrapper">
      <div class="header">
        <div class="logo">⚡ PLUGGED</div>
      </div>
      <div class="content">
        <h1>Thank You for Your Order! 🎉</h1>
        <p>Hi ${props.customerName},</p>
        <p>We've received your order and it's being processed. You'll receive another email when your order ships.</p>
        
        <div class="order-info">
          <div class="order-info-row">
            <span class="order-info-label">Order Number:</span>
            <span>#${props.orderNumber}</span>
          </div>
          <div class="order-info-row">
            <span class="order-info-label">Order Date:</span>
            <span>${props.orderDate}</span>
          </div>
          ${props.estimatedDelivery ? `
          <div class="order-info-row">
            <span class="order-info-label">Estimated Delivery:</span>
            <span>${props.estimatedDelivery}</span>
          </div>
          ` : ''}
        </div>

        ${props.trackingUrl ? `
        <div style="text-align:center;margin:30px 0;">
          <a href="${props.trackingUrl}" class="btn">Track Your Order</a>
        </div>
        ` : ''}

        <h2>Order Details</h2>
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${props.items.map(item => `
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:15px;">
                  ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="item-image">` : ''}
                  <span>${item.name}</span>
                </div>
              </td>
              <td style="text-align:center;">${item.quantity}</td>
              <td style="text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(props.subtotal)}</span>
          </div>
          <div class="totals-row">
            <span>Shipping:</span>
            <span>${formatCurrency(props.shipping)}</span>
          </div>
          <div class="totals-row">
            <span>Tax:</span>
            <span>${formatCurrency(props.tax)}</span>
          </div>
          <div class="totals-row total">
            <span>Total:</span>
            <span>${formatCurrency(props.total)}</span>
          </div>
        </div>

        <h2>Shipping Address</h2>
        <div class="address-box">
          <p style="margin:0;">
            ${props.customerName}<br>
            ${props.shippingAddress.street}<br>
            ${props.shippingAddress.city}, ${props.shippingAddress.state} ${props.shippingAddress.zip}<br>
            ${props.shippingAddress.country}
          </p>
        </div>

        <div class="highlight-box">
          <p style="margin:0;"><strong>💡 Need Help?</strong></p>
          <p style="margin:5px 0 0 0;">If you have any questions about your order, please contact us at <a href="mailto:support@plugged.com" style="color:#667eea;">support@plugged.com</a> or reply to this email with your order number.</p>
        </div>

        <p style="margin-top:30px;">
          Thank you for shopping with us!<br>
          <strong>The PLUGGED Team</strong>
        </p>
      </div>
      <div class="footer">
        <div class="social">
          <a href="https://facebook.com/plugged">Facebook</a>
          <a href="https://twitter.com/plugged">Twitter</a>
          <a href="https://instagram.com/plugged">Instagram</a>
        </div>
        <p><strong>PLUGGED</strong><br>Your trusted online store<br><a href="mailto:support@plugged.com" style="color:#667eea;">support@plugged.com</a></p>
        <p style="font-size:12px;color:#999;margin-top:20px;">You're receiving this email because you placed an order with us.</p>
      </div>
    </div>
  </body>
</html>
  `.trim();
}
