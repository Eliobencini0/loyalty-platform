import crypto from "crypto";
import prisma from "../../../prisma";
import type { WalletSummary } from "../../walletSummary";

function compactSummary(summary: WalletSummary): string {
  const parts = [summary.pointsBalanceDisplay];

  if (summary.tierName) {
    parts.push(summary.tierName);
  }

  if (summary.activePrizeCount > 0) {
    parts.push(`${summary.activePrizeCount} rewards`);
  }

  if (summary.nearestPrizeExpiration) {
    const date = new Date(summary.nearestPrizeExpiration).toLocaleDateString("en-CA");
    parts.push(`exp ${date}`);
  }

  return parts.join(" · ");
}

function buildSnapshotHash(summary: WalletSummary): string {
  return crypto.createHash("sha256").update(JSON.stringify({
    pointsBalance: summary.pointsBalance,
    tierName: summary.tierName,
    activePrizeCount: summary.activePrizeCount,
    activePrizes: summary.activePrizes.map((prize) => ({
      id: prize.id,
      expiresAt: prize.expiresAt,
    })),
  })).digest("hex");
}

/**
 * Generate Google Wallet pass save URL
 * Uses Google Wallet REST API to create a loyalty object
 */
export async function generateGoogleWalletPass(summary: WalletSummary): Promise<string> {
  const serviceAccountEmail = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL;
  const serviceAccountKey = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_KEY;
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;

  if (!serviceAccountEmail || !serviceAccountKey || !issuerId) {
    const missing = [];
    if (!serviceAccountEmail) missing.push("GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL");
    if (!serviceAccountKey) missing.push("GOOGLE_WALLET_SERVICE_ACCOUNT_KEY");
    if (!issuerId) missing.push("GOOGLE_WALLET_ISSUER_ID");
    throw new Error(`Google Wallet configuration incomplete. Missing: ${missing.join(", ")}`);
  }

  console.log("Google Wallet pass generation:", {
    issuerId,
    serviceAccountEmail,
    hasKey: !!serviceAccountKey,
    walletPassId: summary.walletPassId,
  });

  // Build the loyalty class ID and object ID
  const classId = `${issuerId}.loyalty-card-class`;
  const objectId = `${issuerId}.${summary.walletPassId}`;

  // Create loyalty object payload
  const loyaltyObject = {
    id: objectId,
    classId,
    state: "ACTIVE",
    barcode: {
      type: "QR_CODE",
      value: summary.merchantScanToken,
    },
    accountName: summary.customerName,
    accountId: summary.loyaltyCardId,
    loyaltyPoints: {
      label: summary.tierName || "Points",
      balance: {
        int: summary.pointsBalance,
      },
    },
    textModulesData: [
      {
        header: "Card Number",
        body: summary.cardNumber,
      },
      {
        header: "Status",
        body: compactSummary(summary),
      },
    ],
    linksModuleData: {
      uris: [
        {
          uri: `${process.env.PUBLIC_URL || "https://loyali.online"}/app/loyalty/${summary.customerAccessToken}`,
          description: "View Loyalty Details",
        },
      ],
    },
  };

  // Sign JWT for Google Wallet
  const claims = {
    iss: serviceAccountEmail,
    aud: "google",
    origins: [],
    typ: "savetowallet",
    payload: {
      loyaltyObjects: [loyaltyObject],
    },
  };

  // Create JWT token (simplified - in production use proper JWT library)
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");

  // Normalize escaped newlines — env files / GitHub secrets typically store
  // the PEM key with literal `\n` instead of real newlines, which breaks PEM parsing.
  const normalizedKey = serviceAccountKey.replace(/\\n/g, "\n");

  // Sign with RSA private key
  let signature: string;
  try {
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(`${header}.${payload}`);
    signature = sign.sign(normalizedKey, "base64url");
  } catch (err) {
    console.error("Google Wallet JWT signing error:", err);
    throw new Error(`Failed to sign JWT: ${err instanceof Error ? err.message : "Unknown error"}`);
  }

  const jwt = `${header}.${payload}.${signature}`;

  // Update wallet pass metadata
  await prisma.walletPass.update({
    where: { id: summary.walletPassId },
    data: {
      lastSnapshotHash: buildSnapshotHash(summary),
      lastIssuedAt: new Date(),
      status: "ACTIVE",
    },
  });

  const saveUrl = `https://pay.google.com/gp/v/save/${jwt}`;
  console.log("Google Wallet save URL generated:", { saveUrl: saveUrl.substring(0, 80) + "..." });

  // Return Google Wallet save URL
  return saveUrl;
}
