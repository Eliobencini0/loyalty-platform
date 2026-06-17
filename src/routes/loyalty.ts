import { Router, Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { ApiError } from "../middleware/errorHandler";
import { enrollCustomer } from "../services/enrollmentService";

const router = Router();

// GET /loyalty/:merchantId/public-summary — Public merchant info for the join page
router.get("/:merchantId/public-summary", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { merchantId } = req.params;

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { id: true, name: true, active: true },
    });

    if (!merchant || !merchant.active) {
      throw new ApiError(404, "Merchant not found");
    }

    const program = await prisma.loyaltyProgram.findUnique({
      where: { merchantId },
      select: { id: true, type: true, active: true },
    });

    res.json({
      id: merchant.id,
      name: merchant.name,
      hasLoyaltyProgram: Boolean(program?.active),
      programType: program?.type ?? null,
    });
  } catch (err) {
    next(err);
  }
});

// POST /loyalty/:merchantId/join — Public customer enrollment (no game)
router.post("/:merchantId/join", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { merchantId } = req.params;
    const { firstName, lastName, email, phone, marketingConsent } = req.body ?? {};

    if (typeof firstName !== "string" || typeof email !== "string") {
      throw new ApiError(400, "firstName and email are required strings");
    }
    // Submitting the form is itself the acceptance of Terms + Privacy
    // (Art. 6(1)(b) GDPR — necessary for the contract). We log it implicitly
    // by setting gdprConsentAt in enrollmentService for SELF_JOIN.

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { id: true, name: true, active: true },
    });
    if (!merchant) throw new ApiError(404, "Merchant not found");

    const result = await enrollCustomer(
      merchantId,
      {
        firstName,
        lastName: typeof lastName === "string" ? lastName : undefined,
        email,
        phone: typeof phone === "string" ? phone : undefined,
        marketingConsent: marketingConsent === true ? true : marketingConsent === false ? false : undefined,
      },
      "SELF_JOIN",
    );

    const origin = process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`;

    res.status(result.isNewCustomer ? 201 : 200).json({
      alreadyEnrolled: result.alreadyEnrolled,
      accessToken: result.accessToken,
      applePassUrl: `${origin}/api/wallet/access/${result.accessToken}/apple-pass`,
      googleSaveUrl: `${origin}/api/wallet/access/${result.accessToken}/google-pass`,
      loyaltyUrl: `${origin}/app/loyalty/${result.accessToken}`,
      merchant: { id: merchant.id, name: merchant.name },
    });
  } catch (err) {
    console.error("loyalty/join failed:", err);
    next(err);
  }
});

export default router;
