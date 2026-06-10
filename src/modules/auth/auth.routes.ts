import express from "express";
import { register, login, refresh, logout } from "./auth.controller";
import { registerSchema, loginSchema } from "../../validation/auth.validation";
import { validate } from "../../middleware/validate.middleware";

const router = express.Router();

router.post("/register",validate(registerSchema),  register);
router.post("/login",validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;