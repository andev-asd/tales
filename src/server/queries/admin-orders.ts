import { db } from '@/src/lib/db';
import { OrderStatus } from '@prisma/client';

export async function getAdminOrders(filter: { status?: string }) {
  return db.order.findMany({
    where: filter.status && filter.status !== 'ALL' ? { status: filter.status as OrderStatus } : {},
    select: {
      id: true,
      type: true,
      status: true,
      finalPrice: true,
      createdAt: true,
      customer: { select: { id: true, name: true, email: true } },
      tale: { select: { id: true, title: true, price: true } },
      payment: { select: { status: true, amount: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAdminOrderDetail(orderId: string) {
  return db.order.findUnique({
    where: { id: orderId },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      tale: { select: { id: true, title: true, price: true } },
      payment: true,
      delivery: true,
      messages: {
        include: { author: { select: { role: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}
