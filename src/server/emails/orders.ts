import { resend, FROM_EMAIL } from '@/src/lib/resend';

const STATUS_SUBJECTS: Partial<Record<string, string>> = {
  IN_PROGRESS: 'Ваше замовлення взято у роботу',
  AWAITING_CUSTOMER: 'Потрібна ваша відповідь — замовлення',
  COMPLETED: 'Ваше замовлення готове!',
  CANCELLED: 'Замовлення скасовано',
};

const STATUS_BODIES: Partial<Record<string, string>> = {
  IN_PROGRESS: 'Ваше замовлення прийнято у роботу. Ми вже працюємо над вашою казкою та повідомимо вас про готовність.',
  AWAITING_CUSTOMER: 'Нам потрібна ваша відповідь або додаткова інформація. Будь ласка, зайдіть у ваш особистий кабінет та перегляньте переписку.',
  COMPLETED: 'Ваша казка готова! Дякуємо за замовлення. Зайдіть у особистий кабінет, щоб переглянути результат.',
  CANCELLED: 'На жаль, ваше замовлення було скасовано. Якщо у вас є питання, будь ласка, зверніться до нас.',
};

type OrderForConfirmation = {
  id: string;
  customer: { email: string; name: string | null };
  tale: { title: string } | null;
  delivery: { recipientName: string; city: string } | null;
};

type OrderForStatus = {
  id: string;
  customer: { email: string };
};

type OrderForShipping = {
  id: string;
  customer: { email: string; name: string | null };
  delivery: { service: string; recipientName: string } | null;
};

const DELIVERY_SERVICE_LABELS: Record<string, string> = {
  NOVA_POSHTA: 'Нова Пошта',
  UKRPOSHTA: 'Укрпошта',
};

const CARRIER_TRACKING_URLS: Record<string, string> = {
  NOVA_POSHTA: 'https://novaposhta.ua/tracking/',
  UKRPOSHTA: 'https://track.ukrposhta.ua/',
};

export async function sendOrderConfirmationEmail(order: OrderForConfirmation): Promise<void> {
  const shortId = order.id.slice(0, 8).toUpperCase();
  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customer.email,
    subject: `Замовлення #${shortId} прийнято — Своя Казка`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 16px;color:#2d2d2d">
        <h1 style="font-size:24px;margin-bottom:8px">Своя Казка</h1>
        <p>Вітаємо${order.customer.name ? `, ${order.customer.name}` : ''}! Ваше замовлення успішно оформлено.</p>
        <div style="background:#f9f5f0;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px"><strong>Номер замовлення:</strong> #${shortId}</p>
          ${order.tale ? `<p style="margin:0 0 8px"><strong>Казка:</strong> ${order.tale.title}</p>` : ''}
          ${order.delivery ? `<p style="margin:0"><strong>Отримувач:</strong> ${order.delivery.recipientName}, ${order.delivery.city}</p>` : ''}
        </div>
        <p>Ми зв'яжемося з вами найближчим часом. Статус замовлення можна відстежити у вашому особистому кабінеті.</p>
        <p style="font-size:13px;color:#888;margin-top:24px">Своя Казка — терапевтичні казки для дітей</p>
      </div>
    `,
  });
}

export async function sendOrderStatusEmail(order: OrderForStatus, status: string): Promise<void> {
  const subject = STATUS_SUBJECTS[status];
  const body = STATUS_BODIES[status];
  if (!subject || !body) return;

  const shortId = order.id.slice(0, 8).toUpperCase();
  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customer.email,
    subject: `${subject} #${shortId} — Своя Казка`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 16px;color:#2d2d2d">
        <h1 style="font-size:24px;margin-bottom:8px">Своя Казка</h1>
        <p style="margin-bottom:16px">${body}</p>
        <p style="font-size:13px;color:#888">Замовлення: #${shortId}</p>
        <p style="font-size:13px;color:#888;margin-top:24px">Своя Казка — терапевтичні казки для дітей</p>
      </div>
    `,
  });
}

export async function sendShippingEmail(order: OrderForShipping, trackingNumber: string): Promise<void> {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const serviceKey = order.delivery?.service ?? 'NOVA_POSHTA';
  const serviceLabel = DELIVERY_SERVICE_LABELS[serviceKey] ?? serviceKey;
  const trackingUrl = CARRIER_TRACKING_URLS[serviceKey] ?? '';

  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customer.email,
    subject: `Ваша книга відправлена! ТТН: ${trackingNumber} — Своя Казка`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 16px;color:#2d2d2d">
        <h1 style="font-size:24px;margin-bottom:8px">Своя Казка</h1>
        <p>Вітаємо${order.customer.name ? `, ${order.customer.name}` : ''}! Ваша книга відправлена.</p>
        <div style="background:#f9f5f0;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px"><strong>Служба доставки:</strong> ${serviceLabel}</p>
          <p style="margin:0;font-size:20px"><strong>ТТН: ${trackingNumber}</strong></p>
        </div>
        ${trackingUrl ? `
        <a href="${trackingUrl}${trackingNumber}" style="display:inline-block;background:#b86549;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;margin-bottom:24px">
          Відстежити посилку
        </a>
        ` : ''}
        <p style="font-size:13px;color:#888">Замовлення: #${shortId}</p>
        <p style="font-size:13px;color:#888;margin-top:24px">Своя Казка — терапевтичні казки для дітей</p>
      </div>
    `,
  });
}
