import express from "express";
import {
  getDashboardStats,
  getAllWithdrawals,
  processWithdrawal,
} from "../controllers/admin-controller.js";
import checkAuth from "../middleware/auth-check.js";
import checkClearance from "../middleware/clearance-check.js";
import { ClearanceLevels } from "../utils/roles.js";

const router = express.Router();

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin only)
 */
router.get(
  "/dashboard/stats",
  checkAuth,
  checkClearance(ClearanceLevels.ADMIN),
  getDashboardStats
);

/**
 * @route   GET /api/admin/withdrawals
 * @desc    Get all withdrawal requests
 * @access  Private (Admin only)
 */
router.get(
  "/withdrawals",
  checkAuth,
  checkClearance(ClearanceLevels.ADMIN),
  getAllWithdrawals
);

/**
 * @route   PATCH /api/admin/withdrawals/:id
 * @desc    Process withdrawal request (approve/reject)
 * @access  Private (Admin only)
 */
router.patch(
  "/withdrawals/:id",
  checkAuth,
  checkClearance(ClearanceLevels.ADMIN),
  processWithdrawal
);

export default router;
