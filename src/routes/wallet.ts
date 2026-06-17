import { Router, Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { authenticateMerchant } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { buildWalletSummary } from "../services/walletSummary";
import { resolveWalletAccessToken, resolveWalletScanToken } from "../services/walletTokens";
import { generateWalletWalletApplePass } from "../services/wallet/providers/walletWalletApple";
import { generateGoogleWalletPass } from "../services/wallet/providers/googleWallet";

const router = Router();

/**
 * GET /wallet/config
 * Check wallet provider configuration status (authenticated, no sensitive details)
 */
router.get("/config", authenticateMerchant, async (req: Request, res: Response) => {
  res.json({
    appleWallet: {
      configured: !!process.env.WALLETWALLET_API_KEY,
    },
    googleWallet: {
      configured: !!(process.env.GOOGLE_WALLET_ISSUER_ID && process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_KEY),
    },
  });
});

/**
 * POST /wallet/scan/resolve
 * Resolve a wallet barcode token to merchant-facing loyalty context
 * Body: { barcodeToken: string }
 */
router.post("/scan/resolve", authenticateMerchant, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId!;
    const { barcodeToken } = req.body;

    if (!barcodeToken || typeof barcodeToken !== "string") {
      throw new ApiError(400, "barcodeToken is required");
    }

    const scanToken = await resolveWalletScanToken(barcodeToken);
    if (!scanToken || !scanToken.active || scanToken.revokedAt) {
      throw new ApiError(404, "Wallet pass not found");
    }

    const loyaltyCard = scanToken.walletPass.loyaltyCard;
    if (loyaltyCard.merchantId !== merchantId) {
      throw new ApiError(403, "Unauthorized");
    }

    const summary = await buildWalletSummary(loyaltyCard.id, scanToken.walletPass.provider);
    if (!summary) {
      throw new ApiError(404, "Wallet summary not found");
    }

    res.json(summary);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /wallet/access/:token/marketing-consent
 * Customer-side opt-in / opt-out for marketing communications.
 * Body: { accept: boolean }
 *
 * Flow: the token identifies the LoyaltyCard. The customer is acting on
 * their own card (no merchant API key) — this is the lawful path for
 * marketing consent (Art. 4(11) GDPR / EDPB 05/2020): merchant-side
 * "consent by proxy" is not allowed.
 */
router.post("/access/:token/marketing-consent", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessTokenValue = req.params.token;
    const { accept } = req.body ?? {};

    if (typeof accept !== "boolean") {
      throw new ApiError(400, "accept must be boolean");
    }

    const accessToken = await resolveWalletAccessToken(accessTokenValue);
    if (!accessToken || !accessToken.active || accessToken.revokedAt) {
      throw new ApiError(404, "Wallet access not found");
    }

    const cardId = accessToken.walletPass.loyaltyCardId;
    const now = new Date();

    if (accept) {
      await prisma.loyaltyCard.update({
        where: { id: cardId },
        data: { marketingConsentAt: now, marketingRevokedAt: null },
      });
    } else {
      await prisma.loyaltyCard.update({
        where: { id: cardId },
        data: { marketingRevokedAt: now },
      });
    }

    res.json({ success: true, marketingOptedIn: accept });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /wallet/access/:token
 * Resolve a stable customer wallet access token to a private loyalty summary
 */
router.get("/access/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessTokenValue = req.params.token;

    const accessToken = await resolveWalletAccessToken(accessTokenValue);
    if (!accessToken || !accessToken.active || accessToken.revokedAt) {
      throw new ApiError(404, "Wallet access not found");
    }

    const summary = await buildWalletSummary(accessToken.walletPass.loyaltyCardId, accessToken.walletPass.provider);
    if (!summary) {
      throw new ApiError(404, "Wallet summary not found");
    }

    res.json(summary);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /wallet/access/:token/apple-pass
 * Generate an Apple Wallet pass for the loyalty card behind a stable customer access token
 */
router.get("/access/:token/apple-pass", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessTokenValue = req.params.token;

    const accessToken = await resolveWalletAccessToken(accessTokenValue);
    if (!accessToken || !accessToken.active || accessToken.revokedAt) {
      throw new ApiError(404, "Wallet access not found");
    }

    const summary = await buildWalletSummary(accessToken.walletPass.loyaltyCardId, "APPLE_WALLET");
    if (!summary) {
      throw new ApiError(404, "Wallet summary not found");
    }

    const pkpass = await generateWalletWalletApplePass(summary);
    const safeMerchant = summary.merchantName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "loyalty-card";

    res.setHeader("Content-Type", "application/vnd.apple.pkpass");
    res.setHeader("Content-Disposition", `attachment; filename="${safeMerchant}.pkpass"`);
    res.send(pkpass);
  } catch (err) {
    console.error("Apple Wallet pass generation error:", err);
    if (err instanceof ApiError) {
      next(err);
    } else if (err instanceof Error) {
      next(new ApiError(500, `Failed to generate Apple Wallet pass: ${err.message}`));
    } else {
      next(new ApiError(500, "Failed to generate Apple Wallet pass"));
    }
  }
});

/**
 * GET /wallet/access/:token/google-pass
 * Generate a Google Wallet pass save URL for the loyalty card behind a stable customer access token
 */
router.get("/access/:token/google-pass", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessTokenValue = req.params.token;

    const accessToken = await resolveWalletAccessToken(accessTokenValue);
    if (!accessToken || !accessToken.active || accessToken.revokedAt) {
      throw new ApiError(404, "Wallet access not found");
    }

    const summary = await buildWalletSummary(accessToken.walletPass.loyaltyCardId, "GOOGLE_WALLET");
    if (!summary) {
      throw new ApiError(404, "Wallet summary not found");
    }

    const saveUrl = await generateGoogleWalletPass(summary);

    res.json({ saveUrl });
  } catch (err) {
    console.error("Google Wallet pass generation error:", err);
    if (err instanceof ApiError) {
      next(err);
    } else if (err instanceof Error) {
      next(new ApiError(500, `Failed to generate Google Wallet pass: ${err.message}`));
    } else {
      next(new ApiError(500, "Failed to generate Google Wallet pass"));
    }
  }
});

