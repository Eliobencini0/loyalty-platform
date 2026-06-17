import { Router, Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { ApiError } from "../middleware/errorHandler";
import { validateUuid } from "../middleware/validateUuid";

const router = Router();

// POST /points/earn — Earn points on a card
router.post("/earn", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { loyaltyCardId, points, description, referenceId } = req.body;
    const merchantId = req.merchantId!;

    if (!loyaltyCardId || !points || points <= 0) {
      throw new ApiError(400, "loyaltyCardId and a positive points value are required");
    }

    const card = await prisma.loyaltyCard.findUnique({ where: { id: loyaltyCardId } });
    if (!card || card.merchantId !== merchantId) {
      throw new ApiError(404, "Card not found");
    }
    if (card.status !== "ACTIVE") {
      throw new ApiError(400, "Card is not active");
    }

    // Use atomic increment to prevent race conditions
    const updatedCard = await prisma.$transaction(async (tx) => {
      const updated = await tx.loyaltyCard.update({
        where: { id: loyaltyCardId },
        data: {
          pointsBalance: { increment: points },
          totalEarned: { increment: points },
        },
      });

      await tx.pointsTransaction.create({
        data: {
          loyaltyCardId,
          type: "EARN",
          points,
          balanceAfter: updated.pointsBalance,
          description: description || null,
          referenceId: referenceId || null,
        },
      });

      return updated;
    });

    res.status(201).json({ balance: updatedCard.pointsBalance });
  } catch (err) {
    next(err);
  }
});

// POST /points/redeem — Redeem points from a card
router.post("/redeem", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { loyaltyCardId, points, description, referenceId } = req.body;
    const merchantId = req.merchantId!;

    if (!loyaltyCardId || !points || points <= 0) {
      throw new ApiError(400, "loyaltyCardId and a positive points value are required");
    }

    const card = await prisma.loyaltyCard.findUnique({
      where: { id: loyaltyCardId },
      include: { cardTemplate: true },
    });
    if (!card || card.merchantId !== merchantId) {
      throw new ApiError(404, "Card not found");
    }
    if (card.status !== "ACTIVE") {
      throw new ApiError(400, "Card is not active");
    }

    // Check minimum redeem threshold from card template
    const minRedeem = card.cardTemplate?.minRedeemPoints ?? 0;
    if (points < minRedeem) {
      throw new ApiError(400, `Minimum redemption is ${minRedeem} points`);
    }

    if (card.pointsBalance < points) {
      throw new ApiError(400, "Insufficient points balance");
    }

    // Use atomic decrement to prevent race conditions
    const updatedCard = await prisma.$transaction(async (tx) => {
      const updated = await tx.loyaltyCard.update({
        where: { id: loyaltyCardId },
        data: {
          pointsBalance: { decrement: points },
          totalRedeemed: { increment: points },
        },
      });

      // Double-check balance after decrement (shouldn't go negative)
      if (updated.pointsBalance < 0) {
        throw new ApiError(400, "Insufficient points balance");
      }

      await tx.pointsTransaction.create({
        data: {
          loyaltyCardId,
          type: "REDEEM",
          points: -points,
          balanceAfter: updated.pointsBalance,
          description: description || null,
          referenceId: referenceId || null,
        },
      });

      return updated;
    });

    res.status(201).json({ balance: updatedCard.pointsBalance });
  } catch (err) {
    next(err);
  }
});

// GET /points/balance/:cardId — Check card balance
router.get("/balance/:cardId", validateUuid("cardId"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await prisma.loyaltyCard.findUnique({
      where: { id: req.params.cardId },
      select: {
        id: true,
        cardNumber: true,
        pointsBalance: true,
        totalEarned: true,
        totalRedeemed: true,
        status: true,
        merchantId: true,
      },
    });

    if (!card) {
      throw new ApiError(404, "Card not found");
    }

    // Verify the card belongs to the authenticated merchant
    if (req.merchantId && card.merchantId !== req.merchantId) {
      throw new ApiError(404, "Card not found");
    }

    // Remove merchantId from response
    const { merchantId, ...cardData } = card;

    res.json(cardData);
  } catch (err) {
    next(err);
  }
});

// GET /points/history/:cardId — Transaction history for a card
router.get("/history/:cardId", validateUuid("cardId"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await prisma.loyaltyCard.findUnique({ where: { id: req.params.cardId } });
    if (!card || card.merchantId !== req.merchantId) {
      throw new ApiError(404, "Card not found");
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const type = req.query.type as string | undefined;

    const where: Record<string, unknown> = { loyaltyCardId: req.params.cardId };
    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.pointsTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.pointsTransaction.count({ where }),
    ]);

    res.json({ data: transactions, total, page, limit });
  } catch (err) {
    next(err);
  }
});

export default router;
