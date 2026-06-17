import { Router, Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { ApiError } from "../middleware/errorHandler";

const router = Router();

/**
 * GET /campaigns
 * Get all campaigns for authenticated merchant
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId!;

    const campaigns = await prisma.gamificationCampaign.findMany({
      where: { merchantId },
      include: {
        prizes: {
          select: {
            id: true,
            name: true,
            prizeType: true,
            probability: true,
            active: true,
          },
        },
        _count: {
          select: {
            prizeWins: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(campaigns);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /campaigns/:id
 * Get campaign details
 */
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const merchantId = req.merchantId!;

    const campaign = await prisma.gamificationCampaign.findFirst({
      where: { id, merchantId },
      include: {
        prizes: true,
        _count: {
          select: {
            prizeWins: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new ApiError(404, "Campaign not found");
    }

    res.json(campaign);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /campaigns
 * Create a new campaign
 * Body: { name, description?, gameType, startDate?, endDate?, prizes: [] }
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId!;
    const { name, description, gameType, startDate, endDate, prizes } = req.body;

    if (!gameType) {
      throw new ApiError(400, "gameType is required");
    }

    if (!["SCRATCH_CARD", "SPIN_WHEEL"].includes(gameType)) {
      throw new ApiError(400, "gameType must be SCRATCH_CARD or SPIN_WHEEL");
    }

    if (!prizes || !Array.isArray(prizes) || prizes.length === 0) {
      throw new ApiError(400, "At least one prize is required");
    }

    // Validate prizes
    for (const prize of prizes) {
      if (!prize.name || !prize.prizeType || typeof prize.probability !== "number") {
        throw new ApiError(400, "Each prize must have name, prizeType, and probability");
      }
      if (!["PHYSICAL", "DIGITAL"].includes(prize.prizeType)) {
        throw new ApiError(400, "prizeType must be PHYSICAL or DIGITAL");
      }
    }

    const normalizedName =
      typeof name === "string" && name.trim().length > 0
        ? name.trim()
        : gameType === "SPIN_WHEEL"
          ? "Spin Wheel Campaign"
          : "Scratch Card Campaign";

    // Create campaign with prizes
    const campaign = await prisma.gamificationCampaign.create({
      data: {
        merchantId,
        name: normalizedName,
        description,
        gameType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        prizes: {
          create: prizes.map((p: any) => ({
            name: p.name,
            description: p.description || null,
            prizeType: p.prizeType,
            prizeValue: p.prizeValue || null,
            probability: p.probability,
            validityDays: p.validityDays || 7,
            imageUrl: p.imageUrl || null,
          })),
        },
      },
      include: {
        prizes: true,
      },
    });

    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /campaigns/:id
 * Update campaign
 */
router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const merchantId = req.merchantId!;
    const { name, description, gameType, active, startDate, endDate, prizes } = req.body;

    const existing = await prisma.gamificationCampaign.findFirst({
      where: { id, merchantId },
      include: {
        prizes: {
          include: {
            _count: {
              select: {
                prizeWins: true,
              },
            },
          },
        },
      },
    });

    if (!existing) {
      throw new ApiError(404, "Campaign not found");
    }

    if (gameType !== undefined && !["SCRATCH_CARD", "SPIN_WHEEL"].includes(gameType)) {
      throw new ApiError(400, "gameType must be SCRATCH_CARD or SPIN_WHEEL");
    }

    if (prizes !== undefined) {
      if (!Array.isArray(prizes) || prizes.length === 0) {
        throw new ApiError(400, "At least one prize is required");
      }

      for (const prize of prizes) {
        if (!prize.name || !prize.prizeType || typeof prize.probability !== "number") {
          throw new ApiError(400, "Each prize must have name, prizeType, and probability");
        }
        if (!["PHYSICAL", "DIGITAL"].includes(prize.prizeType)) {
          throw new ApiError(400, "prizeType must be PHYSICAL or DIGITAL");
        }
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const normalizedName =
        name !== undefined
          ? (typeof name === "string" && name.trim().length > 0
              ? name.trim()
              : (gameType ?? existing.gameType) === "SPIN_WHEEL"
                ? "Spin Wheel Campaign"
                : "Scratch Card Campaign")
          : undefined;

      if (prizes !== undefined) {
        const existingPrizeMap = new Map(existing.prizes.map((prize) => [prize.id, prize]));
        const incomingIds = new Set(
          prizes
            .map((prize: any) => (typeof prize.id === "string" ? prize.id : null))
            .filter((value: string | null): value is string => Boolean(value)),
        );

        for (const prize of prizes) {
          const prizeData = {
            name: prize.name.trim(),
            description: prize.description || null,
            prizeType: prize.prizeType,
            prizeValue: prize.prizeValue || null,
            probability: prize.probability,
            validityDays: prize.validityDays || 15,
            imageUrl: prize.imageUrl || null,
            active: prize.active ?? true,
          };

          if (prize.id && existingPrizeMap.has(prize.id)) {
            await tx.prize.update({
              where: { id: prize.id },
              data: prizeData,
            });
          } else {
            await tx.prize.create({
              data: {
                campaignId: id,
                ...prizeData,
              },
            });
          }
        }

        for (const currentPrize of existing.prizes) {
          if (incomingIds.has(currentPrize.id)) {
            continue;
          }

          if (currentPrize._count.prizeWins > 0) {
            await tx.prize.update({
              where: { id: currentPrize.id },
              data: { active: false },
            });
          } else {
            await tx.prize.delete({
              where: { id: currentPrize.id },
            });
          }
        }
      }

      return tx.gamificationCampaign.update({
        where: { id },
        data: {
          name: normalizedName,
          description: description !== undefined ? description : undefined,
          gameType: gameType !== undefined ? gameType : undefined,
          active: active !== undefined ? active : undefined,
          startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
          endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
        },
        include: {
          prizes: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /campaigns/:id
 * Delete campaign
 */
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const merchantId = req.merchantId!;

    const existing = await prisma.gamificationCampaign.findFirst({
      where: { id, merchantId },
    });

    if (!existing) {
      throw new ApiError(404, "Campaign not found");
    }

    await prisma.gamificationCampaign.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /campaigns/:id/stats
 * Get campaign statistics
 */
router.get("/:id/stats", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const merchantId = req.merchantId!;

    const campaign = await prisma.gamificationCampaign.findFirst({
      where: { id, merchantId },
      include: {
        prizes: {
          include: {
            _count: {
              select: {
                prizeWins: true,
              },
            },
          },
        },
        prizeWins: {
          select: {
            id: true,
            status: true,
            wonAt: true,
            redeemedAt: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new ApiError(404, "Campaign not found");
    }

    const totalPlays = campaign.prizeWins.length;
    const totalRedeemed = campaign.prizeWins.filter((w) => w.status === "REDEEMED").length;
    const totalExpired = campaign.prizeWins.filter((w) => w.status === "EXPIRED").length;
    const totalPending = campaign.prizeWins.filter((w) => w.status === "PENDING").length;

    const prizeDistribution = campaign.prizes.map((prize) => ({
      prizeName: prize.name,
      prizeType: prize.prizeType,
      timesWon: prize._count.prizeWins,
      probability: prize.probability,
    }));

    res.json({
      campaignId: campaign.id,
      campaignName: campaign.name,
      totalPlays,
      totalRedeemed,
      totalExpired,
      totalPending,
      redemptionRate: totalPlays > 0 ? (totalRedeemed / totalPlays) * 100 : 0,
      prizeDistribution,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /campaigns/:id/redeem
 * Redeem a prize (merchant scans QR/barcode)
 * Body: { redemptionCode: string }
 */
router.post("/:id/redeem", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: campaignId } = req.params;
    const merchantId = req.merchantId!;
    const { redemptionCode } = req.body;

    if (!redemptionCode) {
      throw new ApiError(400, "redemptionCode is required");
    }

    // Find prize win
    const prizeWin = await prisma.prizeWin.findFirst({
      where: {
        redemptionCode,
        campaignId,
      },
      include: {
        campaign: true,
        prize: true,
        customer: true,
      },
    });

    if (!prizeWin) {
      throw new ApiError(404, "Prize not found");
    }

    if (prizeWin.campaign.merchantId !== merchantId) {
      throw new ApiError(403, "Unauthorized");
    }

    if (prizeWin.status === "REDEEMED") {
      throw new ApiError(400, "Prize already redeemed");
    }

    if (prizeWin.status === "EXPIRED" || new Date() > prizeWin.expiresAt) {
      throw new ApiError(400, "Prize has expired");
    }

    // Mark as redeemed
    const updated = await prisma.prizeWin.update({
      where: { id: prizeWin.id },
      data: {
        status: "REDEEMED",
        redeemedAt: new Date(),
      },
      include: {
        prize: true,
        customer: true,
      },
    });

    res.json({
      success: true,
      prizeWin: updated,
      customerName: `${updated.customer.firstName} ${updated.customer.lastName}`,
      prizeName: updated.prize.name,
      redeemedAt: updated.redeemedAt,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
