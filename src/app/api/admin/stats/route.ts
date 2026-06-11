import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { getTotalUnreadForUser } from '@/src/server/queries/unread-counts';

export async function GET() {
  const session = await getCurrentSession().catch(() => null);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [newOrders, unreadMessages] = await Promise.all([
    db.order.count({ where: { status: 'NEW' } }),
    getTotalUnreadForUser(user.id, user.role),
  ]);

  return NextResponse.json({ newOrders, unreadMessages });
}
