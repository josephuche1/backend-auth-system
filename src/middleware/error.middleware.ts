import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { sendError } from "../utils/apiResponse";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  return sendError(res, "Intrnal Server Error");
};