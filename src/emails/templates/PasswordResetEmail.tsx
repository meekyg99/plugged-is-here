interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export function renderPasswordResetEmail({ userName, resetUrl, expiresInMinutes = 60 }: PasswordResetEmailProps): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
        <p>Hi ${userName || 'there'},</p>
        <p>We received a request to reset the password for your PLUGGED account. Click the button below to choose a new password.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${resetUrl}" class="btn">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p class="muted" style="word-break: break-all;">${resetUrl}</p>
        <div class="warning-box">
          <p style="margin:0;"><strong>Expires in ${expiresInMinutes} minutes.</strong></p>
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
  `.trim();
}
