import { Request, Response } from "express";
import { registerUser, loginUser, refreshAccessToken, logoutUser } from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError, NotFoundError } from "../../errors/AppError";


export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  const result = await registerUser(username, email, password);

  res.json(result);
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await loginUser(email, password);

  res.json(result);

})

export const refresh = asyncHandler(async (req:Request, res: Response) => {
  const { token } = req.body;

  const result = await refreshAccessToken(token);

  res.status(200).json(result);
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const result = await logoutUser(refreshToken);

  res.status(200).json(result);

})