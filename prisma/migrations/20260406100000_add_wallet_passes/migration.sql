-- CreateEnum
CREATE TYPE "WalletProvider" AS ENUM ('APPLE_WALLET', 'GOOGLE_WALLET');

-- CreateEnum
CREATE TYPE "WalletPassStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'REVOKED');

-- CreateTable
CREATE TABLE "wallet_passes" (
    "id" UUID NOT NULL,
    "loyalty_card_id" UUID NOT NULL,
    "provider" "WalletProvider" NOT NULL,
    "provider_pass_id" TEXT,
    "status" "WalletPassStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_snapshot_hash" TEXT,
    "last_issued_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_passes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_scan_tokens" (
    "id" UUID NOT NULL,
    "wallet_pass_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "wallet_scan_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_access_tokens" (
    "id" UUID NOT NULL,
    "wallet_pass_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "wallet_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_passes_loyalty_card_id_provider_key" ON "wallet_passes"("loyalty_card_id", "provider");

-- CreateIndex
CREATE INDEX "wallet_passes_loyalty_card_id_idx" ON "wallet_passes"("loyalty_card_id");

-- CreateIndex
CREATE INDEX "wallet_passes_status_idx" ON "wallet_passes"("status");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_scan_tokens_token_key" ON "wallet_scan_tokens"("token");

-- CreateIndex
CREATE INDEX "wallet_scan_tokens_wallet_pass_id_idx" ON "wallet_scan_tokens"("wallet_pass_id");

-- CreateIndex
CREATE INDEX "wallet_scan_tokens_active_idx" ON "wallet_scan_tokens"("active");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_access_tokens_token_key" ON "wallet_access_tokens"("token");

-- CreateIndex
CREATE INDEX "wallet_access_tokens_wallet_pass_id_idx" ON "wallet_access_tokens"("wallet_pass_id");

-- CreateIndex
CREATE INDEX "wallet_access_tokens_active_idx" ON "wallet_access_tokens"("active");

-- AddForeignKey
ALTER TABLE "wallet_passes" ADD CONSTRAINT "wallet_passes_loyalty_card_id_fkey" FOREIGN KEY ("loyalty_card_id") REFERENCES "loyalty_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_scan_tokens" ADD CONSTRAINT "wallet_scan_tokens_wallet_pass_id_fkey" FOREIGN KEY ("wallet_pass_id") REFERENCES "wallet_passes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_access_tokens" ADD CONSTRAINT "wallet_access_tokens_wallet_pass_id_fkey" FOREIGN KEY ("wallet_pass_id") REFERENCES "wallet_passes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
