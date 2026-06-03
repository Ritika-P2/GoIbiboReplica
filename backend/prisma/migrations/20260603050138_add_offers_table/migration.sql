-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "offerCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "maxDiscountAmount" DECIMAL(10,2) NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "termsConditions" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emoji" TEXT NOT NULL DEFAULT '🎁',
    "color" TEXT NOT NULL DEFAULT 'from-orange-400 to-red-400',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offers_offerCode_key" ON "offers"("offerCode");
