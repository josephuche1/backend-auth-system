import express from "express";
import { getMe, getAllUsers } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = express.Router();

/**
 * @openapi
 * /user/me:
 *   get:
 *     tags:
 *       - User
 *     summary: Get current user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user's profile
 */
router.get("/me", authMiddleware, getMe);

/**
 * @openapi
 * /user/users:
 *   get:
 *     tags:
 *       - User
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get("/users", authMiddleware, requireRole("admin"), getAllUsers);

export default router;