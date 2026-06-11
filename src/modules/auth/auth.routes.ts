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
 *     summary: Register a new user
 *     description: |
 *       Creates a new user account with the default `user` role.
 *
 *       On success, returns the created user profile along with a new access token and refresh token.
 *       The refresh token is persisted in the database and expires after 7 days.
 *
 *       **Rate limited:** 10 requests per IP per 15 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RegisterRequest"
 *           examples:
 *             default:
 *               summary: New user registration
 *               value:
 *                 username: johndoe
 *                 email: john@example.com
 *                 password: securePass123
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *                   username: johndoe
 *                   email: john@example.com
 *                   role: user
 *                   createdAt: "2026-06-11T06:40:57.897Z"
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Request body failed validation (e.g. short password, invalid email)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ValidationErrorResponse"
 *       409:
 *         description: A user with the given email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               success: false
 *               message: User already exists
 *       429:
 *         description: Too many registration attempts from this IP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RateLimitErrorResponse"
 */
router.post("/register", validate(registerSchema), authRateLimiter, register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Log in with email and password
 *     description: |
 *       Authenticates a user by email and password.
 *
 *       On success, returns the user profile, a new access token (15 min), and a new refresh token (7 days).
 *       Each login creates a new refresh token record in the database.
 *
 *       **Rate limited:** 10 requests per IP per 15 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LoginRequest"
 *           examples:
 *             default:
 *               summary: Standard login
 *               value:
 *                 email: john@example.com
 *                 password: securePass123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       400:
 *         description: Request body failed validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ValidationErrorResponse"
 *       401:
 *         description: Password does not match
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               success: false
 *               message: Invalid credentials
 *       404:
 *         description: No user found with the given email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               success: false
 *               message: User not found.
 *       429:
 *         description: Too many login attempts from this IP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RateLimitErrorResponse"
 */
router.post("/login", validate(loginSchema), authRateLimiter, login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh an access token
 *     description: |
 *       Exchanges a valid refresh token for a new access token.
 *
 *       The refresh token must:
 *       - Be a valid, unexpired JWT signed with the server secret
 *       - Exist in the `RefreshToken` table and not be past its `expiresAt` date
 *
 *       This endpoint does not rotate the refresh token; the same refresh token remains valid until logout or expiry.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RefreshRequest"
 *           examples:
 *             default:
 *               summary: Refresh with stored token
 *               value:
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RefreshResponse"
 *             example:
 *               success: true
 *               data:
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Token is invalid, expired, or not found in the database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               invalid:
 *                 summary: Invalid JWT
 *                 value:
 *                   success: false
 *                   message: Invalid Token
 *               expired:
 *                 summary: Expired refresh token
 *                 value:
 *                   success: false
 *                   message: Token Expired
 *       500:
 *         description: Refresh token not found in database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post("/refresh", refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Log out and revoke a refresh token
 *     description: |
 *       Deletes the given refresh token from the database, invalidating it for future refresh requests.
 *
 *       Access tokens already issued remain valid until they expire (15 minutes). Clients should discard both tokens locally after logout.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LogoutRequest"
 *           examples:
 *             default:
 *               summary: Revoke refresh token
 *               value:
 *                 refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Refresh token revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Logged out successfully
 *       500:
 *         description: Refresh token not found in database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post("/logout", logout);

export default router;
