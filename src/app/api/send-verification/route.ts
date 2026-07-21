// app/api/send-verification/route.ts
import { Resend } from 'resend';
import { VerificationEmail } from '@/emails/VerificationEmails';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, verificationUrl } = await req.json();

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