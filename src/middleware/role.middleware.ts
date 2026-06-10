import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError";

export const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.role) {
      throw new UnauthorizedError("Unauthorized");
    }

    if (req.role !== role) {
      throw new ForbiddenError("Forbidden");
    }

    next();
  };
};