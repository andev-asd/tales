import { redirect, notFound } from 'next/navigation';
import { getCurrentSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { buildPaymentFormData } from '@/src/lib/wayforpay';
import { WayForPayForm } from './wayforpay-form';

export const dynamic = 'force-dynamic';

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ failed?: string }>;
}) {
  // 1. Auth
  const session = await getCurrentSession().catch(() => null);

  if (!session?.user?.email) {
    redirect('/login');
  }

  // 2. Resolve appUser
  const appUser = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!appUser) {
    notFound();
  }

  const { orderId } = await params;
  const { failed } = await searchParams;

  // 3. Load order (include tale + payment)
  const order = await db.order.findFirst({
    where: { id: orderId, customerId: appUser.id },
    select: {
      id: true,
      tale: { select: { title: true, price: true } },
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Tale must exist and have a price for payment to proceed
  if (!order.tale?.price) {
    notFound();
  }

  // 4. If already approved, redirect to order page
  if (order.payment?.status === 'APPROVED') {
    redirect(`/orders/${orderId}`);
  }

  // 7. Failed state UI — show before upsert so DECLINED/EXPIRED status is preserved in DB
  // The "Retry" link reloads without ?failed=1, triggering the upsert only when user retries.
  if (failed) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16 md:px-8">
        <h1 className="font-display text-5xl text-app-text">Оплата не вдалась</h1>
        <p className="mt-4 text-app-secondary">
          Спробуйте ще раз або зверніться до підтримки.
        </p>
        <a
          href={`/payment/${orderId}`}
          className="mt-6 inline-block rounded-[var(--radius-md)] bg-app-accent px-6 py-3 text-white"
        >
          Спробувати ще раз
        </a>
      </section>
    );
  }

  // 5. Upsert payment record (only when proceeding to payment, not on failure screen)
  await db.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      orderReference: orderId,
      amount: order.tale.price,
    },
    update: {
      status: 'PENDING',
      transactionId: null,
    },
  });

  // 6. Build WayForPay form data
  const appUrl = process.env.APP_URL ?? 'http://localhost:3002';
  const merchantDomainName = new URL(appUrl).hostname;
  const serviceUrl = `${appUrl}/api/wayforpay/callback`;
  // WayForPay returns via POST redirect — use API routes to avoid Next.js Server Actions conflict
  const returnUrl = `${appUrl}/api/wayforpay/return`;
  const cancelUrl = `${appUrl}/api/wayforpay/cancel`;

  const merchantAccount = process.env.WAYFORPAY_MERCHANT_ACCOUNT ?? '';
  const secretKey = process.env.WAYFORPAY_SECRET_KEY ?? '';

  const formData = buildPaymentFormData(
    {
      orderId,
      amount: order.tale.price,
      productName: order.tale.title,
      merchantAccount,
      merchantDomainName,
      serviceUrl,
      returnUrl,
      cancelUrl,
    },
    secretKey
  );

  // 8. Auto-submit form
  return <WayForPayForm formData={formData} />;
}
