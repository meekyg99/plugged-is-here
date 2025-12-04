interface Admin2FAEmailProps {
  code: string;
  expiresInMinutes: number;
  ipAddress?: string;
  userAgent?: string;
}

export function renderAdmin2FAEmail(props: Admin2FAEmailProps): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - Verification Code</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
      .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
      .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 20px; text-align: center; }
      .logo { font-size: 32px; font-weight: bold; color: #fff; }
      .content { padding: 40px 30px; }
      .footer { background: #f8f9fa; padding: 30px; text-align: center; font-size: 14px; color: #6c757d; border-top: 1px solid #e9ecef; }
      h1 { color: #1a1a1a; font-size: 28px; margin: 0 0 20px; font-weight: 700; }
      p { margin: 0 0 15px; color: #555; }
      .code-box { background: #f8f9fa; border: 2px dashed #dc2626; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center; }
      .code { font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #dc2626; font-family: 'Courier New', monospace; }
      .warning-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; }
      .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #666; }
    </style>
  </head>
  <body>
    <div style="display:none;max-height:0;overflow:hidden;">Your admin verification code: ${props.code}</div>
    <div class="wrapper">
      <div class="header">
        <div class="logo">🔐 ADMIN ACCESS</div>
      </div>
      <div class="content">
        <h1>Admin Verification Code</h1>
        
        <p>A login attempt was made to access the admin dashboard.</p>
        
        <div class="code-box">
          <p style="margin:0 0 10px 0;font-size:14px;color:#666;">Your verification code is:</p>
          <div class="code">${props.code}</div>
          <p style="margin:15px 0 0 0;font-size:14px;color:#666;">Valid for ${props.expiresInMinutes} minutes</p>
        </div>

        <div class="warning-box">
          <p style="margin:0;"><strong>⚠️ Security Alert</strong></p>
          <p style="margin:10px 0 0 0;">If you didn't attempt to log in to the admin dashboard, please ignore this email and contact your security team immediately.</p>
        </div>

        ${props.ipAddress || props.userAgent ? `
        <div class="info-box">
          <p style="margin:0 0 10px 0;"><strong>Login Details:</strong></p>
          ${props.ipAddress ? `<p style="margin:5px 0;">IP Address: ${props.ipAddress}</p>` : ''}
          ${props.userAgent ? `<p style="margin:5px 0;">Browser: ${props.userAgent}</p>` : ''}
        </div>
        ` : ''}

        <p style="margin-top:30px;">
          <strong>Security Tips:</strong>
        </p>
        <ul style="color:#555;line-height:1.8;">
          <li>Never share this code with anyone</li>
          <li>PLUGGED staff will never ask for your verification code</li>
          <li>This code expires in ${props.expiresInMinutes} minutes</li>
          <li>If you didn't request this code, someone may be trying to access your account</li>
        </ul>

        <p style="margin-top:30px;">
          Stay secure,<br>
          <strong>The PLUGGED Security Team</strong>
        </p>
      </div>
      <div class="footer">
        <p><strong>PLUGGED Admin Portal</strong><br><a href="mailto:security@plugged.com" style="color:#dc2626;">security@plugged.com</a></p>
        <p style="font-size:12px;color:#999;margin-top:20px;">This is an automated security email. Please do not reply.</p>
      </div>
    </div>
  </body>
</html>
  `.trim();
}
