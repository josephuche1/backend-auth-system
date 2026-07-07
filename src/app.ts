import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import { errorHandler } from "./middleware/error.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { logger } from "./middleware/logger.middleware";

dotenv.config();

const app = express();

// Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
// CSP is disabled because Swagger UI at /docs needs inline scripts/styles
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(cors());
app.use(express.json());
app.use(logger);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(errorHandler);


/**
 * @openapi
 * /:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check
 *     description: Returns a simple message confirming the API is running. No authentication required.
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Backend API running 🚀
 */
app.get("/", (req, res) => {
  res.json({ message: "Backend API running 🚀" });
});

export default app;