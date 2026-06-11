import { db } from '@/src/lib/db';

type UnreadRow = { orderId: string; unread_count: bigint };
type TotalRow = { total: bigint };

// Customer: only messages in their own orders. Admin: all orders.
export async function getUnreadCountsForUser(
  userId: string,
  role: string = 'CUSTOMER',
): Promise<Map<string, number>> {
  const isAdmin = role === 'ADMIN' || role === 'SUPERADMIN';

  const rows = isAdmin
    ? await db.$queryRaw<UnreadRow[]>`
        SELECT om."orderId", COUNT(*) AS unread_count
        FROM "OrderMessage" om
        LEFT JOIN "OrderChatSeen" ocs
          ON ocs."orderId" = om."orderId" AND ocs."userId" = ${userId}
        WHERE om."authorId" != ${userId}
          AND (ocs."seenAt" IS NULL OR om."createdAt" > ocs."seenAt")
        GROUP BY om."orderId"
      `
    : await db.$queryRaw<UnreadRow[]>`
        SELECT om."orderId", COUNT(*) AS unread_count
        FROM "OrderMessage" om
        JOIN "Order" o ON o.id = om."orderId" AND o."customerId" = ${userId}
        LEFT JOIN "OrderChatSeen" ocs
          ON ocs."orderId" = om."orderId" AND ocs."userId" = ${userId}
        WHERE om."authorId" != ${userId}
          AND (ocs."seenAt" IS NULL OR om."createdAt" > ocs."seenAt")
        GROUP BY om."orderId"
      `;

  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.orderId, Number(row.unread_count));
  }
  return map;
}

export async function getTotalUnreadForUser(
  userId: string,
  role: string = 'CUSTOMER',
): Promise<number> {
  const isAdmin = role === 'ADMIN' || role === 'SUPERADMIN';

  const rows = isAdmin
    ? await db.$queryRaw<TotalRow[]>`
        SELECT COUNT(*) AS total
        FROM "OrderMessage" om
        LEFT JOIN "OrderChatSeen" ocs
          ON ocs."orderId" = om."orderId" AND ocs."userId" = ${userId}
        WHERE om."authorId" != ${userId}
          AND (ocs."seenAt" IS NULL OR om."createdAt" > ocs."seenAt")
      `
    : await db.$queryRaw<TotalRow[]>`
        SELECT COUNT(*) AS total
        FROM "OrderMessage" om
        JOIN "Order" o ON o.id = om."orderId" AND o."customerId" = ${userId}
        LEFT JOIN "OrderChatSeen" ocs
          ON ocs."orderId" = om."orderId" AND ocs."userId" = ${userId}
        WHERE om."authorId" != ${userId}
          AND (ocs."seenAt" IS NULL OR om."createdAt" > ocs."seenAt")
      `;

  return Number(rows[0]?.total ?? 0);
}
