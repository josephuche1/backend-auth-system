import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);


app.use(errorHandler);

app.get("/", (req, res) => {
  res.json({ message: "Backend API running 🚀" });
});

export default app;