import { Request, Response } from "express";
import { registerUser, loginUser, refreshAccessToken } from "./auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const result = await registerUser(username, email, password);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const refresh = async (req:Request, res: Response) => {
  try {
    const { token } = req.body;

    const result = await refreshAccessToken(token);

    res.status(200).json(result);
  }  catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}