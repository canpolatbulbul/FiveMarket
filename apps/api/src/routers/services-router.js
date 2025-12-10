import express from "express";
import checkAuth from "../middleware/auth-check.js";
import {
  getFeaturedServices,
  getServiceById,
  searchServices,
} from "../controllers/services-controller.js";

const router = express.Router();

// Search/browse services with filters and pagination (requires authentication)
router.get("/search", checkAuth, searchServices);

// Get featured/trending services (requires authentication)
router.get("/featured", checkAuth, getFeaturedServices);

// Get service by ID (requires authentication)
router.get("/:id", checkAuth, getServiceById);

export default router;
