// emails/VerificationEmail.tsx
import React from 'react';

interface VerificationEmailProps {
  verificationUrl: string;
}

export const VerificationEmail = ({ verificationUrl }: VerificationEmailProps) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <title>Confirm Your Email</title>
      </head>
      <body style={{ backgroundColor: '#f4fbf7', fontFamily: 'sans-serif', padding: '20px' }}>
        <table align="center" width="100%" style={{ maxWidth: '520px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '40px 32px' }}>
          <tbody>
            <tr>
              <td align="center">
                <h1 style={{ color: '#10b981' }}>EduFlex</h1>
                <h2>Confirm Your Email</h2>
                <p style={{ color: '#374151', fontSize: '15px' }}>
                  Click the button below to verify your email address and activate your account.
                </p>
                
             
                <a
                  href={verificationUrl}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    padding: '14px 32px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    fontWeight: 600,
                  }}
                >
                  Verify Email Address
                </a>

                <p style={{ marginTop: '24px', fontSize: '13px', color: '#6b7280' }}>
                  Or paste this link into your browser:
                </p>
                <a href={verificationUrl} style={{ color: '#059669', fontSize: '13px' }}>
                  {verificationUrl}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
};