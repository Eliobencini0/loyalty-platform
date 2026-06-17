import prisma from "../prisma";

export interface CustomerListItem {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  pointsBalance: number;
  status: string;
  lastVisitAt: Date;
}

export interface CustomerListResult {
  data: CustomerListItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function getCustomers(
  merchantId: string,
  options: {
    page: number;
    limit: number;
    search?: string;
  }
): Promise<CustomerListResult> {
  const { page, limit, search } = options;
  const skip = (page - 1) * limit;

  // Stricter multi-token search:
  //   - 1 token  → startsWith across firstName/lastName/email/phone
  //   - N tokens → first token must EQUAL firstName, the rest startsWith
  //                lastName / email / phone
  // Example: "el b" matches firstName="el" lastName="b" only — NOT "elio b".
  const tokens = search ? search.split(/\s+/).filter(Boolean) : [];
  const insensitive = "insensitive" as const;
  let customerFilter: Record<string, unknown> | undefined;

  if (tokens.length === 1) {
    const token = tokens[0];
    customerFilter = {
      OR: [
        { firstName: { startsWith: token, mode: insensitive } },
        { lastName: { startsWith: token, mode: insensitive } },
        { email: { startsWith: token, mode: insensitive } },
        { phone: { startsWith: token, mode: insensitive } },
      ],
    };
  } else if (tokens.length > 1) {
    const [first, ...rest] = tokens;
    customerFilter = {
      AND: [
        { firstName: { equals: first, mode: insensitive } },
        ...rest.map((token) => ({
          OR: [
            { lastName: { startsWith: token, mode: insensitive } },
            { email: { startsWith: token, mode: insensitive } },
            { phone: { startsWith: token, mode: insensitive } },
          ],
        })),
      ],
    };
  }

  const where = {
    merchantId,
    ...(customerFilter ? { customer: customerFilter } : {}),
  };

  const [cards, total] = await Promise.all([
    prisma.loyaltyCard.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
    prisma.loyaltyCard.count({ where }),
  ]);

  const data = cards.map((card) => ({
    id: card.id,
    customerId: card.customer.id,
    firstName: card.customer.firstName,
    lastName: card.customer.lastName,
    email: card.customer.email,
    phone: card.customer.phone,
    avatarUrl: card.customer.avatarUrl,
    pointsBalance: card.pointsBalance,
    status: card.status,
    lastVisitAt: card.transactions[0]?.createdAt ?? card.updatedAt,
  }));

  return {
    data,
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

export interface CustomerCard {
  id: string;
  cardNumber: string;
  customerId: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  pointsBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  redemptionsCount: number;
  status: string;
  recentTransactions: Array<{
    id: string;
    type: string;
    points: number;
    balanceAfter: number;
    description: string | null;
    createdAt: Date;
  }>;
  enrolledAt: Date;
  program: {
    type: "POINTS" | "STAMPS";
    goalStamps: number | null;
    pointsPerCurrency: number | null;
    rewardTiers: Array<{
      id: string;
      name: string;
      rewardName: string;
      threshold: number;
      sortOrder: number;
    }>;
  } | null;
}

export async function getCustomerCard(merchantId: string, customerId: string): Promise<CustomerCard | null> {
  const card = await prisma.loyaltyCard.findFirst({
    where: {
      merchantId,
      customerId,
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatarUrl: true,
        },
      },
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          type: true,
          points: true,
          balanceAfter: true,
          description: true,
          createdAt: true,
        },
      },
    },
  });

  if (!card) return null;

  const program = await prisma.loyaltyProgram.findUnique({
    where: { merchantId },
    include: {
      rewardTiers: { orderBy: { sortOrder: "asc" } },
    },
  });

  const redemptionsCount = await prisma.pointsTransaction.count({
    where: { loyaltyCardId: card.id, type: "REDEEM" },
  });

  return {
    id: card.id,
    cardNumber: card.cardNumber,
    customerId: card.customer.id,
    firstName: card.customer.firstName,
    lastName: card.customer.lastName,
    email: card.customer.email,
    phone: card.customer.phone,
    avatarUrl: card.customer.avatarUrl,
    pointsBalance: card.pointsBalance,
    totalEarned: card.totalEarned,
    totalRedeemed: card.totalRedeemed,
    redemptionsCount,
    status: card.status,
    recentTransactions: card.transactions,
    enrolledAt: card.createdAt,
    program: program
      ? {
          type: program.type,
          goalStamps: program.goalStamps,
          pointsPerCurrency: program.pointsPerCurrency ? Number(program.pointsPerCurrency) : null,
          rewardTiers: program.rewardTiers.map((t) => ({
            id: t.id,
            name: t.name,
            rewardName: t.rewardName,
            threshold: t.threshold,
            sortOrder: t.sortOrder,
          })),
        }
      : null,
  };
}

export interface AddPointsResult {
  success: true;
  transaction: {
    id: string;
    points: number;
    balanceAfter: number;
    createdAt: Date;
  };
  card: {
    pointsBalance: number;
    totalEarned: number;
  };
}

