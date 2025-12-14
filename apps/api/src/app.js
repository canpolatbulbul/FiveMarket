import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import health from "./routers/health.js";
import { authRouter } from "./routers/auth-router.js";
import servicesRouter from "./routers/services-router.js";
import categoriesRouter from "./routers/categories-router.js";
import ordersRouter from "./routers/orders-router.js";
import messagesRouter from "./routers/messages-router.js";
import disputesRouter from "./routers/disputes-router.js";
import usersRouter from "./routers/users-router.js";

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

// Serve uploaded images as static files with explicit CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader(
      "Access-Control-Allow-Origin",
      process.env.CORS_ORIGIN || "http://localhost:5173"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join("/app", "uploads"))
);

app.use("/api/health", health);
app.use("/api/auth", authRouter);
app.use("/api/services", servicesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/disputes", disputesRouter);
app.use("/api/users", usersRouter);

export default app;
