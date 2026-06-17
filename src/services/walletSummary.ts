import prisma from "../prisma";
import { getOrCreateWalletAccessToken, getOrCreateWalletPass, getOrCreateWalletScanToken } from "./walletTokens";

export interface WalletSummary {
  walletPassId: string;
  loyaltyCardId: string;
  merchantId: string;
  merchantName: string;
  customerId: string;
  customerName: string;
  cardNumber: string;
  pointsBalance: number;
  pointsBalanceDisplay: string;
  tierName: string | null;
  activePrizeCount: number;
  activePrizes: Array<{
    id: string;
    prizeWinId: string;
    name: string;
    prizeType: string;
    expiresAt: string;
    redemptionCode: string;
    campaignId: string;
    campaignName: string;
    wonAt: string;
  }>;
  availableRewards: Array<{
    id: string;
    name: string;
    rewardName: string;
    threshold: number;
    sortOrder: number;
  }>;
  recentHistory: Array<{
    id: string;
    type: "POINTS" | "PRIZE";
    event: string;
    description: string;
    pointsDelta: number | null;
    createdAt: string;
  }>;
  nearestPrizeExpiration: string | null;
  merchantScanToken: string;
  customerAccessToken: string;
  nextReward: {
    name: string;
    rewardName: string;
    threshold: number;
    pointsToGo: number;
    progress: number;
  } | null;
  marketingOptedIn: boolean;
}

export async function buildWalletSummary(loyaltyCardId: string, provider: "APPLE_WALLET" | "GOOGLE_WALLET" = "APPLE_WALLET"): Promise<WalletSummary | null> {
  const loyaltyCard = await prisma.loyaltyCard.findUnique({
    where: { id: loyaltyCardId },
    include: {
      customer: true,
      merchant: true,
      cardTemplate: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      prizeWins: {
        where: {
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
        include: {
          prize: true,
          campaign: true,
        },
        orderBy: { expiresAt: "asc" },
      },
    },
  });

  if (!loyaltyCard) {
    return null;
  }

  const program = await prisma.loyaltyProgram.findUnique({
    where: { merchantId: loyaltyCard.merchantId },
    include: {
      rewardTiers: {
        orderBy: [{ threshold: "asc" }, { sortOrder: "asc" }],
      },
    },
  });

  const availableRewards = (program?.rewardTiers ?? [])
    .filter((tier) => loyaltyCard.pointsBalance >= tier.threshold)
    .map((tier) => ({
      id: tier.id,
      name: tier.name,
      rewardName: tier.rewardName,
      threshold: tier.threshold,
      sortOrder: tier.sortOrder,
    }));

  const currentTier = (program?.rewardTiers ?? [])
    .filter((tier) => loyaltyCard.pointsBalance >= tier.threshold)
    .sort((a, b) => b.threshold - a.threshold)[0] ?? null;

  const nextTier = (program?.rewardTiers ?? [])
    .filter((tier) => loyaltyCard.pointsBalance < tier.threshold)
    .sort((a, b) => a.threshold - b.threshold)[0] ?? null;

  const nextReward = nextTier
    ? {
        name: nextTier.name,
        rewardName: nextTier.rewardName,
        threshold: nextTier.threshold,
        pointsToGo: Math.max(0, nextTier.threshold - loyaltyCard.pointsBalance),
        progress: nextTier.threshold > 0
          ? Math.min(1, loyaltyCard.pointsBalance / nextTier.threshold)
          : 0,
      }
    : null;

  const walletPass = await getOrCreateWalletPass(loyaltyCard.id, provider);
  const [scanToken, accessToken] = await Promise.all([
    getOrCreateWalletScanToken(walletPass.id),
    getOrCreateWalletAccessToken(walletPass.id),
  ]);

  const recentPointEvents = loyaltyCard.transactions.map((tx) => ({
    id: tx.id,
    type: "POINTS" as const,
    event: tx.type,
    description: tx.description ?? tx.type,
    pointsDelta: tx.points,
    createdAt: tx.createdAt.toISOString(),
  }));

  const recentPrizeEvents = await prisma.prizeWin.findMany({
    where: {
      loyaltyCardId: loyaltyCard.id,
    },
    include: {
      prize: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const prizeHistory = recentPrizeEvents.map((prizeWin) => ({
    id: prizeWin.id,
    type: "PRIZE" as const,
    event: prizeWin.status,
    description: prizeWin.prize.name,
    pointsDelta: null,
    createdAt: prizeWin.createdAt.toISOString(),
  }));

  const recentHistory = [...recentPointEvents, ...prizeHistory]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  const activePrizes = loyaltyCard.prizeWins.map((prizeWin) => ({
    id: prizeWin.prize.id,
    prizeWinId: prizeWin.id,
    name: prizeWin.prize.name,
    prizeType: prizeWin.prize.prizeType,
    expiresAt: prizeWin.expiresAt.toISOString(),
    redemptionCode: prizeWin.redemptionCode,
    campaignId: prizeWin.campaignId,
    campaignName: prizeWin.campaign.name,
    wonAt: prizeWin.wonAt.toISOString(),
  }));

  return {
    walletPassId: walletPass.id,
    loyaltyCardId: loyaltyCard.id,
    merchantId: loyaltyCard.merchantId,
    merchantName: loyaltyCard.merchant.name,
    customerId: loyaltyCard.customerId,
    customerName: `${loyaltyCard.customer.firstName} ${loyaltyCard.customer.lastName}`.trim(),
    cardNumber: loyaltyCard.cardNumber,
    pointsBalance: loyaltyCard.pointsBalance,
    pointsBalanceDisplay: `${loyaltyCard.pointsBalance} pts`,
    tierName: currentTier?.name ?? loyaltyCard.cardTemplate?.tier ?? null,
    activePrizeCount: activePrizes.length,
    activePrizes,
    availableRewards,
    recentHistory,
    nearestPrizeExpiration: activePrizes[0]?.expiresAt ?? null,
    merchantScanToken: scanToken.token,
    customerAccessToken: accessToken.token,
    nextReward,
    marketingOptedIn: Boolean(loyaltyCard.marketingConsentAt && !loyaltyCard.marketingRevokedAt),
  };
}
