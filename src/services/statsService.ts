import { Prisma } from "@prisma/client";
import prisma from "../prisma";

export type Period = "24h" | "7d" | "30d";

export interface Window {
  since: Date;
  windowMs: number;
}

export function parsePeriod(value?: string): Period {
  if (value === "24h" || value === "7d" || value === "30d") return value;
  return "7d";
}

export function resolvePeriodMs(period: Period): number {
  if (period === "24h") return 24 * 60 * 60 * 1000;
  if (period === "30d") return 30 * 24 * 60 * 60 * 1000;
  return 7 * 24 * 60 * 60 * 1000;
}

export function parseWindow(query: { period?: string; from?: string; to?: string }): Window {
  const { from, to } = query;
  if (typeof from === "string" && typeof to === "string") {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (!Number.isNaN(fromDate.getTime()) && !Number.isNaN(toDate.getTime()) && toDate > fromDate) {
      return { since: fromDate, windowMs: toDate.getTime() - fromDate.getTime() };
    }
  }
  const period = parsePeriod(query.period);
  const windowMs = resolvePeriodMs(period);
  return { since: new Date(Date.now() - windowMs), windowMs };
}

function calculateTrend(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null) return null;
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function isMissingFeedbackTableError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021";
}

async function getAverageRating(merchantId: string, start: Date, end?: Date): Promise<number | null> {
  const where = {
    merchantId,
    createdAt: end ? { gte: start, lt: end } : { gte: start },
  };

  const result = await prisma.merchantFeedback.aggregate({
    where,
    _avg: { rating: true },
  });

  return result._avg.rating === null ? null : Number(result._avg.rating.toFixed(1));
}

async function countNearRewardCustomers(merchantId: string): Promise<number> {
  const program = await prisma.loyaltyProgram.findUnique({
    where: { merchantId },
    include: { rewardTiers: { orderBy: { threshold: "asc" } } },
  });

  if (!program || program.type !== "POINTS" || program.rewardTiers.length === 0) return 0;

  const cards = await prisma.loyaltyCard.findMany({
    where: { merchantId, status: "ACTIVE" },
    select: { pointsBalance: true },
  });

  let nearRewardCustomers = 0;

  for (const card of cards) {
    const nextTier = program.rewardTiers.find((tier) => card.pointsBalance < tier.threshold);
    if (!nextTier) continue;

    const remaining = nextTier.threshold - card.pointsBalance;
    const thresholdWindow = Math.max(10, Math.floor(nextTier.threshold * 0.1));
    if (remaining <= thresholdWindow) nearRewardCustomers += 1;
  }

  return nearRewardCustomers;
}

async function countRewardReadyCustomers(merchantId: string): Promise<number> {
  const program = await prisma.loyaltyProgram.findUnique({
    where: { merchantId },
    include: { rewardTiers: { orderBy: { threshold: "asc" } } },
  });

  if (!program || program.type !== "POINTS" || program.rewardTiers.length === 0) return 0;

  const minThreshold = program.rewardTiers[0].threshold;

  return prisma.loyaltyCard.count({
    where: { merchantId, status: "ACTIVE", pointsBalance: { gte: minThreshold } },
  });
}

