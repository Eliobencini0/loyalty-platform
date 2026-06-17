-- Move consents from Customer (global) to LoyaltyCard (per-merchant)
-- Marketing consent must be scoped to the merchant, not global, since
-- the merchant is the data controller and Loyali is the processor.

ALTER TABLE "loyalty_cards"
  ADD COLUMN "gdpr_consent_at" TIMESTAMP(3),
  ADD COLUMN "marketing_consent_at" TIMESTAMP(3),
  ADD COLUMN "marketing_revoked_at" TIMESTAMP(3);

-- Backfill: copy current global consents onto every existing card.
-- This is conservative — keeps the consent the user already gave.
UPDATE "loyalty_cards" lc
SET
  "gdpr_consent_at" = c."gdpr_consent_at",
  "marketing_consent_at" = c."marketing_consent_at"
FROM "customers" c
WHERE lc."customer_id" = c."id";

ALTER TABLE "customers"
  DROP COLUMN "gdpr_consent_at",
  DROP COLUMN "marketing_consent_at";
