-- CreateEnum
CREATE TYPE "DeliveryService" AS ENUM ('NOVA_POSHTA', 'UKRPOSHTA');

-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('BRANCH', 'COURIER');

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "service" "DeliveryService" NOT NULL,
    "deliveryType" "DeliveryType" NOT NULL,
    "city" TEXT NOT NULL,
    "branchNumber" TEXT,
    "street" TEXT,
    "house" TEXT,
    "apartment" TEXT,
    "recipientName" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_orderId_key" ON "Delivery"("orderId");

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
