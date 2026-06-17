import { Request, Response, NextFunction } from "express";
import { ApiError } from "./errorHandler";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateUuid(...paramNames: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const name of paramNames) {
      const value = req.params[name];
      if (value && !UUID_RE.test(value)) {
        return next(new ApiError(400, `Invalid ${name} format — expected a UUID`));
      }
    }
    next();
  };
}
