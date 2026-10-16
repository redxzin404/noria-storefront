ALTER TABLE "Product" ADD COLUMN "shippingWidthCm" INTEGER;
ALTER TABLE "Product" ADD COLUMN "shippingHeightCm" INTEGER;
ALTER TABLE "Product" ADD COLUMN "shippingLengthCm" INTEGER;
ALTER TABLE "Product" ADD COLUMN "shippingWeightGrams" INTEGER;

ALTER TABLE "Order" ADD COLUMN "paymentPreferenceId" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentCheckoutUrl" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingServiceName" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingServiceCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingEstimatedDays" INTEGER;
ALTER TABLE "Order" ADD COLUMN "shippingQuoteId" TEXT;
