import express from "express";
import checkAuth from "../middleware/auth-check.js";
import checkClearance from "../middleware/clearance-check.js";
import { upload, handleUploadError } from "../middleware/upload.js";
import {
  getFeaturedServices,
  getServiceById,
  searchServices,
  createService,
} from "../controllers/services-controller.js";

const router = express.Router();

// Create new service (freelancers only, with image upload)
router.post(
  "/",
  checkAuth,
  checkClearance("freelancer"),
  upload.array("images", 5), // Max 5 images
  handleUploadError,
  createService
);

// Search/browse services with filters and pagination (requires authentication)
router.get("/search", checkAuth, searchServices);

// Get featured/trending services (requires authentication)
router.get("/featured", checkAuth, getFeaturedServices);

// Get service by ID (requires authentication)
router.get("/:id", checkAuth, getServiceById);

export default router;
