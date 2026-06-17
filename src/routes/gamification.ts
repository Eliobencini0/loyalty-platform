import crypto from "crypto";
import { Router, Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { ApiError } from "../middleware/errorHandler";
import { buildWalletSummary } from "../services/walletSummary";
import { applyWelcomeBonus } from "../services/welcomeBonus";
import { generateRedemptionCode } from "../utils/redemptionCode";
import { gamificationRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// ─── Helper: Weighted random prize selection ─────────────────
function selectRandomPrize(prizes: Array<{ id: string; probability: number }>) {
  const totalWeight = prizes.reduce((sum, p) => sum + p.probability, 0);
  let random = crypto.randomInt(totalWeight);

  for (const prize of prizes) {
    random -= prize.probability;
    if (random < 0) {
      return prize.id;
    }
  }

  return prizes[0].id; // fallback
}

// ─── Public Routes ───────────────────────────────────────────

/**
 * GET /gamification/:merchantId
 * Get active gamification campaign for a merchant
 */
router.get("/:merchantId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { merchantId } = req.params;

    // Find active campaign
    const campaign = await prisma.gamificationCampaign.findFirst({
      where: {
        merchantId,
        active: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: new Date() }, endDate: null },
          { startDate: null, endDate: { gte: new Date() } },
          { startDate: { lte: new Date() }, endDate: { gte: new Date() } },
        ],
      },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
          },
        },
        prizes: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            description: true,
            prizeType: true,
            imageUrl: true,
            probability: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new ApiError(404, "No active campaign found for this merchant");
    }

    res.json({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      gameType: campaign.gameType,
      merchant: campaign.merchant,
      prizes: campaign.prizes,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /gamification/:merchantId/play
 * Play the game and win a prize
 * Body: { email: string }
 * Returns: { prizeWinId, prizeName, expiresAt }
 */
router.post("/:merchantId/play", gamificationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { merchantId } = req.params;
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, "Valid email is required");
    }

    // Find active campaign
    const campaign = await prisma.gamificationCampaign.findFirst({
      where: {
        merchantId,
        active: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: new Date() }, endDate: null },
          { startDate: null, endDate: { gte: new Date() } },
          { startDate: { lte: new Date() }, endDate: { gte: new Date() } },
        ],
      },
      include: {
        prizes: {
          where: { active: true },
        },
      },
    });

    if (!campaign) {
      throw new ApiError(404, "No active campaign found");
    }

    if (campaign.prizes.length === 0) {
      throw new ApiError(400, "No prizes available");
    }

    // Check if customer already played (via email + campaignId)
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (customer) {
      const existingWin = await prisma.prizeWin.findUnique({
        where: {
          campaignId_customerId: {
            campaignId: campaign.id,
            customerId: customer.id,
          },
        },
      });
      if (existingWin) {
        throw new ApiError(409, "You have already played this campaign");
      }
    }

    // Select random prize (weighted)
    const selectedPrizeId = selectRandomPrize(
      campaign.prizes.map((p) => ({ id: p.id, probability: p.probability }))
    );
    const selectedPrize = campaign.prizes.find((p) => p.id === selectedPrizeId)!;

    // Return prize info (customer will claim it after form submission)
    res.json({
      prizeId: selectedPrize.id,
      prizeName: selectedPrize.name,
      prizeDescription: selectedPrize.description,
      prizeType: selectedPrize.prizeType,
      prizeValue: selectedPrize.prizeValue,
      imageUrl: selectedPrize.imageUrl,
      validityDays: selectedPrize.validityDays,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /gamification/:merchantId/claim
 * Claim a prize after form submission (creates customer + loyalty card + prize win)
 * Body: { prizeId, email, firstName, lastName?, phone?, dateOfBirth? }
 * Returns: { prizeWinId, redemptionCode, loyaltyCard, expiresAt }
 */
router.post("/:merchantId/claim", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { merchantId } = req.params;
    const { prizeId, email, firstName, lastName, phone, dateOfBirth } = req.body;

    if (!prizeId || !email || !firstName) {
      throw new ApiError(400, "prizeId, email, and firstName are required");
    }

    // Get prize + campaign
    const prize = await prisma.prize.findUnique({
      where: { id: prizeId },
      include: { campaign: true },
    });

    if (!prize || prize.campaign.merchantId !== merchantId || !prize.campaign.active) {
      throw new ApiError(400, "Invalid prize or campaign");
    }

    // Create or get customer
    let customer = await prisma.customer.findUnique({ where: { email } });
    const isNewCustomer = !customer;

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email,
          firstName,
          lastName: lastName || "",
          phone: phone || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          acquisitionSource: "qr_gamification",
        },
      });
    }

    // Create or get loyalty card
    let loyaltyCard = await prisma.loyaltyCard.findUnique({
      where: {
        merchantId_customerId: {
          merchantId,
          customerId: customer.id,
        },
      },
    });

    if (!loyaltyCard) {
      const cardNumber = `LC-${uuidv4().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
      loyaltyCard = await prisma.loyaltyCard.create({
        data: {
          cardNumber,
          merchantId,
          customerId: customer.id,
        },
      });
      // Apply welcome bonus on first enrollment via gamification flow
      await applyWelcomeBonus({ merchantId, loyaltyCardId: loyaltyCard.id }).catch((err) => {
        console.error("Failed to apply welcome bonus:", err);
      });
    }

    // Create prize win — rely on DB unique constraint to prevent duplicates (race-condition-safe)
    const redemptionCode = generateRedemptionCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + prize.validityDays);

    try {
      const prizeWin = await prisma.prizeWin.create({
        data: {
          campaignId: prize.campaignId,
          prizeId: prize.id,
          customerId: customer.id,
          loyaltyCardId: loyaltyCard.id,
          redemptionCode,
          expiresAt,
        },
        include: {
          prize: true,
          campaign: {
            include: {
              merchant: true,
            },
          },
        },
      });

      const walletSummary = await buildWalletSummary(loyaltyCard.id);

      res.json({
        prizeWinId: prizeWin.id,
        redemptionCode: prizeWin.redemptionCode,
        prizeName: prizeWin.prize.name,
        prizeType: prizeWin.prize.prizeType,
        expiresAt: prizeWin.expiresAt,
        loyaltyCard: {
          id: loyaltyCard.id,
          cardNumber: loyaltyCard.cardNumber,
        },
        merchant: {
          id: prizeWin.campaign.merchant.id,
          name: prizeWin.campaign.merchant.name,
        },
        wallet: walletSummary
          ? {
              loyaltyPagePath: `/app/loyalty/${walletSummary.customerAccessToken}`,
              customerAccessToken: walletSummary.customerAccessToken,
              merchantScanToken: walletSummary.merchantScanToken,
            }
          : null,
        isNewCustomer,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ApiError(409, "Prize already claimed");
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

export default router;
