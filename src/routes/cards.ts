import { Router, Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../prisma";
import { ApiError } from "../middleware/errorHandler";
import { validateUuid } from "../middleware/validateUuid";

const router = Router();

function generateCardNumber(): string {
  const digits = uuidv4().replace(/-/g, "").slice(0, 16).toUpperCase();
  return `LC-${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}-${digits.slice(12, 16)}`;
}

// POST /cards — Create a loyalty card for a customer (authenticated merchant)
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, cardTemplateId } = req.body;
    const merchantId = req.merchantId!;

    if (!customerId) {
      throw new ApiError(400, "customerId is required");
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

    // Check for duplicate card
    const existing = await prisma.loyaltyCard.findUnique({
      where: { merchantId_customerId: { merchantId, customerId } },
    });
    if (existing) {
      throw new ApiError(409, "Customer already has a card with this merchant");
    }

    // Validate card template belongs to this merchant if provided
    if (cardTemplateId) {
      const template = await prisma.cardTemplate.findUnique({ where: { id: cardTemplateId } });
      if (!template || template.merchantId !== merchantId) {
        throw new ApiError(400, "Invalid card template");
      }
    }

    const card = await prisma.loyaltyCard.create({
      data: {
        cardNumber: generateCardNumber(),
        merchantId,
        customerId,
        cardTemplateId: cardTemplateId || null,
      },
      include: { customer: true, cardTemplate: true },
    });

    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
});

// GET /cards — List cards for the authenticated merchant
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId!;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const where: Record<string, unknown> = { merchantId };
    if (status) {
      where.status = status;
    }

    const [cards, total] = await Promise.all([
      prisma.loyaltyCard.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { customer: true, cardTemplate: true },
      }),
      prisma.loyaltyCard.count({ where }),
    ]);

    res.json({ data: cards, total, page, limit });
  } catch (err) {
    next(err);
  }
});

// GET /cards/:id — Get a specific card
router.get("/:id", validateUuid("id"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await prisma.loyaltyCard.findUnique({
      where: { id: req.params.id },
      include: { customer: true, cardTemplate: true, merchant: true },
    });

    if (!card || card.merchantId !== req.merchantId) {
      throw new ApiError(404, "Card not found");
    }

    res.json(card);
  } catch (err) {
    next(err);
  }
});

// PATCH /cards/:id — Update card status (activate, suspend, cancel)
router.patch("/:id", validateUuid("id"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const validStatuses = ["ACTIVE", "SUSPENDED", "CANCELLED"];

    if (!status || !validStatuses.includes(status)) {
      throw new ApiError(400, `status must be one of: ${validStatuses.join(", ")}`);
    }

    const card = await prisma.loyaltyCard.findUnique({ where: { id: req.params.id } });
    if (!card || card.merchantId !== req.merchantId) {
      throw new ApiError(404, "Card not found");
    }

    const updated = await prisma.loyaltyCard.update({
      where: { id: req.params.id },
      data: { status },
      include: { customer: true, cardTemplate: true },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
