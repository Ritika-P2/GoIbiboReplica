-- AlterEnum
ALTER TYPE "BookingType" ADD VALUE 'HOLIDAY';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "packageData" JSONB;
