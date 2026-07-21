
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, text, react }) {
  try {
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