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

export async function generateWalletWalletApplePass(summary: WalletSummary): Promise<Buffer> {
  const apiKey = process.env.WALLETWALLET_API_KEY;
  if (!apiKey) {
    throw new Error("WALLETWALLET_API_KEY is not configured. Please set the environment variable.");
  }

  // Build payload - only include image URLs if they are real URLs (not placeholders)
  const payload: Record<string, unknown> = {
    barcodeValue: summary.merchantScanToken,
    barcodeFormat: "QR",
    title: summary.merchantName,
    cardLabel: "LOYALTY",
    label: summary.customerName,
    value: compactSummary(summary),
    expirationDays: 365, // WalletWallet only accepts: 30, 90, 365
    colorPreset: process.env.WALLETWALLET_COLOR_PRESET || "dark",
  };

  // Only add image URLs if they are configured and NOT placeholders
  const logoURL = process.env.WALLETWALLET_LOGO_URL;
  const thumbnailURL = process.env.WALLETWALLET_THUMBNAIL_URL;
  const stripURL = process.env.WALLETWALLET_STRIP_URL;

  if (logoURL && !logoURL.includes("placehold.co")) {
    payload.logoURL = logoURL;
  }
  if (thumbnailURL && !thumbnailURL.includes("placehold.co")) {
    payload.thumbnailURL = thumbnailURL;
  }
  if (stripURL && !stripURL.includes("placehold.co")) {
    payload.stripURL = stripURL;
  }

  console.log("WalletWallet API request:", {
    url: "https://api.walletwallet.dev/api/pkpass",
    hasApiKey: !!apiKey,
    payload,
  });

  const response = await fetch("https://api.walletwallet.dev/api/pkpass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("WalletWallet API error:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(`WalletWallet API error (${response.status}): ${errorText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  await prisma.walletPass.update({
    where: { id: summary.walletPassId },
    data: {
      lastSnapshotHash: buildSnapshotHash(summary),
      lastIssuedAt: new Date(),
      status: "ACTIVE",
    },
  });

  return buffer;
}
