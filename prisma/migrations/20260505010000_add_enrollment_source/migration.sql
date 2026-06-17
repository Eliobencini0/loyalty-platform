-- CreateEnum
CREATE TYPE "EnrollmentSource" AS ENUM ('SELF_JOIN', 'MERCHANT_MANUAL');

-- AlterTable
ALTER TABLE "loyalty_cards" ADD COLUMN "enrollment_source" "EnrollmentSource" NOT NULL DEFAULT 'SELF_JOIN';
