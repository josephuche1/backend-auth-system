import { Response, Request } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
})

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();

  return sendSuccess(res, users);
})