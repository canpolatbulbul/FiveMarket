import { validationResult } from "express-validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "node:crypto";
import { tx } from "../db/tx.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

/**
 * Register a new user
 * Creates user account and automatically creates a client entry
 * Users can upgrade to freelancer later via "Become a Freelancer" feature
 */
export const register = async (req, res) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      errors: validationErrors.array(),
    });
  }

  const { first_name, last_name, email, password } = req.body;

  try {
    // Use transaction to ensure atomicity
    const result = await tx(async (client) => {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT "userID" FROM "User" WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error("USER_EXISTS");
      }

      // Hash password
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      // Insert user
      const userResult = await client.query(
        `INSERT INTO "User" (first_name, last_name, email, password)
         VALUES ($1, $2, $3, $4)
         RETURNING "userID", first_name, last_name, email`,
        [first_name, last_name, email, hashedPassword]
      );

      const user = userResult.rows[0];

      // Automatically create client entry (all users start as clients)
      await client.query(
        `INSERT INTO "Client" ("userID")
         VALUES ($1)`,
        [user.userID]
      );

      return user;
    });

    // Generate JWT token
    const token = jwt.sign({ userID: result.userID }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Return user data with token
    res.status(201).json({
      message: "User registered successfully",
      user: {
        userID: result.userID,
        first_name: result.first_name,
        last_name: result.last_name,
        email: result.email,
        roles: ["client"], // All new users start as clients
        clearance: 1, // CLIENT clearance level
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.message === "USER_EXISTS") {
      return res.status(409).json({
        error: "User already exists",
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      error: "Registration failed",
      message: "An error occurred during registration",
    });
  }
};
