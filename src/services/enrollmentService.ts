import { v4 as uuidv4 } from "uuid";
import prisma from "../prisma";
import { ApiError } from "../middleware/errorHandler";
import { getOrCreateWalletPass, getOrCreateWalletAccessToken } from "./walletTokens";
import { applyWelcomeBonus } from "./welcomeBonus";

interface EnrollInput {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  marketingConsent?: boolean; // honoured only for SELF_JOIN
}

interface EnrollResult {
  customer: { id: string; firstName: string; lastName: string | null; email: string };
  card: { id: string; cardNumber: string };
  alreadyEnrolled: boolean;
  isNewCustomer: boolean;
  accessToken: string;
}

/**
 * Single source of truth for customer enrolment. Both the public
 * /loyalty/:merchantId/join (SELF_JOIN — customer fills the form) and the
 * dashboard /customers/manual-add (MERCHANT_MANUAL — merchant fills it for
 * them) MUST go through here so welcome bonus crediting, consent semantics
 * and wallet pass / token generation never drift between the two paths.
 *
 * GDPR notes per source:
 *   SELF_JOIN — customer's own affirmative action submits the form, so we
 *     stamp gdprConsentAt and honour marketingConsent (Art. 6(1)(b) +
 *     Art. 7).
 *   MERCHANT_MANUAL — the merchant inserts the customer; the customer hasn't
 *     done anything yet, so neither consent is recorded. The legal ground is
 *     Art. 6(1)(f) legitimate interest of the merchant managing their own
 *     customer; marketing opt-in must come later from the customer themselves
 *     via the wallet email.
 */
export async function enrollCustomer(
  merchantId: string,
  input: EnrollInput,
  source: "SELF_JOIN" | "MERCHANT_MANUAL",
): Promise<EnrollResult> {
  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
  if (!merchant || (source === "SELF_JOIN" && !merchant.active)) {
    throw new ApiError(404, "Merchant not found");
  }

  const program = await prisma.loyaltyProgram.findUnique({ where: { merchantId } });
  if (!program || !program.active) {
    throw new ApiError(400, source === "SELF_JOIN"
      ? "This merchant has no active loyalty program"
      : "No active loyalty program");
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const now = new Date();

  const { customer, card, alreadyEnrolled, isNewCustomer } = await prisma.$transaction(async (tx) => {
    let cust = await tx.customer.findUnique({ where: { email: normalizedEmail } });
    const newCustomer = !cust;

    if (!cust) {
      cust = await tx.customer.create({
        data: {
          email: normalizedEmail,
          firstName: input.firstName.trim(),
          lastName: input.lastName ? input.lastName.trim() : "",
          phone: input.phone ? input.phone.trim() : null,
          acquisitionSource: source === "SELF_JOIN" ? "qr_join" : "merchant_manual",
        },
      });
    }

    let crd = await tx.loyaltyCard.findUnique({
      where: { merchantId_customerId: { merchantId, customerId: cust.id } },
    });
    const enrolled = Boolean(crd);

    if (!crd) {
      const cardNumber = `LC-${uuidv4().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
      crd = await tx.loyaltyCard.create({
        data: {
          cardNumber,
          merchantId,
          customerId: cust.id,
          enrollmentSource: source,
          // Consents apply only to SELF_JOIN: in MERCHANT_MANUAL the customer
          // hasn't acted yet so neither consent is recorded.
          gdprConsentAt: source === "SELF_JOIN" ? now : null,
          marketingConsentAt:
            source === "SELF_JOIN" && input.marketingConsent === true ? now : null,
        },
      });
    } else if (source === "SELF_JOIN") {
      const update: { gdprConsentAt?: Date; marketingConsentAt?: Date | null; marketingRevokedAt?: Date | null } = {};
      if (!crd.gdprConsentAt) update.gdprConsentAt = now;
      if (input.marketingConsent === true && !crd.marketingConsentAt) {
        update.marketingConsentAt = now;
        update.marketingRevokedAt = null;
      }
      if (input.marketingConsent === false && crd.marketingConsentAt && !crd.marketingRevokedAt) {
        update.marketingRevokedAt = now;
      }
      if (Object.keys(update).length > 0) {
        crd = await tx.loyaltyCard.update({ where: { id: crd.id }, data: update });
      }
    }

    return { customer: cust, card: crd, alreadyEnrolled: enrolled, isNewCustomer: newCustomer };
  });

  // Welcome bonus: only on first enrolment for this merchant (skip if the
  // card pre-existed). Best-effort — a missing program or a transient DB
  // error must not roll back the enrolment itself.
  if (!alreadyEnrolled) {
    await applyWelcomeBonus({ merchantId, loyaltyCardId: card.id }).catch((err) => {
      console.error("Failed to apply welcome bonus:", err);
    });
  }

  // Wallet pass / token generation is idempotent + best-effort outside the tx
  // so a transient external failure can't roll back the enrolment.
  const applePass = await getOrCreateWalletPass(card.id, "APPLE_WALLET");
  await getOrCreateWalletPass(card.id, "GOOGLE_WALLET");
  const accessToken = await getOrCreateWalletAccessToken(applePass.id);

  return {
    customer: {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
    },
    card: { id: card.id, cardNumber: card.cardNumber },
    alreadyEnrolled,
    isNewCustomer,
    accessToken: accessToken.token,
  };
}
