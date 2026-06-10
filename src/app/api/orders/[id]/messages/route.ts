import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { mapOrderMessageForView } from '@/src/lib/customer-data';

// Returns messages for an order created after ?after=<ISO timestamp>
// Admin can access any order; customer can only access their own.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession().catch(() => null);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: orderId } = await params;
  const after = req.nextUrl.searchParams.get('after');
  const afterDate = after ? new Date(after) : null;

  const appUser = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!appUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isAdmin = appUser.role === 'ADMIN' || appUser.role === 'SUPERADMIN';

  // Verify access
  const order = await db.order.findFirst({
    where: isAdmin
      ? { id: orderId }
      : { id: orderId, customerId: appUser.id },
    select: { id: true },
  });
  if (!order) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const messages = await db.orderMessage.findMany({
    where: {
      orderId,
      ...(afterDate ? { createdAt: { gt: afterDate } } : {}),
    },
    include: { author: true },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ messages: messages.map(mapOrderMessageForView) });
}
