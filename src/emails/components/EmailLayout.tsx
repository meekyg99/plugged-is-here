import React from 'react';

interface EmailLayoutProps {
  previewText?: string;
  children: React.ReactNode;
}

export function EmailLayout({ previewText, children }: EmailLayoutProps) {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .email-logo {
            font-size: 32px;
            font-weight: bold;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: -0.5px;
          }
          .email-content {
            padding: 40px 30px;
          }
          .email-footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
          }
          .btn {
            display: inline-block;
            padding: 12px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .btn:hover {
            opacity: 0.9;
          }
          h1 {
            color: #1a1a1a;
            font-size: 28px;
            margin: 0 0 20px 0;
            font-weight: 700;
          }
          h2 {
            color: #333;
            font-size: 20px;
            margin: 30px 0 15px 0;
            font-weight: 600;
          }
          p {
            margin: 0 0 15px 0;
            color: #555;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .email-content {
              padding: 30px 20px !important;
            }
            h1 {
              font-size: 24px !important;
            }
          }
        `}</style>
      </head>
      <body>
        {previewText && (
          <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
            {previewText}
          </div>
        )}
        <div className="email-wrapper">
          <div className="email-header">
            <div className="email-logo">⚡ PLUGGED</div>
          </div>
          <div className="email-content">{children}</div>
          <div className="email-footer">
            <div className="social-links">
              <a href="https://facebook.com/plugged">Facebook</a>
              <a href="https://twitter.com/plugged">Twitter</a>
              <a href="https://instagram.com/plugged">Instagram</a>
            </div>
            <p>
              <strong>PLUGGED</strong><br />
              Your trusted online store<br />
              <a href="mailto:support@plugged.com" style={{ color: '#667eea' }}>support@plugged.com</a>
            </p>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
              You're receiving this email because you have an account with us.<br />
              <a href="{{unsubscribeUrl}}" style={{ color: '#999' }}>Unsubscribe</a> | 
              <a href="{{preferencesUrl}}" style={{ color: '#999' }}>Email Preferences</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
