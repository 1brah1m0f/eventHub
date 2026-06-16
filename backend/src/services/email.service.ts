import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: 'login' | 'password_reset',
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const isReset = purpose === 'password_reset';
  const subject = isReset
    ? 'NextEvent — şifrə bərpası kodu'
    : 'NextEvent — giriş kodu';

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'NextEvent <onboarding@resend.dev>',
    to,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#4c1d95;margin:0 0 8px">NextEvent</h2>
        <p style="color:#374151;margin:0 0 24px">
          ${isReset
            ? 'Şifrənizi bərpa etmək üçün aşağıdakı kodu daxil edin:'
            : 'Hesabınıza daxil olmaq üçün aşağıdakı kodu daxil edin:'}
        </p>
        <div style="background:#f5f3ff;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#5b21b6">${code}</span>
        </div>
        <p style="color:#9ca3af;font-size:13px;margin:0">
          Kod 10 dəqiqə ərzində etibarlıdır. Bu sorğunu siz göndərməmisinizsə, bu e-poçtu nəzərə almayın.
        </p>
      </div>
    `,
  });

  if (error) throw new Error(error.message);
}
