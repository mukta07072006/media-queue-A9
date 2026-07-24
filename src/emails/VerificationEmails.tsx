import React from 'react';

interface VerificationEmailProps {
  verificationUrl: string;
}

export const VerificationEmail = ({ verificationUrl }: VerificationEmailProps) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Confirm Your Email</title>
      </head>
      <body style={main}>
        <table align="center" width="100%" border={0} cellPadding="0" cellSpacing="0" style={container}>
          <tbody>
            <tr>
              <td align="center">
                {/* Brand Header */}
                <h1 style={logo}>EduFlex</h1>

                {/* Hero Icon */}
                <div style={iconContainer}>
                  <span style={icon}>✉️</span>
                </div>

                {/* Main Content */}
                <h2 style={heading}>Verify your email address</h2>
                <p style={text}>
                  Welcome to EduFlex! We are excited to have you on board. Please click the button below to verify your email address and securely activate your account.
                </p>

                {/* CTA Button */}
                <table width="100%" border={0} cellPadding="0" cellSpacing="0" style={{ margin: '32px 0' }}>
                  <tbody>
                    <tr>
                      <td align="center">
                        <a href={verificationUrl} target="_blank" rel="noreferrer" style={button}>
                          Verify Email Address
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Divider */}
                <hr style={divider} />

                {/* Fallback & Footer */}
                <p style={footerText}>
                  If the button doesn't work, copy and paste this link into your web browser:
                </p>
                <a href={verificationUrl} style={fallbackLink}>
                  {verificationUrl}
                </a>
                
                <p style={disclaimer}>
                  If you didn't create an account with EduFlex, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
};

// --- Design System / Styles ---

const main = {
  backgroundColor: '#f9fafb', // Tailwind Gray-50
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  padding: '40px 20px',
  margin: '0',
};

const container = {
  maxWidth: '560px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb', // Tailwind Gray-200
  borderRadius: '12px',
  padding: '48px 40px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
};

const logo = {
  color: '#10b981', // Tailwind Emerald-500
  fontSize: '28px',
  fontWeight: '800',
  letterSpacing: '-1px',
  margin: '0 0 32px 0',
  textAlign: 'center' as const,
};

const iconContainer = {
  backgroundColor: '#d1fae5', // Tailwind Emerald-100
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  display: 'inline-block',
  lineHeight: '64px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const icon = {
  fontSize: '28px',
};

const heading = {
  color: '#111827', // Tailwind Gray-900
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const text = {
  color: '#4b5563', // Tailwind Gray-600
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#10b981', // Tailwind Emerald-500
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 32px',
  borderRadius: '8px',
  display: 'inline-block',
};

const divider = {
  borderTop: '1px solid #e5e7eb',
  borderBottom: 'none',
  margin: '32px 0',
};

const footerText = {
  color: '#6b7280', // Tailwind Gray-500
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
};

const fallbackLink = {
  color: '#10b981',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  display: 'block',
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const disclaimer = {
  color: '#9ca3af', // Tailwind Gray-400
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0',
  textAlign: 'center' as const,
};