async function countInactiveCustomers(merchantId: string): Promise<number> {
  const cards = await prisma.loyaltyCard.findMany({
    where: { merchantId, status: "ACTIVE" },
    select: {
      id: true,
      updatedAt: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  const staleLimit = Date.now() - 30 * 24 * 60 * 60 * 1000;
  let inactiveCount = 0;

  for (const card of cards) {
    const lastTransaction = card.transactions[0]?.createdAt?.getTime() ?? 0;
    const lastActivity = Math.max(lastTransaction, card.updatedAt.getTime());
    if (lastActivity < staleLimit) inactiveCount += 1;
  }

  return inactiveCount;
}

export interface InsightsKpis {
  activeCommunity: number;
  newUsers: number;
  activeMembers: number;
  newMembers: number;
  returningCustomers: number;
  reviewsCount: number;
  nearRewardCustomers: number;
  avgRating: number | null;
  retention: number | null;
  trends: {
    activeMembers: number | null;
    newMembers: number | null;
    nearRewardCustomers: number | null;
    avgRating: number | null;
    retention: number | null;
  };
}

export async function getDashboardStats(merchantId: string, window: Window = { since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), windowMs: 7 * 24 * 60 * 60 * 1000 }): Promise<InsightsKpis> {
  const { since, windowMs } = window;
  const previousSince = new Date(since.getTime() - windowMs);

  const [
    activeMembers,
    previousActiveMembers,
    newMembers,
    previousNewMembers,
    activeBeforeSince,
    existingBeforeSince,
    activeBeforePreviousSince,
    existingBeforePreviousSince,
    nearRewardCustomers,
    returningCardsRaw,
  ] = await Promise.all([
    prisma.loyaltyCard.count({ where: { merchantId, status: "ACTIVE" } }),
    prisma.loyaltyCard.count({ where: { merchantId, status: "ACTIVE", createdAt: { lt: since } } }),
    prisma.loyaltyCard.count({ where: { merchantId, createdAt: { gte: since } } }),
    prisma.loyaltyCard.count({ where: { merchantId, createdAt: { gte: previousSince, lt: since } } }),
    prisma.loyaltyCard.count({ where: { merchantId, status: "ACTIVE", createdAt: { lt: since } } }),
    prisma.loyaltyCard.count({ where: { merchantId, createdAt: { lt: since } } }),
    prisma.loyaltyCard.count({ where: { merchantId, status: "ACTIVE", createdAt: { lt: previousSince } } }),
    prisma.loyaltyCard.count({ where: { merchantId, createdAt: { lt: previousSince } } }),
    countNearRewardCustomers(merchantId),
    prisma.loyaltyCard.findMany({
      where: {
        merchantId,
        createdAt: { lt: since },
        transactions: { some: { createdAt: { gte: since } } },
      },
      select: { id: true },
    }),
  ]);

  const returningCustomers = returningCardsRaw.length;

  let reviewsCount = 0;
  try {
    reviewsCount = await prisma.merchantFeedback.count({
      where: { merchantId, createdAt: { gte: since } },
    });
  } catch (err) {
    if (!isMissingFeedbackTableError(err)) throw err;
  }

  let avgRating: number | null = null;
  let previousAvgRating: number | null = null;

  try {
    [avgRating, previousAvgRating] = await Promise.all([
      getAverageRating(merchantId, since),
      getAverageRating(merchantId, previousSince, since),
    ]);
  } catch (err) {
    if (!isMissingFeedbackTableError(err)) throw err;
  }

  const retention = existingBeforeSince > 0 ? Number(((activeBeforeSince / existingBeforeSince) * 100).toFixed(1)) : null;
  const previousRetention =
    existingBeforePreviousSince > 0
      ? Number(((activeBeforePreviousSince / existingBeforePreviousSince) * 100).toFixed(1))
      : null;

  return {
    activeCommunity: activeMembers,
    newUsers: newMembers,
    activeMembers,
    newMembers,
    returningCustomers,
    reviewsCount,
    nearRewardCustomers,
    avgRating,
    retention,
    trends: {
      activeMembers: calculateTrend(activeMembers, previousActiveMembers),
      newMembers: calculateTrend(newMembers, previousNewMembers),
      nearRewardCustomers: null,
      avgRating: calculateTrend(avgRating, previousAvgRating),
      retention: calculateTrend(retention, previousRetention),
    },
  };
}

export interface FeedbackRow {
  id: string;
  customerName: string;
  rating: number;
  createdAt: Date;
  text: string;
  isNew: boolean;
  foodRating: number | null;
  serviceRating: number | null;
  atmosphereRating: number | null;
  source: string;
}

export async function getRecentFeedback(merchantId: string, window: Window, limit: number): Promise<FeedbackRow[]> {
  const { since } = window;

  try {
    const feedbackRows = await prisma.merchantFeedback.findMany({
      where: { merchantId, createdAt: { gte: since } },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(Math.max(limit, 1), 30),
    });

    return feedbackRows.map((row) => ({
      id: row.id,
      customerName: row.customer ? `${row.customer.firstName} ${row.customer.lastName}`.trim() : "Anonymous",
      rating: row.rating,
      createdAt: row.createdAt,
      text: row.text,
      isNew: !row.readAt,
      foodRating: row.foodRating,
      serviceRating: row.serviceRating,
      atmosphereRating: row.atmosphereRating,
      source: row.source,
    }));
  } catch (err) {
    if (!isMissingFeedbackTableError(err)) throw err;
    return [];
  }
}

export interface SentimentData {
  total: number;
  average: number | null;
  distribution: { "1": number; "2": number; "3": number; "4": number; "5": number };
}

export async function getSentimentAnalysis(merchantId: string, window: Window): Promise<SentimentData> {
  const { since } = window;

  try {
    const feedbackRows = await prisma.merchantFeedback.findMany({
      where: { merchantId, createdAt: { gte: since } },
      select: { rating: true },
    });

    const distribution = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    for (const row of feedbackRows) {
      const key = String(Math.max(1, Math.min(5, row.rating))) as keyof typeof distribution;
      distribution[key] += 1;
    }

    const total = feedbackRows.length;
    const average = total > 0 ? Number((feedbackRows.reduce((sum, item) => sum + item.rating, 0) / total).toFixed(1)) : null;

    return { total, average, distribution };
  } catch (err) {
    if (!isMissingFeedbackTableError(err)) throw err;
    return { total: 0, average: null, distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } };
  }
}

export interface Notification {
  id: string;
  type: "reward_ready" | "near_reward" | "inactive";
  count: number;
  title: string;
  description: string;
  actionPath: string;
  severity: "high" | "medium";
}

export async function getNotifications(merchantId: string): Promise<Notification[]> {
  const [nearRewardCustomers, inactiveCustomers, rewardReadyCustomers] = await Promise.all([
    countNearRewardCustomers(merchantId),
    countInactiveCustomers(merchantId),
    countRewardReadyCustomers(merchantId),
  ]);

  const notifications: Notification[] = [];

  // English fallback strings — clients SHOULD localize using `type` + `count`.
  if (rewardReadyCustomers > 0) {
    notifications.push({
      id: "reward-ready",
      type: "reward_ready",
      count: rewardReadyCustomers,
      title: "Customers ready to redeem",
      description: `${rewardReadyCustomers} customer${rewardReadyCustomers === 1 ? "" : "s"} can redeem now.`,
      actionPath: "/customers",
      severity: "high",
    });
  }

  if (nearRewardCustomers > 0) {
    notifications.push({
      id: "near-reward",
      type: "near_reward",
      count: nearRewardCustomers,
      title: "Customers close to reward",
      description: `${nearRewardCustomers} customer${nearRewardCustomers === 1 ? " is" : "s are"} close to next tier.`,
      actionPath: "/insights",
      severity: "medium",
    });
  }

  if (inactiveCustomers > 0) {
    notifications.push({
      id: "inactive-customers",
      type: "inactive",
      count: inactiveCustomers,
      title: "Inactive customers over 30 days",
      description: `${inactiveCustomers} customer${inactiveCustomers === 1 ? "" : "s"} need re-engagement.`,
      actionPath: "/customers",
      severity: "high",
    });
  }

  return notifications;
}
