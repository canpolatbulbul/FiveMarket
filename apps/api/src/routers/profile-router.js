import express from "express";
import checkAuth from "../middleware/auth-check.js";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/profile-controller.js";

const router = express.Router();

// All routes require authentication
router.use(checkAuth);

// Get current user's profile
router.get("/", getProfile);

// Update profile
router.patch("/", updateProfile);

// Change password
router.patch("/password", changePassword);

export default router;
