import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import health from "./routers/health.js";
import { authRouter } from "./routers/auth-router.js";
import servicesRouter from "./routers/services-router.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/health", health);
app.use("/api/auth", authRouter);
app.use("/api/services", servicesRouter);

export default app;
