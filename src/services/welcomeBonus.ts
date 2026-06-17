import prisma from "../prisma";

/**
 * Apply the merchant's welcome bonus to a freshly-created loyalty card.
 *
 * Reads the merchant's active LoyaltyProgram. If it grants welcome points/stamps,
 * we increment the card's pointsBalance accordingly and write a PointsTransaction
 * so the customer sees the bonus in their activity feed.
 *
 * Safe to call multiple times only on freshly-created cards — callers must guard
 * against double-application by only invoking this when a NEW card was created.
 */
export async function applyWelcomeBonus(args: {
  merchantId: string;
  loyaltyCardId: string;
}): Promise<{ pointsAdded: number; stampsAdded: number } | null> {
  const { merchantId, loyaltyCardId } = args;

  const program = await prisma.loyaltyProgram.findFirst({
    where: { merchantId, active: true },
  });

  if (!program) return null;

  const welcomePoints = program.type === "POINTS" ? (program.welcomePoints ?? 0) : 0;
  const welcomeStamps = program.type === "STAMPS" ? (program.welcomeStamps ?? 0) : 0;

  if (welcomePoints <= 0 && welcomeStamps <= 0) return null;

  const delta = welcomePoints || welcomeStamps;

  await prisma.$transaction(async (tx) => {
    const updated = await tx.loyaltyCard.update({
      where: { id: loyaltyCardId },
      data: {
        pointsBalance: { increment: delta },
        totalEarned: { increment: delta },
      },
    });

    await tx.pointsTransaction.create({
      data: {
        loyaltyCardId,
        type: "BONUS",
        points: delta,
        balanceAfter: updated.pointsBalance,
        description: program.type === "POINTS" ? "Welcome bonus" : "Welcome stamp",
      },
    });
  });

  return { pointsAdded: welcomePoints, stampsAdded: welcomeStamps };
}
