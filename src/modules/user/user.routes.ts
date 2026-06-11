import express from "express";
import { getMe, getAllUsers } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = express.Router();

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get the authenticated user's profile
 *     description: |
 *       Returns the profile of the user identified by the access token in the `Authorization` header.
 *
 *       Password hashes and other sensitive fields are never included in the response.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *             example:
 *               id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *               username: johndoe
 *               email: john@example.com
 *               role: user
 *               createdAt: "2026-06-11T06:40:57.897Z"
 *       401:
 *         description: Missing, malformed, or expired access token
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Unauthorized
 *             examples:
 *               noToken:
 *                 summary: No Authorization header
 *                 value:
 *                   success: false
 *                   message: Unauthorized
 *               invalidToken:
 *                 summary: Invalid or expired JWT
 *                 value:
 *                   message: Unauthorized
 *       404:
 *         description: User ID in token does not match any user in the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 */
router.get("/me", authMiddleware, getMe);

/**
 * @openapi
 * /users/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: List all users (admin only)
 *     description: |
 *       Returns every user record in the database.
 *
 *       **Requires the `admin` role.** Users with the default `user` role receive a `403 Forbidden` response.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: "#/components/schemas/User"
 *                       - type: object
 *                         properties:
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           passwordHash:
 *                             type: string
 *                             description: Bcrypt password hash (admin endpoint only)
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               success: false
 *               message: Unauthorized
 *       403:
 *         description: Authenticated user does not have the admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               success: false
 *               message: Forbidden
 */
router.get("/users", authMiddleware, requireRole("admin"), getAllUsers);

export default router;
