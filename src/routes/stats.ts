import { Router, Request, Response, NextFunction } from "express";
import * as statsService from "../services/statsService";

const router = Router();

function windowFromReq(req: Request) {
  return statsService.parseWindow({
    period: req.query.period as string | undefined,
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
  });
}

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId!;
    const stats = await statsService.getDashboardStats(merchantId, windowFromReq(req));

    res.set('Cache-Control', 'private, max-age=300');
    res.set('Last-Modified', new Date().toUTCString());

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

router.get("/feedback", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId!;
    const limit = Number(req.query.limit || 6);

    const feedback = await statsService.getRecentFeedback(merchantId, windowFromReq(req), limit);

    res.set('Cache-Control', 'private, max-age=120');

    res.json({ feedback });
  } catch (err) {
    next(err);
  }
});

router.get("/sentiment", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId!;

    const sentiment = await statsService.getSentimentAnalysis(merchantId, windowFromReq(req));

    res.set('Cache-Control', 'private, max-age=300');

    res.json(sentiment);
  } catch (err) {
    next(err);
  }
});

router.get("/notifications", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId!;

    const notifications = await statsService.getNotifications(merchantId);

    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});

export default router;
