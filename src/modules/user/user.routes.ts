import express from "express";
import { getMe, getAllUsers } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = express.Router();

// protected route
router.get("/me", authMiddleware, getMe);
router.get("/users", authMiddleware, requireRole("admin"), getAllUsers);

export default router;