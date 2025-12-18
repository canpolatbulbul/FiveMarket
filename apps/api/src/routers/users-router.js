import express from "express";
import {
  getAllUsers,
  promoteToAdmin,
  getUserCertifications,
} from "../controllers/users-controller.js";
import checkAuth from "../middleware/auth-check.js";
import checkClearance from "../middleware/clearance-check.js";
import { ClearanceLevels } from "../utils/roles.js";

const router = express.Router();

/**
 * @route   GET /api/users/admin/all
 * @desc    Get all users (Admin only)
 * @access  Private (Admin only)
 */
router.get(
  "/admin/all",
  checkAuth,
  checkClearance(ClearanceLevels.ADMIN),
  getAllUsers
);

/**
 * @route   POST /api/users/admin/promote/:id
 * @desc    Promote user to admin (Admin only)
 * @access  Private (Admin only)
 */
router.post(
  "/admin/promote/:id",
  checkAuth,
  checkClearance(ClearanceLevels.ADMIN),
  promoteToAdmin
);

/**
 * @route   GET /api/users/:id/certifications
 * @desc    Get user's skill certifications
 * @access  Public
 */
router.get("/:id/certifications", getUserCertifications);

export default router;
