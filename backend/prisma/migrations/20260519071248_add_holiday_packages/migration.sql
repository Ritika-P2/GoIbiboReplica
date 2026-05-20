-- CreateTable
CREATE TABLE "holiday_packages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "originalPrice" DECIMAL(10,2),
    "city" TEXT NOT NULL,
    "images" TEXT[],
    "tags" TEXT[],
    "highlights" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holiday_packages_pkey" PRIMARY KEY ("id")
);
