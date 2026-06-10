import { Request, Response, NextFunction } from "express";
import {verifyToken} from "../utils/jwt";
import { UnauthorizedError } from "../errors/AppError";

const JWT_SECRET = process.env.JWT_SECRET as string;

// extend Request type to include userId
export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError("No token provided")
    }

    // format: "Bearer token"
    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Invalid token format");
    }

    const decoded = verifyToken(token) as { 
      userId: string; 
      role: string;
    };

    req.userId = decoded.userId;
    req.role = decoded.role;

    next();
  } catch (error) {
    throw new UnauthorizedError("Unauthorized");
  }
};