import express from "express";
import checkAuth from "../middleware/auth-check.js";
import { getAllCategories } from "../controllers/categories-controller.js";

const router = express.Router();

// Get all categories (requires authentication)
router.get("/", checkAuth, getAllCategories);

export default router;
