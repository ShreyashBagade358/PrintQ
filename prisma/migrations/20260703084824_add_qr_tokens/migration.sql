-- Add QR token fields to Shop model
ALTER TABLE "Shop" ADD COLUMN "qrToken" TEXT;
ALTER TABLE "Shop" ADD COLUMN "qrRegeneratedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "Shop_qrToken_key" ON "Shop"("qrToken");
