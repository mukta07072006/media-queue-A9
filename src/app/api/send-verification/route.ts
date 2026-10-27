import { VerificationEmail } from '@/emails/VerificationEmails';
import { getResendClient } from '@/lib/email';

export async function POST(req: Request) {
  const { email, verificationUrl } = await req.json();
  let resend;
  try {
    resend = getResendClient();
  } catch (error) {
    console.error("Email service configuration error:", error);
    return Response.json(
      { error: "Email service is not configured" },
      { status: 500 },
    );
  }

  const { data, error } = await resend.emails.send({
    from: 'EduFlex <auth@skillzlab.online>', 
    to: [email],
    subject: 'Confirm your email - EduFlex',
    react: VerificationEmail({ verificationUrl }),
  });

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({ data });
}