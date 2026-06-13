import { resend, FROM_EMAIL } from '@/src/lib/resend';

export async function sendVerificationEmail(to: string, url: string): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Підтвердіть вашу електронну адресу — Своя Казка',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 16px;color:#2d2d2d">
        <h1 style="font-size:24px;margin-bottom:8px">Своя Казка</h1>
        <p style="margin-bottom:24px">Дякуємо за реєстрацію! Будь ласка, підтвердіть вашу електронну адресу, натиснувши кнопку нижче.</p>
        <a href="${url}" style="display:inline-block;background:#c0714a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;margin-bottom:24px">
          Підтвердити email
        </a>
        <p style="font-size:13px;color:#888">Якщо ви не реєструвалися на Своя Казка — просто ігноруйте цей лист.</p>
        <p style="font-size:13px;color:#888">Посилання дійсне протягом 1 години.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, url: string): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Скидання пароля — Своя Казка',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 16px;color:#2d2d2d">
        <h1 style="font-size:24px;margin-bottom:8px">Своя Казка</h1>
        <p style="margin-bottom:24px">Ми отримали запит на скидання пароля для вашого акаунта. Натисніть кнопку нижче, щоб створити новий пароль.</p>
        <a href="${url}" style="display:inline-block;background:#c0714a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;margin-bottom:24px">
          Скинути пароль
        </a>
        <p style="font-size:13px;color:#888">Якщо ви не запитували скидання пароля — просто ігноруйте цей лист. Ваш пароль не зміниться.</p>
        <p style="font-size:13px;color:#888">Посилання дійсне протягом 1 години.</p>
      </div>
    `,
  });
}
