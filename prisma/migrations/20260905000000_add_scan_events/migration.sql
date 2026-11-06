-- Create ScanEvent table for QR scan analytics
CREATE TABLE "ScanEvent" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "userId" TEXT,
    "token" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScanEvent_shopId_idx" ON "ScanEvent"("shopId");

-- CreateIndex
CREATE INDEX "ScanEvent_userId_idx" ON "ScanEvent"("userId");

-- CreateIndex
CREATE INDEX "ScanEvent_createdAt_idx" ON "ScanEvent"("createdAt");