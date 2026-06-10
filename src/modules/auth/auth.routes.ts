import express from "express";
import { register, login, refresh, logout } from "./auth.controller";
import { registerSchema, loginSchema } from "../../validation/auth.validation";
import { validate } from "../../middleware/validate.middleware";
import { authRateLimiter } from "../../middleware/rateLimit.middleware";

const router = express.Router();


/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.post("/register",validate(registerSchema), authRateLimiter,  register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 */
router.post("/login",validate(loginSchema),authRateLimiter, login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh access token
 *     responses:
 *       200:
 *         description: Access token refreshed
 */
router.post("/refresh", refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout user
 *     responses:
 *       200:
 *         description: User logged out
 */
router.post("/logout", logout);

export default router;