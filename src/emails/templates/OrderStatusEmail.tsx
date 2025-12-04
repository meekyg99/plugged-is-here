interface OrderStatusEmailProps {
  orderNumber: string;
  customerName: string;
  status: 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  estimatedDelivery?: string;
  deliveredDate?: string;
}

export function renderOrderStatusEmail(props: OrderStatusEmailProps): string {
  const getStatusConfig = () => {
    switch (props.status) {
      case 'processing':
        return {
          emoji: '📦',
          title: 'Your Order is Being Prepared',
          message: 'Great news! We\'re currently processing your order and preparing it for shipment.',
          highlight: 'Your order is currently being carefully packed and will ship soon.',
        };
      case 'shipped':
        return {
          emoji: '🚚',
          title: 'Your Order Has Been Shipped!',
          message: 'Exciting news! Your order is on its way to you.',
          highlight: props.trackingNumber 
            ? `Tracking Number: <strong>${props.trackingNumber}</strong>${props.carrier ? ` (${props.carrier})` : ''}`
            : 'Your order is on its way!',
        };
      case 'delivered':
        return {
          emoji: '✅',
          title: 'Your Order Has Been Delivered!',
          message: 'Your order has been successfully delivered.',
          highlight: props.deliveredDate 
            ? `Delivered on ${props.deliveredDate}`
            : 'Your package has arrived!',
        };
    }
  };

  const config = getStatusConfig();

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Update - ${props.orderNumber}</title>
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
      .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .highlight-box { background: #e7f3ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; text-align: center; font-size: 18px; }
      .status-icon { font-size: 64px; margin: 20px 0; }
      .social { margin: 20px 0; }
      .social a { display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none; }
    </style>
  </head>
  <body>
    <div style="display:none;max-height:0;overflow:hidden;">Order ${props.orderNumber} - ${config.title}</div>
    <div class="wrapper">
      <div class="header">
        <div class="logo">⚡ PLUGGED</div>
      </div>
      <div class="content">
        <div style="text-align:center;">
          <div class="status-icon">${config.emoji}</div>
          <h1>${config.title}</h1>
        </div>
        
        <p>Hi ${props.customerName},</p>
        <p>${config.message}</p>
        
        <div class="order-info">
          <p style="margin:0;"><strong>Order Number:</strong> #${props.orderNumber}</p>
          ${props.estimatedDelivery ? `<p style="margin:10px 0 0 0;"><strong>Estimated Delivery:</strong> ${props.estimatedDelivery}</p>` : ''}
        </div>

        <div class="highlight-box">
          ${config.highlight}
        </div>

        ${props.trackingUrl ? `
        <div style="text-align:center;margin:30px 0;">
          <a href="${props.trackingUrl}" class="btn">Track Your Package</a>
        </div>
        ` : ''}

        ${props.status === 'delivered' ? `
        <div style="background:#f8f9fa;padding:25px;border-radius:8px;margin:30px 0;text-align:center;">
          <p style="margin:0 0 15px 0;font-size:18px;"><strong>How was your experience?</strong></p>
          <p style="margin:0 0 20px 0;color:#666;">We'd love to hear your feedback!</p>
          <a href="https://plugged.com/orders/${props.orderNumber}/review" class="btn">Leave a Review</a>
        </div>
        ` : ''}

        <p style="margin-top:30px;">
          If you have any questions, feel free to contact us at <a href="mailto:support@plugged.com" style="color:#667eea;">support@plugged.com</a>.
        </p>

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
