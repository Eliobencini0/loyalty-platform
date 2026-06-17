-- CreateTable
CREATE TABLE "merchant_feedback" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "merchant_feedback_merchant_id_created_at_idx" ON "merchant_feedback"("merchant_id", "created_at");

-- CreateIndex
CREATE INDEX "merchant_feedback_customer_id_idx" ON "merchant_feedback"("customer_id");

-- AddForeignKey
ALTER TABLE "merchant_feedback" ADD CONSTRAINT "merchant_feedback_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_feedback" ADD CONSTRAINT "merchant_feedback_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
