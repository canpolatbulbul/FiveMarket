import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import health from "./routers/health.js";
import { authRouter } from "./routers/auth-router.js";
import servicesRouter from "./routers/services-router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

// Serve uploaded images as static files with explicit CORS
app.use(
  "/uploads",
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join("/app", "uploads")));

app.use("/api/health", health);
app.use("/api/auth", authRouter);
app.use("/api/services", servicesRouter);

export default app;
