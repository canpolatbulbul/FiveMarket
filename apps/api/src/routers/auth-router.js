import express from "express";
import { check } from "express-validator";
import checkAuth from "../middleware/auth-check.js";
import {
  register,
  getCurrentUser,
  login,
} from "../controllers/auth-controller.js";

export const authRouter = express.Router();

// Get current user (requires authentication)
authRouter.get("/me", checkAuth, getCurrentUser);

// Register route with validation
authRouter.post(
  "/register",
  [
    check("first_name").trim().notEmpty().withMessage("First name is required"),
    check("last_name").trim().notEmpty().withMessage("Last name is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  register
);

// Login route with validation
authRouter.post(
  "/login",
  [
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

// TODO: Implement forgot password route
// authRouter.post("/forgot-password", forgotPassword);
