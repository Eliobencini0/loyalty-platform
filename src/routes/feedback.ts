import { Router, Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { feedbackRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// GET /feedback/:merchantId/config — get merchant review settings
router.get("/:merchantId/config", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { merchantId } = req.params;
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { id: true, name: true, settings: true, preferredLocale: true },
    });

    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    let settings: Record<string, unknown> = {};
    try {
      if (merchant.settings) settings = JSON.parse(merchant.settings);
    } catch { settings = {}; }

    res.json({
      merchantId: merchant.id,
      merchantName: merchant.name,
      googleMapsUrl: (settings.googleMapsUrl as string) || null,
      googlePlaceId: (settings.googlePlaceId as string) || null,
      reviewFlowEnabled: settings.reviewFlowEnabled !== false,
      locale: merchant.preferredLocale,
    });
  } catch (err) {
    next(err);
  }
});

// POST /feedback/:merchantId — submit detailed feedback (1-4 star flow)
router.post("/:merchantId", feedbackRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { merchantId } = req.params;
    const { rating, foodRating, serviceRating, atmosphereRating, text, email, firstName, lastName } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const detailedRatings = [foodRating, serviceRating, atmosphereRating].filter(
      (r) => r !== undefined && r !== null
    );
    for (const r of detailedRatings) {
      if (r < 1 || r > 5) {
        return res.status(400).json({ error: "Detailed ratings must be between 1 and 5" });
      }
    }

    const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    let customerId: string | null = null;
    if (email && firstName) {
      const cleanEmail = email.trim().toLowerCase();
      let customer = await prisma.customer.findUnique({ where: { email: cleanEmail } });
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            email: cleanEmail,
            firstName: firstName.trim(),
            lastName: lastName?.trim() || null,
            preferredLocale: merchant.preferredLocale,
            acquisitionSource: "review_flow",
          },
        });
      }
      customerId = customer.id;
    }

    const feedback = await prisma.merchantFeedback.create({
      data: {
        merchantId,
        customerId,
        rating,
        foodRating: foodRating || null,
        serviceRating: serviceRating || null,
        atmosphereRating: atmosphereRating || null,
        text: text?.trim() || "No additional comments",
        source: "DIRECT",
      },
    });

    res.json({ success: true, feedbackId: feedback.id });
  } catch (err) {
    next(err);
  }
});

// POST /feedback/:merchantId/google-redirect — track 5-star Google Maps redirect
router.post("/:merchantId/google-redirect", feedbackRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { merchantId } = req.params;
    const { email } = req.body;

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { id: true, settings: true },
    });

    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    let settings: Record<string, unknown> = {};
    try {
      if (merchant.settings) settings = JSON.parse(merchant.settings);
    } catch { settings = {}; }

    // Prioritize Place ID for direct review dialog
    const googlePlaceId = settings.googlePlaceId as string | undefined;
    const googleMapsUrl = settings.googleMapsUrl as string | undefined;

    if (!googlePlaceId && !googleMapsUrl) {
      return res.status(400).json({ error: "Google Maps configuration missing", fallback: true });
    }

    // Build direct review URL if Place ID is available
    const redirectUrl = googlePlaceId
      ? `https://search.google.com/local/writereview?placeid=${googlePlaceId}`
      : googleMapsUrl as string;

    let customerId: string | null = null;
    if (email) {
      const customer = await prisma.customer.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (customer) customerId = customer.id;
    }

    await prisma.merchantFeedback.create({
      data: {
        merchantId,
        customerId,
        rating: 5,
        text: "Redirected to Google Maps for review",
        source: "GOOGLE_MAPS",
      },
    });

    res.json({ success: true, redirectUrl });
  } catch (err) {
    next(err);
  }
});

export default router;
