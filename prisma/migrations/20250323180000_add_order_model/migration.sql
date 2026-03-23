-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "orderName" TEXT,
    "totalPrice" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "customerEmail" TEXT,
    "wishlinkSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE INDEX "Order_shop_idx" ON "Order"("shop");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
