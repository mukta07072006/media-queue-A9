
import { Resend } from 'resend';

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new Resend(apiKey);
}

export async function sendEmail({ to, subject, text, react }) {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: 'EduFlex <auth@skillzlab.online>',
      to,
      subject,
      text,
      react,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}