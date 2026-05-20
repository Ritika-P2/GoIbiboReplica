-- CreateEnum
CREATE TYPE "ManagerModule" AS ENUM ('FLIGHTS', 'HOTELS', 'TRAINS', 'BUSES', 'HOLIDAYS', 'CARS');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "managerModule" "ManagerModule";
