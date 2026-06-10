import { db } from '@/src/lib/db';

type UnreadRow = { orderId: string; unread_count: bigint };
type TotalRow = { total: bigint };

export async function getUnreadCountsForUser(userId: string): Promise<Map<string, number>> {
  const rows = await db.$queryRaw<UnreadRow[]>`
    SELECT om."orderId", COUNT(*) AS unread_count
    FROM "OrderMessage" om
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

export async function getTotalUnreadForUser(userId: string): Promise<number> {
  const rows = await db.$queryRaw<TotalRow[]>`
    SELECT COUNT(*) AS total
    FROM "OrderMessage" om
    LEFT JOIN "OrderChatSeen" ocs
      ON ocs."orderId" = om."orderId" AND ocs."userId" = ${userId}
    WHERE om."authorId" != ${userId}
      AND (ocs."seenAt" IS NULL OR om."createdAt" > ocs."seenAt")
  `;
  return Number(rows[0]?.total ?? 0);
}