export async function addPointsToCustomer(
  merchantId: string,
  customerId: string,
  points: number,
  description?: string
): Promise<AddPointsResult> {
  const card = await prisma.loyaltyCard.findFirst({
    where: {
      merchantId,
      customerId,
    },
  });

  if (!card) {
    throw new Error("Customer not found or not enrolled in your program");
  }

  const newBalance = card.pointsBalance + points;

  // Create transaction and update card in a transaction
  const [transaction, updatedCard] = await prisma.$transaction([
    prisma.pointsTransaction.create({
      data: {
        loyaltyCardId: card.id,
        type: "EARN",
        points,
        balanceAfter: newBalance,
        description: description || `Points added by merchant`,
      },
    }),
    prisma.loyaltyCard.update({
      where: { id: card.id },
      data: {
        pointsBalance: newBalance,
        totalEarned: card.totalEarned + points,
      },
    }),
  ]);

  return {
    success: true,
    transaction: {
      id: transaction.id,
      points: transaction.points,
      balanceAfter: transaction.balanceAfter,
      createdAt: transaction.createdAt,
    },
    card: {
      pointsBalance: updatedCard.pointsBalance,
      totalEarned: updatedCard.totalEarned,
    },
  };
}

export interface RewardTier {
  id: string;
  name: string;
  rewardName: string;
  threshold: number;
  sortOrder: number;
}

export interface AvailableRewardsResult {
  availableRewards: RewardTier[];
  allRewards: RewardTier[];
  currentPoints: number;
}

export async function getAvailableRewards(merchantId: string, customerId: string): Promise<AvailableRewardsResult> {
  const card = await prisma.loyaltyCard.findFirst({
    where: {
      merchantId,
      customerId,
    },
  });

  if (!card) {
    throw new Error("Customer not found or not enrolled in your program");
  }

  const program = await prisma.loyaltyProgram.findUnique({
    where: { merchantId },
    include: {
      rewardTiers: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!program || !program.rewardTiers.length) {
    return { availableRewards: [], allRewards: [], currentPoints: card.pointsBalance };
  }

  const currentPoints = card.pointsBalance;
  const availableRewards = program.rewardTiers.filter((tier) => currentPoints >= tier.threshold);

  const formatTier = (tier: any): RewardTier => ({
    id: tier.id,
    name: tier.name,
    rewardName: tier.rewardName,
    threshold: tier.threshold,
    sortOrder: tier.sortOrder,
  });

  return {
    availableRewards: availableRewards.map(formatTier),
    allRewards: program.rewardTiers.map(formatTier),
    currentPoints,
  };
}

export interface RedeemRewardResult {
  success: true;
  transaction: {
    id: string;
    points: number;
    balanceAfter: number;
    createdAt: Date;
  };
  card: {
    pointsBalance: number;
    totalRedeemed: number;
  };
  reward: {
    name: string;
    rewardName: string;
    threshold: number;
  };
}

export async function redeemReward(
  merchantId: string,
  customerId: string,
  rewardTierId: string
): Promise<RedeemRewardResult> {
  const card = await prisma.loyaltyCard.findFirst({
    where: {
      merchantId,
      customerId,
    },
  });

  if (!card) {
    throw new Error("Customer not found or not enrolled in your program");
  }

  const rewardTier = await prisma.rewardTier.findUnique({
    where: { id: rewardTierId },
    include: { loyaltyProgram: true },
  });

  if (!rewardTier || rewardTier.loyaltyProgram.merchantId !== merchantId) {
    throw new Error("Reward tier not found");
  }

  if (card.pointsBalance < rewardTier.threshold) {
    throw new Error(`Insufficient points. Need ${rewardTier.threshold}, have ${card.pointsBalance}`);
  }

  const newBalance = card.pointsBalance - rewardTier.threshold;

  const [transaction, updatedCard] = await prisma.$transaction([
    prisma.pointsTransaction.create({
      data: {
        loyaltyCardId: card.id,
        type: "REDEEM",
        points: -rewardTier.threshold,
        balanceAfter: newBalance,
        description: `Redeemed: ${rewardTier.rewardName}`,
      },
    }),
    prisma.loyaltyCard.update({
      where: { id: card.id },
      data: {
        pointsBalance: newBalance,
        totalRedeemed: card.totalRedeemed + rewardTier.threshold,
      },
    }),
  ]);

  return {
    success: true,
    transaction: {
      id: transaction.id,
      points: transaction.points,
      balanceAfter: transaction.balanceAfter,
      createdAt: transaction.createdAt,
    },
    card: {
      pointsBalance: updatedCard.pointsBalance,
      totalRedeemed: updatedCard.totalRedeemed,
    },
    reward: {
      name: rewardTier.name,
      rewardName: rewardTier.rewardName,
      threshold: rewardTier.threshold,
    },
  };
}
