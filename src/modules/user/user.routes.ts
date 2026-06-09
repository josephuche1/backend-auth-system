import express from "express";
import { getMe } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = express.Router();

// protected route
router.get("/me", authMiddleware, getMe);

export default router;