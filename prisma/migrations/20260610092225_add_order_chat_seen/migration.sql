-- CreateTable
CREATE TABLE "OrderChatSeen" (
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderChatSeen_pkey" PRIMARY KEY ("userId","orderId")
);

-- AddForeignKey
ALTER TABLE "OrderChatSeen" ADD CONSTRAINT "OrderChatSeen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderChatSeen" ADD CONSTRAINT "OrderChatSeen_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
