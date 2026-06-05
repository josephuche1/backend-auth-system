import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/auth/register", (req, res) => {
  res.json({ message: "Register endpoint" });
});

app.get("/", (req, res) => {
  res.json({ message: "Backend API running 🚀" });
});

export default app;