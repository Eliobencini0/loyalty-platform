import crypto from "crypto";
import prisma from "../prisma";

function randomToken(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(24).toString("base64url")}`;
}

export async function getOrCreateWalletPass(loyaltyCardId: string, provider: "APPLE_WALLET" | "GOOGLE_WALLET") {
  const existing = await prisma.walletPass.findUnique({
    where: {
      loyaltyCardId_provider: {
        loyaltyCardId,
        provider,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.walletPass.create({
    data: {
      loyaltyCardId,
      provider,
    },
  });
}

export async function getOrCreateWalletScanToken(walletPassId: string) {
  const existing = await prisma.walletScanToken.findFirst({
    where: {
      walletPassId,
      active: true,
      revokedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return existing;
  }

  return prisma.walletScanToken.create({
    data: {
      walletPassId,
      token: randomToken("ws"),
    },
  });
}

export async function getOrCreateWalletAccessToken(walletPassId: string) {
  const existing = await prisma.walletAccessToken.findFirst({
    where: {
      walletPassId,
      active: true,
      revokedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return existing;
  }

  return prisma.walletAccessToken.create({
    data: {
      walletPassId,
      token: randomToken("wa"),
    },
  });
}

export async function resolveWalletScanToken(token: string) {
  return prisma.walletScanToken.findUnique({
    where: { token },
    include: {
      walletPass: {
        include: {
          loyaltyCard: {
            include: {
              customer: true,
              merchant: true,
              cardTemplate: true,
            },
          },
        },
      },
    },
  });
}

export async function resolveWalletAccessToken(token: string) {
  return prisma.walletAccessToken.findUnique({
    where: { token },
    include: {
      walletPass: {
        include: {
          loyaltyCard: {
            include: {
              customer: true,
              merchant: true,
              cardTemplate: true,
            },
          },
        },
      },
    },
  });
}
