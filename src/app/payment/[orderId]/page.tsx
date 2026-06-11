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
      <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl text-app-text">Оплата не вдалась</h1>
            <p className="text-sm text-app-secondary">
              Щось пішло не так під час оплати. Спробуйте ще раз або зверніться до підтримки.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={`/payment/${orderId}`}
              className="inline-flex w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-6 py-3.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
            >
              Спробувати ще раз
            </a>
            <a
              href="/orders"
              className="inline-flex w-full items-center justify-center rounded-[var(--radius-md)] border border-app-border px-6 py-3 text-[15px] text-app-secondary transition-colors hover:text-app-text"
            >
              Мої замовлення
            </a>
          </div>
        </div>
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
