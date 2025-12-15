import express from "express";
import checkAuth from "../middleware/auth-check.js";
import {
  getDashboardStats,
  getEarningsHistory,
  requestWithdrawal,
  getWithdrawals,
  toggleServiceStatus,
} from "../controllers/freelancer-controller.js";

const router = express.Router();

// All routes require authentication
router.use(checkAuth);

// Dashboard stats
router.get("/dashboard", getDashboardStats);

// Earnings history
router.get("/earnings", getEarningsHistory);

// Withdrawals
router.post("/withdrawals", requestWithdrawal);
router.get("/withdrawals", getWithdrawals);

// Toggle service status
router.patch("/services/:id/toggle-status", toggleServiceStatus);

export default router;
