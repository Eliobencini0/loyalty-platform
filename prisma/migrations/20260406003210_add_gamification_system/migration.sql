-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('SCRATCH_CARD', 'SPIN_WHEEL');

-- CreateEnum
CREATE TYPE "PrizeType" AS ENUM ('PHYSICAL', 'DIGITAL');

-- CreateEnum
CREATE TYPE "PrizeStatus" AS ENUM ('PENDING', 'REDEEMED', 'EXPIRED');

-- AlterTable Customer: add new fields
ALTER TABLE "customers" ADD COLUMN "date_of_birth" TIMESTAMP(3),
ADD COLUMN "acquisition_source" TEXT,
ALTER COLUMN "last_name" DROP NOT NULL;

-- CreateTable GamificationCampaign
CREATE TABLE "gamification_campaigns" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "game_type" "GameType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gamification_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable Prize
CREATE TABLE "prizes" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prize_type" "PrizeType" NOT NULL,
    "prize_value" TEXT,
    "probability" INTEGER NOT NULL,
    "validity_days" INTEGER NOT NULL DEFAULT 7,
    "image_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable PrizeWin
CREATE TABLE "prize_wins" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "prize_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "loyalty_card_id" UUID,
    "status" "PrizeStatus" NOT NULL DEFAULT 'PENDING',
    "redemption_code" TEXT NOT NULL,
    "won_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prize_wins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gamification_campaigns_merchant_id_idx" ON "gamification_campaigns"("merchant_id");

-- CreateIndex
CREATE INDEX "gamification_campaigns_active_idx" ON "gamification_campaigns"("active");

-- CreateIndex
CREATE INDEX "prizes_campaign_id_idx" ON "prizes"("campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "prize_wins_redemption_code_key" ON "prize_wins"("redemption_code");

-- CreateIndex
CREATE INDEX "prize_wins_campaign_id_idx" ON "prize_wins"("campaign_id");

-- CreateIndex
CREATE INDEX "prize_wins_customer_id_idx" ON "prize_wins"("customer_id");

-- CreateIndex
CREATE INDEX "prize_wins_status_idx" ON "prize_wins"("status");

-- CreateIndex
CREATE INDEX "prize_wins_redemption_code_idx" ON "prize_wins"("redemption_code");

-- CreateIndex
CREATE UNIQUE INDEX "prize_wins_campaign_id_customer_id_key" ON "prize_wins"("campaign_id", "customer_id");

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
