-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "buses" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "flights" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "holiday_packages" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "hotels" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "trains" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'PENDING';
