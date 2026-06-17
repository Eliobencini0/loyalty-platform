/*
  Warnings:

  - The primary key for the `card_templates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `customers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `gamification_campaigns` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `loyalty_cards` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `loyalty_programs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `merchant_feedback` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `merchants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `points_transactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `prize_wins` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `prizes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `reward_tiers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `wallet_access_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `wallet_passes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `wallet_scan_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "card_templates" DROP CONSTRAINT "card_templates_merchant_id_fkey";

-- DropForeignKey
ALTER TABLE "gamification_campaigns" DROP CONSTRAINT "gamification_campaigns_merchant_id_fkey";

-- DropForeignKey
ALTER TABLE "loyalty_cards" DROP CONSTRAINT "loyalty_cards_card_template_id_fkey";

-- DropForeignKey
ALTER TABLE "loyalty_cards" DROP CONSTRAINT "loyalty_cards_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "loyalty_cards" DROP CONSTRAINT "loyalty_cards_merchant_id_fkey";

-- DropForeignKey
ALTER TABLE "loyalty_programs" DROP CONSTRAINT "loyalty_programs_merchant_id_fkey";

-- DropForeignKey
ALTER TABLE "merchant_feedback" DROP CONSTRAINT "merchant_feedback_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "merchant_feedback" DROP CONSTRAINT "merchant_feedback_merchant_id_fkey";

-- DropForeignKey
ALTER TABLE "points_transactions" DROP CONSTRAINT "points_transactions_loyalty_card_id_fkey";

-- DropForeignKey
ALTER TABLE "prize_wins" DROP CONSTRAINT "prize_wins_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "prize_wins" DROP CONSTRAINT "prize_wins_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "prize_wins" DROP CONSTRAINT "prize_wins_loyalty_card_id_fkey";

-- DropForeignKey
ALTER TABLE "prize_wins" DROP CONSTRAINT "prize_wins_prize_id_fkey";

-- DropForeignKey
ALTER TABLE "prizes" DROP CONSTRAINT "prizes_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "reward_tiers" DROP CONSTRAINT "reward_tiers_loyalty_program_id_fkey";

-- DropForeignKey
ALTER TABLE "wallet_access_tokens" DROP CONSTRAINT "wallet_access_tokens_wallet_pass_id_fkey";

-- DropForeignKey
ALTER TABLE "wallet_passes" DROP CONSTRAINT "wallet_passes_loyalty_card_id_fkey";

-- DropForeignKey
ALTER TABLE "wallet_scan_tokens" DROP CONSTRAINT "wallet_scan_tokens_wallet_pass_id_fkey";

-- AlterTable
ALTER TABLE "card_templates" DROP CONSTRAINT "card_templates_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "merchant_id" SET DATA TYPE TEXT,
ALTER COLUMN "points_per_currency" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "redemption_rate" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "bonus_multiplier" SET DATA TYPE DECIMAL(65,30),
ADD CONSTRAINT "card_templates_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "customers" DROP CONSTRAINT "customers_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "gamification_campaigns" DROP CONSTRAINT "gamification_campaigns_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "merchant_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "gamification_campaigns_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "loyalty_cards" DROP CONSTRAINT "loyalty_cards_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "merchant_id" SET DATA TYPE TEXT,
ALTER COLUMN "customer_id" SET DATA TYPE TEXT,
ALTER COLUMN "card_template_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "loyalty_cards_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "loyalty_programs" DROP CONSTRAINT "loyalty_programs_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "merchant_id" SET DATA TYPE TEXT,
ALTER COLUMN "points_per_currency" SET DATA TYPE DECIMAL(65,30),
ADD CONSTRAINT "loyalty_programs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "merchant_feedback" DROP CONSTRAINT "merchant_feedback_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "merchant_id" SET DATA TYPE TEXT,
ALTER COLUMN "customer_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "merchant_feedback_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "merchants" DROP CONSTRAINT "merchants_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "settings" SET DATA TYPE TEXT,
ADD CONSTRAINT "merchants_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "points_transactions" DROP CONSTRAINT "points_transactions_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "loyalty_card_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "points_transactions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "prize_wins" DROP CONSTRAINT "prize_wins_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "campaign_id" SET DATA TYPE TEXT,
ALTER COLUMN "prize_id" SET DATA TYPE TEXT,
ALTER COLUMN "customer_id" SET DATA TYPE TEXT,
ALTER COLUMN "loyalty_card_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "prize_wins_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "prizes" DROP CONSTRAINT "prizes_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "campaign_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "prizes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "reward_tiers" DROP CONSTRAINT "reward_tiers_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "loyalty_program_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "reward_tiers_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "wallet_access_tokens" DROP CONSTRAINT "wallet_access_tokens_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "wallet_pass_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "wallet_access_tokens_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "wallet_passes" DROP CONSTRAINT "wallet_passes_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "loyalty_card_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "wallet_passes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "wallet_scan_tokens" DROP CONSTRAINT "wallet_scan_tokens_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "wallet_pass_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "wallet_scan_tokens_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "keys" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_merchant_id_idx" ON "push_subscriptions"("merchant_id");

-- CreateIndex
CREATE INDEX "push_subscriptions_merchant_id_active_idx" ON "push_subscriptions"("merchant_id", "active");

-- CreateIndex
CREATE INDEX "gamification_campaigns_merchant_id_active_idx" ON "gamification_campaigns"("merchant_id", "active");

-- CreateIndex
CREATE INDEX "merchant_feedback_merchant_id_read_at_created_at_idx" ON "merchant_feedback"("merchant_id", "read_at", "created_at" DESC);

-- CreateIndex
CREATE INDEX "points_transactions_loyalty_card_id_created_at_idx" ON "points_transactions"("loyalty_card_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "loyalty_cards" ADD CONSTRAINT "loyalty_cards_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_cards" ADD CONSTRAINT "loyalty_cards_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_cards" ADD CONSTRAINT "loyalty_cards_card_template_id_fkey" FOREIGN KEY ("card_template_id") REFERENCES "card_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_templates" ADD CONSTRAINT "card_templates_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_loyalty_card_id_fkey" FOREIGN KEY ("loyalty_card_id") REFERENCES "loyalty_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_programs" ADD CONSTRAINT "loyalty_programs_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_tiers" ADD CONSTRAINT "reward_tiers_loyalty_program_id_fkey" FOREIGN KEY ("loyalty_program_id") REFERENCES "loyalty_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_feedback" ADD CONSTRAINT "merchant_feedback_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_feedback" ADD CONSTRAINT "merchant_feedback_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gamification_campaigns" ADD CONSTRAINT "gamification_campaigns_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prizes" ADD CONSTRAINT "prizes_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "gamification_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_wins" ADD CONSTRAINT "prize_wins_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "gamification_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_wins" ADD CONSTRAINT "prize_wins_prize_id_fkey" FOREIGN KEY ("prize_id") REFERENCES "prizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_wins" ADD CONSTRAINT "prize_wins_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_wins" ADD CONSTRAINT "prize_wins_loyalty_card_id_fkey" FOREIGN KEY ("loyalty_card_id") REFERENCES "loyalty_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_passes" ADD CONSTRAINT "wallet_passes_loyalty_card_id_fkey" FOREIGN KEY ("loyalty_card_id") REFERENCES "loyalty_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_scan_tokens" ADD CONSTRAINT "wallet_scan_tokens_wallet_pass_id_fkey" FOREIGN KEY ("wallet_pass_id") REFERENCES "wallet_passes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_access_tokens" ADD CONSTRAINT "wallet_access_tokens_wallet_pass_id_fkey" FOREIGN KEY ("wallet_pass_id") REFERENCES "wallet_passes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
