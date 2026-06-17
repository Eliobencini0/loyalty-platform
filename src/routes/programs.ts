import { Router, Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { ApiError } from "../middleware/errorHandler";

const router = Router();

/**
 * Assert the merchant has no card with earned/redeemed activity.
 * Use this on ANY future endpoint that mutates a `LoyaltyProgram` (PATCH/PUT/DELETE).
 * Today the program is create-only (POST blocks with 409 on existing) so the lock
 * is implicit; this helper exists so the rule survives future edit endpoints.
 */
export async function assertProgramEditable(merchantId: string): Promise<void> {
  const dirty = await prisma.loyaltyCard.findFirst({
    where: { merchantId, OR: [{ totalEarned: { gt: 0 } }, { totalRedeemed: { gt: 0 } }] },
    select: { id: true },
  });
  if (dirty) {
    throw new ApiError(409, "Program is locked because customers already earned or redeemed");
  }
}

// POST /programs — Create a loyalty program with reward tiers
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId!;
    const { type, goalStamps, welcomeStamps, welcomePoints, pointsPerCurrency, rewardTiers } = req.body;

    if (typeof type !== "string" || !["POINTS", "STAMPS"].includes(type)) {
      throw new ApiError(400, "type must be POINTS or STAMPS");
    }

    const existing = await prisma.loyaltyProgram.findUnique({ where: { merchantId } });
    if (existing) {
      throw new ApiError(409, "You already have a loyalty program");
    }

    if (type === "STAMPS" && (typeof goalStamps !== "number" || goalStamps < 1)) {
      throw new ApiError(400, "goalStamps must be a positive number for STAMPS programs");
    }

    if (type === "POINTS" && pointsPerCurrency !== undefined && (typeof pointsPerCurrency !== "number" || pointsPerCurrency <= 0)) {
      throw new ApiError(400, "pointsPerCurrency must be a positive number");
    }

    if (!Array.isArray(rewardTiers) || rewardTiers.length === 0) {
      throw new ApiError(400, "At least one reward tier is required");
    }

    for (const tier of rewardTiers) {
      if (
        typeof tier !== "object" || tier === null
        || typeof tier.threshold !== "number" || tier.threshold <= 0
        || typeof tier.rewardName !== "string" || tier.rewardName.trim().length === 0
      ) {
        throw new ApiError(400, "Each reward tier needs a positive threshold and a non-empty rewardName");
      }
    }

    const program = await prisma.loyaltyProgram.create({
      data: {
        merchantId,
        type: type as "POINTS" | "STAMPS",
        goalStamps: type === "STAMPS" ? goalStamps : null,
        welcomeStamps: type === "STAMPS" ? (welcomeStamps || 0) : null,
        welcomePoints: type === "POINTS" ? (welcomePoints || 0) : null,
        pointsPerCurrency: type === "POINTS" ? (pointsPerCurrency || 1) : null,
        rewardTiers: {
          create: rewardTiers.map((tier: { name: string; threshold: number; rewardName: string }, i: number) => ({
            name: tier.name,
            threshold: tier.threshold,
            rewardName: tier.rewardName,
            sortOrder: i,
          })),
        },
      },
      include: { rewardTiers: { orderBy: { sortOrder: "asc" } } },
    });

    res.status(201).json(program);
  } catch (err) {
    next(err);
  }
});

// GET /programs/mine — Get current merchant's loyalty program
router.get("/mine", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId!;

    const program = await prisma.loyaltyProgram.findUnique({
      where: { merchantId },
      include: { rewardTiers: { orderBy: { sortOrder: "asc" } } },
    });

    if (!program) {
      res.json(null);
      return;
    }

    const cardWithActivity = await prisma.loyaltyCard.findFirst({
      where: { merchantId, OR: [{ totalEarned: { gt: 0 } }, { totalRedeemed: { gt: 0 } }] },
      select: { id: true },
    });

    res.json({ ...program, hasTransactions: Boolean(cardWithActivity) });
  } catch (err) {
    next(err);
  }
});

export default router;
