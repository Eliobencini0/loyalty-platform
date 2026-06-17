-- CreateEnum
CREATE TYPE "FeedbackSource" AS ENUM ('DIRECT', 'GOOGLE_MAPS', 'OTHER');

-- AlterTable: Make customer_id nullable for anonymous feedback
ALTER TABLE "merchant_feedback" ALTER COLUMN "customer_id" DROP NOT NULL;

-- AlterTable: Add review flow fields
ALTER TABLE "merchant_feedback" ADD COLUMN "food_rating" INTEGER;
ALTER TABLE "merchant_feedback" ADD COLUMN "service_rating" INTEGER;
ALTER TABLE "merchant_feedback" ADD COLUMN "atmosphere_rating" INTEGER;
ALTER TABLE "merchant_feedback" ADD COLUMN "source" "FeedbackSource" NOT NULL DEFAULT 'DIRECT';

-- CreateIndex
CREATE INDEX "merchant_feedback_source_idx" ON "merchant_feedback"("source");
