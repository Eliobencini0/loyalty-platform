import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { ApiError } from "./errorHandler";
import { isLegacyApiKey, verifyApiKey, isValidApiKeyFormat } from "../utils/apiKey";

/**
 * Legacy UUID-as-API-key authentication.
 *
 * SECURITY: this path is DISABLED by default. It used to look up a merchant
 * by `merchant.id` when the X-API-Key header was a UUID — but `merchant.id`
 * is publicly embedded in customer-facing QR URLs (`/app/join/:merchantId`,
 * `/app/play/:merchantId`, `/app/review/:merchantId`), so anyone scanning a
 * customer QR could extract a valid API key. All merchants must now sign in
 * to receive a hashed `loy_{live|test}_*` key issued by `/api/auth/login`.
 *
 * Set ALLOW_LEGACY_API_KEYS=true only as a temporary escape hatch during a
 * migration window — and rotate keys immediately after.
 */
const ALLOW_LEGACY_API_KEYS = process.env.ALLOW_LEGACY_API_KEYS === "true";

declare global {
  namespace Express {
    interface Request {
      merchantId?: string;
    }
  }
}

/**
 * Authenticates merchants via API key passed in the X-API-Key header.
 * Supports both:
 * - New hashed API keys (loy_live_xxx or loy_test_xxx)
 * - Legacy UUID-based keys (for backward compatibility during migration)
 */
export async function authenticateMerchant(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const apiKey = req.header("X-API-Key");
    if (!apiKey) {
      throw new ApiError(401, "Missing X-API-Key header");
    }

    if (!isValidApiKeyFormat(apiKey)) {
      throw new ApiError(401, "Invalid API key format");
    }

    let merchantId: string | null = null;

    // Handle legacy UUID-based API keys — DISABLED by default for security.
    // See ALLOW_LEGACY_API_KEYS comment at top of file.
    if (isLegacyApiKey(apiKey)) {
      if (!ALLOW_LEGACY_API_KEYS) {
        throw new ApiError(
          401,
          "Legacy UUID API keys are no longer accepted — please sign in again to obtain a new key"
        );
      }

      console.warn(`[DEPRECATED] Legacy UUID API key used: ${apiKey.substring(0, 8)}...`);

      const merchant = await prisma.merchant.findUnique({
        where: { id: apiKey },
        select: { id: true, active: true }
      });

      if (merchant && merchant.active) {
        merchantId = merchant.id;
      }
    }
    // Handle new hashed API keys
    else {
      const apiKeyRecords = await prisma.apiKey.findMany({
        where: {
          active: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        include: {
          merchant: {
            select: { id: true, active: true }
          }
        }
      });

      // Verify the API key against all active hashes
      for (const record of apiKeyRecords) {
        const isValid = await verifyApiKey(apiKey, record.keyHash);
        if (isValid && record.merchant.active) {
          merchantId = record.merchantId;

          // Update last used timestamp (fire and forget)
          prisma.apiKey.update({
            where: { id: record.id },
            data: { lastUsedAt: new Date() }
          }).catch(err => console.error('Failed to update API key lastUsedAt:', err));

          break;
        }
      }
    }

    if (!merchantId) {
      throw new ApiError(401, "Invalid or inactive API key");
    }

    req.merchantId = merchantId;
    next();
  } catch (err) {
    next(err);
  }
}
