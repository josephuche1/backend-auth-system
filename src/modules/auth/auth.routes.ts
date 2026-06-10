import express from "express";
import { register, login, refresh, logout } from "./auth.controller";
import { registerSchema, loginSchema } from "../../validation/auth.validation";
import { validate } from "../../middleware/validate.middleware";
import { authRateLimiter } from "../../middleware/rateLimit.middleware";

const router = express.Router();

router.post("/register",validate(registerSchema), authRateLimiter,  register);
router.post("/login",validate(loginSchema),authRateLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;