import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import {
  verifyCallbackSignature,
  buildSignature,
  WayForPayCallbackWithSignature,
} from '@/src/lib/wayforpay';
import { PaymentStatus, OrderStatus } from '@prisma/client';

// WayForPay extends the callback body with transactionId (their internal transaction identifier)
type WayForPayCallbackBody = WayForPayCallbackWithSignature & {
  transactionId?: string;
};

export async function POST(req: NextRequest) {
  // Guard: secret must be configured — empty key allows signature bypass
  const secret = process.env.WAYFORPAY_SECRET_KEY;
  const merchantAccount = process.env.WAYFORPAY_MERCHANT_ACCOUNT ?? '';

  if (!secret) {
    console.error('WAYFORPAY_SECRET_KEY is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  // Parse JSON body — malformed body returns 400
  let body: WayForPayCallbackBody;
  try {
    body = (await req.json()) as WayForPayCallbackBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!verifyCallbackSignature(body, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const statusMap: Record<string, PaymentStatus> = {
    Approved: PaymentStatus.APPROVED,
    Declined: PaymentStatus.DECLINED,
    Expired: PaymentStatus.EXPIRED,
  };
  const paymentStatus = statusMap[body.transactionStatus] ?? PaymentStatus.PENDING;

  try {
    await db.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { orderReference: body.orderReference },
        data: {
          status: paymentStatus,
          transactionId: body.transactionId ?? null,
        },
      });

      if (paymentStatus === PaymentStatus.APPROVED) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.IN_REVIEW },
        });
      }
    });
  } catch (err) {
    console.error('WayForPay callback DB error:', err);
    // Return 500 so WayForPay retries. Do NOT acknowledge an order we failed to persist.
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  const time = Math.floor(Date.now() / 1000);
  const responseSig = buildSignature(
    [merchantAccount, body.orderReference, 'accept', String(time)],
    secret,
  );

  return NextResponse.json({
    orderReference: body.orderReference,
    status: 'accept',
    time,
    signature: responseSig,
  });
}
