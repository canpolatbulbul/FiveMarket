import express from "express";
import { check, body } from "express-validator";
import checkAuth from "../middleware/auth-check.js";
import { loginRateLimiter } from "../middleware/rate-limit.js";
import { validate } from "../middleware/validate.js";
import {
  register,
  getCurrentUser,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
} from "../controllers/auth-controller.js";

export const authRouter = express.Router();

// Get current user (requires authentication)
authRouter.get("/me", checkAuth, getCurrentUser);

// Custom password validator with helpful messages
const validatePassword = (value) => {
  if (!value || value.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
  if (!/[a-z]/.test(value)) {
    throw new Error("Password must contain at least one lowercase letter");
  }
  if (!/[A-Z]/.test(value)) {
    throw new Error("Password must contain at least one uppercase letter");
  }
  if (!/\d/.test(value)) {
    throw new Error("Password must contain at least one number");
  }
  if (!/[^a-zA-Z0-9]/.test(value)) {
    throw new Error("Password must contain at least one special character (!@#$%^&* etc.)");
  }
  return true;
};

// Register route with validation
authRouter.post(
  "/register",
  [
    check("first_name").trim().notEmpty().withMessage("First name is required"),
    check("last_name").trim().notEmpty().withMessage("Last name is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .custom(validatePassword)
      .withMessage("Password does not meet requirements"),
  ],
  validate,
  register
);

// Login route with validation and rate limiting
authRouter.post(
  "/login",
  loginRateLimiter, // Rate limit: 5 attempts per 15 minutes
  [
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

// Refresh token route
authRouter.post(
  "/refresh",
  [check("refreshToken").notEmpty().withMessage("Refresh token is required")],
  validate,
  refreshToken
);

// Forgot password route
authRouter.post(
  "/forgot-password",
  [check("email").isEmail().withMessage("Valid email is required")],
  validate,
  forgotPassword
);

// Reset password route
authRouter.post(
  "/reset-password",
  [
    check("token").notEmpty().withMessage("Reset token is required"),
    body("password")
      .custom(validatePassword)
      .withMessage("Password does not meet requirements"),
  ],
  validate,
  resetPassword
);
