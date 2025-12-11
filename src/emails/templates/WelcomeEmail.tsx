import React from 'react';
import { EmailLayout } from '../components/EmailLayout';

interface WelcomeEmailProps {
  userName: string;
  shopUrl?: string;
}

export function WelcomeEmail({ userName, shopUrl = 'https://plugged.com' }: WelcomeEmailProps) {
  return (
    <EmailLayout previewText={`Welcome to PLUGGED, ${userName}!`}>
      <h1>Welcome to PLUGGED! 🎉</h1>
      
      <p>Hi {userName},</p>
      
      <p>
        We're thrilled to have you join the PLUGGED family! Your account has been successfully created, 
        and you're now ready to explore our amazing collection of products.
      </p>
      
      <h2>What's Next?</h2>
      
      <p>
        <strong>✨ Explore Our Collection:</strong> Browse through thousands of products carefully curated just for you.
      </p>
      
      <p>
        <strong>💰 Exclusive Deals:</strong> As a member, you'll get access to special promotions and early bird offers.
      </p>
      
      <p>
        <strong>🚚 Fast Shipping:</strong> Enjoy quick and reliable delivery right to your doorstep.
      </p>
      
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a href={shopUrl} className="btn">
          Start Shopping Now
        </a>
      </div>
      
      <p>
        If you have any questions, our support team is always here to help. Just reply to this email or 
        contact us at <a href="mailto:info@pluggedby212.shop" style={{ color: '#667eea' }}>info@pluggedby212.shop</a>.
      </p>
      
      <p style={{ marginTop: '30px' }}>
        Happy shopping!<br />
        <strong>The PLUGGED Team</strong>
      </p>
    </EmailLayout>
  );
}

export function renderWelcomeEmail(props: WelcomeEmailProps): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to PLUGGED</title>
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
      .social { margin: 20px 0; }
      .social a { display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none; }
    </style>
  </head>
  <body>
    <div style="display:none;max-height:0;overflow:hidden;">Welcome to PLUGGED, ${props.userName}!</div>
    <div class="wrapper">
      <div class="header">
        <div class="logo">⚡ PLUGGED</div>
      </div>
      <div class="content">
        <h1>Welcome to PLUGGED! 🎉</h1>
        <p>Hi ${props.userName},</p>
        <p>We're thrilled to have you join the PLUGGED family! Your account has been successfully created, and you're now ready to explore our amazing collection of products.</p>
        <h2>What's Next?</h2>
        <p><strong>✨ Explore Our Collection:</strong> Browse through thousands of products carefully curated just for you.</p>
        <p><strong>💰 Exclusive Deals:</strong> As a member, you'll get access to special promotions and early bird offers.</p>
        <p><strong>🚚 Fast Shipping:</strong> Enjoy quick and reliable delivery right to your doorstep.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${props.shopUrl || 'https://plugged.com'}" class="btn">Start Shopping Now</a>
        </div>
        <p>If you have any questions, our support team is always here to help. Just reply to this email or contact us at <a href="mailto:info@pluggedby212.shop" style="color:#667eea;">info@pluggedby212.shop</a>.</p>
        <p style="margin-top:30px;">Happy shopping!<br><strong>The PLUGGED Team</strong></p>
      </div>
      <div class="footer">
        <div class="social">
          <a href="https://facebook.com/plugged">Facebook</a>
          <a href="https://twitter.com/plugged">Twitter</a>
          <a href="https://instagram.com/plugged">Instagram</a>
        </div>
        <p><strong>PLUGGED</strong><br>Your trusted online store<br><a href="mailto:info@pluggedby212.shop" style="color:#667eea;">info@pluggedby212.shop</a></p>
        <p style="font-size:12px;color:#999;margin-top:20px;">You're receiving this email because you have an account with us.</p>
      </div>
    </div>
  </body>
</html>
  `.trim();
}
