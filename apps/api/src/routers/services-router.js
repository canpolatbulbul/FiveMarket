import express from "express";
import checkAuth from "../middleware/auth-check.js";
import {
  getFeaturedServices,
  getServiceById,
} from "../controllers/services-controller.js";

const router = express.Router();

// Get featured/trending services (requires authentication)
router.get("/featured", checkAuth, getFeaturedServices);

// Get service by ID (requires authentication)
router.get("/:id", checkAuth, getServiceById);

export default router;
