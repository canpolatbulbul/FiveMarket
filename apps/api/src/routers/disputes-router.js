import express from "express";
import checkAuth from "../middleware/auth-check.js";
import checkClearance from "../middleware/clearance-check.js";
import { ClearanceLevels } from "../utils/roles.js";
import {
  createDispute,
  getDisputeDetails,
  getUserDisputes,
  getAllDisputes,
  updateDisputeStatus,
} from "../controllers/disputes-controller.js";

const router = express.Router();

// Create a new dispute (Client or Freelancer)
router.post("/", checkAuth, createDispute);

// Get user's disputes
router.get("/user/me", checkAuth, getUserDisputes);

// Get all disputes (Admin only)
router.get(
  "/admin/all",
  checkAuth,
  checkClearance(ClearanceLevels.ADMIN),
  getAllDisputes
);

// Get dispute details
router.get("/:id", checkAuth, getDisputeDetails);

// Update dispute status (Admin only)
router.patch(
  "/:id/status",
  checkAuth,
  checkClearance(ClearanceLevels.ADMIN),
  updateDisputeStatus
);

export default router;
