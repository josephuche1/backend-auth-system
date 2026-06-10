import { Request, Response } from "express";
import { registerUser, loginUser, refreshAccessToken, logoutUser } from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError, NotFoundError } from "../../errors/AppError";
import { sendSuccess } from "../../utils/apiResponse";


export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  const result = await registerUser(username, email, password);

  return sendSuccess(res, result);
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await loginUser(email, password);

  return sendSuccess(res, result);

})

export const refresh = asyncHandler(async (req:Request, res: Response) => {
  const { token } = req.body;

  const result = await refreshAccessToken(token);

  return sendSuccess(res, result);
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const result = await logoutUser(refreshToken);

  return sendSuccess(res, result);

})