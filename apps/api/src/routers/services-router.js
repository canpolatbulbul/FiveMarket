import express from "express";
import checkAuth from "../middleware/auth-check.js";
import checkClearance from "../middleware/clearance-check.js";
import { upload, handleUploadError } from "../middleware/upload.js";
import {
  getFeaturedServices,
  getServiceById,
  searchServices,
  createService,
  getMyServices,
  updateService,
  deleteService,
  deletePortfolioImage,
  addPortfolioImages,
} from "../controllers/services-controller.js";

const router = express.Router();

// Get my services (freelancers only)
router.get(
  "/my-services",
  checkAuth,
  checkClearance("freelancer"),
  getMyServices
);

// Create new service (freelancers only, with image upload)
router.post(
  "/",
  checkAuth,
  checkClearance("freelancer"),
  upload.array("images", 5), // Max 5 images
  handleUploadError,
  createService
);

// Update service (freelancers only, PATCH for partial updates)
router.patch("/:id", checkAuth, checkClearance("freelancer"), updateService);

// Delete service (freelancers only)
router.delete("/:id", checkAuth, checkClearance("freelancer"), deleteService);

// Add portfolio images to service (freelancers only)
router.post(
  "/:id/images",
  checkAuth,
  checkClearance("freelancer"),
  upload.array("images", 5),
  handleUploadError,
  addPortfolioImages
);

// Delete portfolio image (freelancers only)
router.delete(
  "/:id/images/:imageId",
  checkAuth,
  checkClearance("freelancer"),
  deletePortfolioImage
);

// Search/browse services with filters and pagination (requires authentication)
router.get("/search", checkAuth, searchServices);

// Get featured/trending services (requires authentication)
router.get("/featured", checkAuth, getFeaturedServices);

// Get service by ID (requires authentication)
router.get("/:id", checkAuth, getServiceById);

export default router;