/**
 * GET /wallet/apple/:prizeWinId
 * Generate Apple Wallet pass for a prize win
 *
 * NOTE: Requires Apple Developer certificates and passkit configuration
 * This is a placeholder implementation
 */
router.get("/apple/:prizeWinId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prizeWinId } = req.params;

    const prizeWin = await prisma.prizeWin.findUnique({
      where: { id: prizeWinId },
      include: {
        prize: true,
        customer: true,
        loyaltyCard: true,
        campaign: {
          include: {
            merchant: true,
          },
        },
      },
    });

    if (!prizeWin) {
      throw new ApiError(404, "Prize not found");
    }

    // TODO: Generate PKPass file using passkit-generator or similar
    // Requires:
    // - Apple Developer certificates (signerCert, signerKey)
    // - Pass template with logo, icon, background images
    // - Pass.json with prize details, barcode (redemptionCode), expiration

    // For now, return a JSON representation of what the pass would contain
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.loyali.prize",
      serialNumber: prizeWin.id,
      teamIdentifier: "TEAM_ID",
      organizationName: prizeWin.campaign.merchant.name,
      description: `${prizeWin.prize.name} - ${prizeWin.campaign.merchant.name}`,
      logoText: prizeWin.campaign.merchant.name,
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(79, 70, 229)",
      labelColor: "rgb(255, 255, 255)",
      barcode: {
        message: prizeWin.redemptionCode,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1",
      },
      storeCard: {
        headerFields: [
          {
            key: "expires",
            label: "EXPIRES",
            value: prizeWin.expiresAt.toISOString().split("T")[0],
          },
        ],
        primaryFields: [
          {
            key: "prize",
            label: "PRIZE",
            value: prizeWin.prize.name,
          },
        ],
        secondaryFields: [
          {
            key: "merchant",
            label: "MERCHANT",
            value: prizeWin.campaign.merchant.name,
          },
        ],
        auxiliaryFields: [
          {
            key: "customer",
            label: "CUSTOMER",
            value: prizeWin.customer.firstName + " " + prizeWin.customer.lastName,
          },
        ],
        backFields: [
          {
            key: "redemption",
            label: "REDEMPTION CODE",
            value: prizeWin.redemptionCode,
          },
          {
            key: "instructions",
            label: "HOW TO REDEEM",
            value: `Show this code at ${prizeWin.campaign.merchant.name} to redeem your prize.`,
          },
        ],
      },
      expirationDate: prizeWin.expiresAt.toISOString(),
      relevantDate: prizeWin.wonAt.toISOString(),
    };

    // In production, this would generate and return a .pkpass file
    res.json({
      message: "Apple Wallet integration requires Apple Developer certificates",
      passData,
      todo: "Implement PKPass generation with passkit-generator library",
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /wallet/google/:prizeWinId
 * Generate Google Wallet pass link
 *
 * NOTE: Requires Google Cloud service account and wallet API setup
 * This is a placeholder implementation
 */
router.get("/google/:prizeWinId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prizeWinId } = req.params;

    const prizeWin = await prisma.prizeWin.findUnique({
      where: { id: prizeWinId },
      include: {
        prize: true,
        customer: true,
        loyaltyCard: true,
        campaign: {
          include: {
            merchant: true,
          },
        },
      },
    });

    if (!prizeWin) {
      throw new ApiError(404, "Prize not found");
    }

    // TODO: Generate JWT and create Google Wallet save link
    // Requires:
    // - Google Cloud service account with Wallet API enabled
    // - Sign JWT with service account credentials
    // - Create loyalty object with barcode (redemptionCode)

    // Sample Google Wallet object structure
    const walletObject = {
      id: `${prizeWin.campaign.merchantId}.${prizeWin.id}`,
      classId: `${prizeWin.campaign.merchantId}.loyalty`,
      state: "ACTIVE",
      barcode: {
        type: "QR_CODE",
        value: prizeWin.redemptionCode,
      },
      accountName: `${prizeWin.customer.firstName} ${prizeWin.customer.lastName}`,
      accountId: prizeWin.customer.id,
      loyaltyPoints: {
        label: "Prize",
        balance: {
          string: prizeWin.prize.name,
        },
      },
      validTimeInterval: {
        start: {
          date: prizeWin.wonAt.toISOString().split("T")[0],
        },
        end: {
          date: prizeWin.expiresAt.toISOString().split("T")[0],
        },
      },
    };

    // In production, this would sign a JWT and return a Google Wallet save URL
    res.json({
      message: "Google Wallet integration requires Google Cloud service account",
      walletObject,
      todo: "Implement JWT signing and Google Wallet save link generation",
      saveUrl: `https://pay.google.com/gp/v/save/${encodeURIComponent(JSON.stringify(walletObject))}`,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /wallet/preview/:prizeWinId
 * Get prize win details for preview (without generating wallet pass)
 */
router.get("/preview/:prizeWinId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prizeWinId } = req.params;

    const prizeWin = await prisma.prizeWin.findUnique({
      where: { id: prizeWinId },
      include: {
        prize: true,
        customer: true,
        loyaltyCard: true,
        campaign: {
          include: {
            merchant: true,
          },
        },
      },
    });

    if (!prizeWin) {
      throw new ApiError(404, "Prize not found");
    }

    res.json({
      id: prizeWin.id,
      prizeName: prizeWin.prize.name,
      prizeDescription: prizeWin.prize.description,
      prizeType: prizeWin.prize.prizeType,
      merchantName: prizeWin.campaign.merchant.name,
      redemptionCode: prizeWin.redemptionCode,
      status: prizeWin.status,
      wonAt: prizeWin.wonAt,
      expiresAt: prizeWin.expiresAt,
      redeemedAt: prizeWin.redeemedAt,
      loyaltyCard: {
        id: prizeWin.loyaltyCard?.id,
        cardNumber: prizeWin.loyaltyCard?.cardNumber,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
