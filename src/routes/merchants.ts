import { Router, Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { ApiError } from "../middleware/errorHandler";
import { validateUuid } from "../middleware/validateUuid";
import { authenticateMerchant } from "../middleware/auth";
import { generateApiKey, hashApiKey } from "../utils/apiKey";
import { extractPlaceIdFromUrl } from "../utils/googleMaps";

const router = Router();

// POST /merchants — Register a new merchant (public)
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, address, city, country } = req.body;

    if (!name || !email) {
      throw new ApiError(400, "name and email are required");
    }

    const existing = await prisma.merchant.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(409, "A merchant with this email already exists");
    }

    const merchant = await prisma.merchant.create({
      data: { name, email, phone, address, city, country },
    });

    res.status(201).json(merchant);
  } catch (err) {
    next(err);
  }
});

// GET /merchants — List all merchants (public for MVP)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [merchants, total] = await Promise.all([
      prisma.merchant.findMany({
        where: { active: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.merchant.count({ where: { active: true } }),
    ]);

    res.json({ data: merchants, total, page, limit });
  } catch (err) {
    next(err);
  }
});

// GET /merchants/by-email/:email — Lookup merchant by email (for dashboard login)
router.get("/by-email/:email", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { email: req.params.email },
      include: { cardTemplates: true },
    });

    if (!merchant) {
      throw new ApiError(404, "No merchant found with this email");
    }

    res.json(merchant);
  } catch (err) {
    next(err);
  }
});

// GET /merchants/me — Get current authenticated merchant (must come BEFORE /:id)
// SECURITY: Never return passwordHash to clients — even hashed credentials are sensitive.
router.get("/me", authenticateMerchant, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.merchantId! },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        plan: true,
        settings: true,
        preferredLocale: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!merchant) {
      throw new ApiError(404, "Merchant not found");
    }

    res.json(merchant);
  } catch (err) {
    next(err);
  }
});

// GET /merchants/:id — Get merchant by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.params.id },
      include: { cardTemplates: true },
    });

    if (!merchant) {
      throw new ApiError(404, "Merchant not found");
    }

    res.json(merchant);
  } catch (err) {
    next(err);
  }
});

// PATCH /merchants/me — Update current authenticated merchant
router.patch("/me", authenticateMerchant, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowed = ["name", "phone", "address", "city", "country", "settings", "preferredLocale"] as const;
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    }

    // If settings are being updated, re-derive googlePlaceId from googleMapsUrl.
    // Always clear the old placeId first so a stale value can't survive a URL
    // change that fails extraction (otherwise customers would still be sent to
    // the previous Google place).
    if (data.settings && typeof data.settings === 'string') {
      try {
        const settings = JSON.parse(data.settings);
        delete settings.googlePlaceId;

        if (settings.googleMapsUrl && typeof settings.googleMapsUrl === 'string') {
          const extractedPlaceId = await extractPlaceIdFromUrl(settings.googleMapsUrl);
          if (extractedPlaceId) {
            settings.googlePlaceId = extractedPlaceId;
          }
        }
        data.settings = JSON.stringify(settings);
      } catch (parseError) {
        console.error('Failed to parse settings for Place ID extraction:', parseError);
      }
    }

    const merchant = await prisma.merchant.update({
      where: { id: req.merchantId! },
      data,
    });

    // SECURITY: never return passwordHash to clients
    const { passwordHash: _omit, ...safe } = merchant as { passwordHash?: string } & Record<string, unknown>;
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

// PATCH /merchants/:id — Update merchant (authenticated, own merchant only)
router.patch("/:id", validateUuid("id"), authenticateMerchant, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.merchantId !== req.params.id) {
      throw new ApiError(403, "You can only update your own merchant profile");
    }

    const allowed = ["name", "phone", "address", "city", "country", "settings", "preferredLocale"] as const;
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    }

    const merchant = await prisma.merchant.update({
      where: { id: req.params.id },
      data,
    });

    const { passwordHash: _omit2, ...safe } = merchant as { passwordHash?: string } & Record<string, unknown>;
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

// ─── API Key Management ──────────────────────────────────────────

// POST /merchants/me/api-keys — Generate a new API key
router.post("/me/api-keys", authenticateMerchant, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ApiError(400, "API key name is required");
    }

    // Generate new API key
    const plainApiKey = generateApiKey();
    const keyHash = await hashApiKey(plainApiKey);

    // Store hashed key in database
    const apiKey = await prisma.apiKey.create({
      data: {
        merchantId: req.merchantId!,
        keyHash,
        name: name.trim(),
        active: true
      }
    });

    // Return the plain key ONCE (user must save it)
    res.status(201).json({
      id: apiKey.id,
      name: apiKey.name,
      apiKey: plainApiKey, // ⚠️ Only shown once, never stored in plain text
      createdAt: apiKey.createdAt,
      message: "Save this API key securely. It will not be shown again."
    });
  } catch (err) {
    next(err);
  }
});

// GET /merchants/me/api-keys — List all API keys (without exposing the key)
router.get("/me/api-keys", authenticateMerchant, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: { merchantId: req.merchantId! },
      select: {
        id: true,
        name: true,
        active: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true
        // keyHash is never exposed
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: apiKeys });
  } catch (err) {
    next(err);
  }
});

// DELETE /merchants/me/api-keys/:id — Revoke an API key
router.delete("/me/api-keys/:id", validateUuid("id"), authenticateMerchant, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verify the API key belongs to the authenticated merchant
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: req.params.id }
    });

    if (!apiKey) {
      throw new ApiError(404, "API key not found");
    }

    if (apiKey.merchantId !== req.merchantId) {
      throw new ApiError(403, "You can only revoke your own API keys");
    }

    // Soft delete by marking as inactive
    await prisma.apiKey.update({
      where: { id: req.params.id },
      data: { active: false }
    });

    res.json({ message: "API key revoked successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
