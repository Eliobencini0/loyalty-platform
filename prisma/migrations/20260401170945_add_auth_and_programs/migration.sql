-- CreateEnum
CREATE TYPE "LoyaltyProgramType" AS ENUM ('POINTS', 'STAMPS');

-- AlterTable
ALTER TABLE "merchants" ADD COLUMN     "password_hash" TEXT;

-- CreateTable
CREATE TABLE "loyalty_programs" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "type" "LoyaltyProgramType" NOT NULL,
    "goal_stamps" INTEGER,
    "welcome_stamps" INTEGER,
    "points_per_currency" DECIMAL(10,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_tiers" (
    "id" UUID NOT NULL,
    "loyalty_program_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "reward_name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_programs_merchant_id_key" ON "loyalty_programs"("merchant_id");

-- CreateIndex
CREATE INDEX "reward_tiers_loyalty_program_id_idx" ON "reward_tiers"("loyalty_program_id");

-- AddForeignKey
ALTER TABLE "loyalty_programs" ADD CONSTRAINT "loyalty_programs_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_tiers" ADD CONSTRAINT "reward_tiers_loyalty_program_id_fkey" FOREIGN KEY ("loyalty_program_id") REFERENCES "loyalty_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
