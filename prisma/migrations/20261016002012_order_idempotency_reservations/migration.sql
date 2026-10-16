ALTER TABLE "Order" ADD COLUMN "inventoryStatus" TEXT NOT NULL DEFAULT 'NONE';
ALTER TABLE "Order" ADD COLUMN "inventoryReservationExpiresAt" DATETIME;
ALTER TABLE "OrderItem" ADD COLUMN "inventoryReserved" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
