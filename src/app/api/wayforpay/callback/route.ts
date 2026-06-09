import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import {
  verifyCallbackSignature,
  buildSignature,
  WayForPayCallbackWithSignature,
} from '@/src/lib/wayforpay';
import { PaymentStatus, OrderStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as WayForPayCallbackWithSignature & {
    transactionId?: string;
  };

  const secret = process.env.WAYFORPAY_SECRET_KEY ?? '';
  const merchantAccount = process.env.WAYFORPAY_MERCHANT_ACCOUNT ?? '';

  if (!verifyCallbackSignature(body, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const statusMap: Record<string, PaymentStatus> = {
    Approved: PaymentStatus.APPROVED,
    Declined: PaymentStatus.DECLINED,
    Expired: PaymentStatus.EXPIRED,
  };
  const paymentStatus = statusMap[body.transactionStatus] ?? PaymentStatus.PENDING;

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
