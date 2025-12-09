import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "node:crypto";
import { tx } from "../db/tx.js";
import { query } from "../db/index.js";
import { encodeUserID } from "../utils/hashids.js";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/refresh-token.js";
import { sendPasswordResetEmail } from "../utils/email.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1hr";

/**
 * Register a new user
 * Creates user account and automatically creates a client entry
 * Users can upgrade to freelancer later via "Become a Freelancer" feature
 */
export const register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    // Use transaction to ensure atomicity
    const result = await tx(async (client) => {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT "userID" FROM "user" WHERE email = $1',
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
        `INSERT INTO "user" (first_name, last_name, email, password)
         VALUES ($1, $2, $3, $4)
         RETURNING "userID", first_name, last_name, email`,
        [first_name, last_name, email, hashedPassword]
      );

      const user = userResult.rows[0];

      // Automatically create client entry (all users start as clients)
      await client.query(
        `INSERT INTO client ("userID")
         VALUES ($1)`,
        [user.userID]
      );

      return user;
    });

    // Generate JWT token (store numeric ID internally)
    const token = jwt.sign({ userID: result.userID }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Return user data with token (encode userID for external use)
    res.status(201).json({
      message: "User registered successfully",
      user: {
        userID: encodeUserID(result.userID), // Encoded hashid
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

/**
 * Get current authenticated user
 * Returns user data from req.user (populated by auth middleware)
 */
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is populated by the auth middleware
    if (!req.user) {
      return res.status(401).json({
        error: "Not authenticated",
        message: "User not found in request",
      });
    }

    // Return user data (userID is already encoded by middleware)
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      error: "Failed to get user",
      message: "An error occurred while fetching user data",
    });
  }
};

/**
 * Login user
 * Validates credentials and returns JWT token (and optionally refresh token)
 */
export const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    // Find user by email and get their roles
    const userQuery = `
      SELECT 
        u."userID",
        u.first_name,
        u.last_name,
        u.email,
        u.password,
        CASE 
          WHEN EXISTS (SELECT 1 FROM client WHERE "userID" = u."userID") 
            AND EXISTS (SELECT 1 FROM freelancer WHERE "userID" = u."userID")
          THEN ARRAY['client', 'freelancer']
          WHEN EXISTS (SELECT 1 FROM freelancer WHERE "userID" = u."userID")
          THEN ARRAY['freelancer', 'client']
          ELSE ARRAY['client']
        END as roles
      FROM "user" u
      WHERE u.email = $1
    `;

    const result = await query(userQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "User with this email does not exist",
      });
    }

    const user = result.rows[0];

    // Compare password with hashed password
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Password is incorrect",
      });
    }

    // Calculate clearance level based on roles
    const clearanceLevels = { client: 1, freelancer: 2, admin: 3 };
    const userClearance = Math.max(
      ...user.roles.map((role) => clearanceLevels[role] || 0)
    );

    // Generate JWT access token (1 hour, store numeric ID internally)
    const token = jwt.sign({ userID: user.userID }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const response = {
      message: "Login successful",
      user: {
        userID: encodeUserID(user.userID), // Encoded hashid
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        roles: user.roles,
        clearance: userClearance,
      },
      token,
    };

    // If rememberMe is true, generate and store refresh token
    if (rememberMe) {
      const refreshToken = generateRefreshToken();
      const hashedToken = hashRefreshToken(refreshToken);

      // Refresh token expires in 30 days
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Get user agent and IP for security tracking
      const userAgent = req.headers["user-agent"] || null;
      const ipAddress = req.ip || req.connection.remoteAddress || null;

      // Store hashed refresh token in database
      await query(
        `INSERT INTO refresh_token ("userID", token, expires_at, user_agent, ip_address) 
         VALUES ($1, $2, $3, $4, $5)`,
        [user.userID, hashedToken, expiresAt, userAgent, ipAddress]
      );

      // Return refresh token to client (plain, not hashed)
      response.refreshToken = refreshToken;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Login failed",
      message: "An error occurred during login",
    });
  }
};

/**
 * Forgot Password - Send reset email
 * Generates a reset token and sends email with reset link
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const userResult = await query(
      'SELECT "userID", first_name, email FROM "user" WHERE email = $1',
      [email]
    );

    // Always return success to prevent email enumeration
    if (userResult.rows.length === 0) {
      return res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const user = userResult.rows[0];

    // Generate reset token (cryptographically secure random string)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Delete any existing tokens for this user
    await query('DELETE FROM password_reset_token WHERE "userID" = $1', [
      user.userID,
    ]);

    // Store hashed token in database
    await query(
      'INSERT INTO password_reset_token ("userID", token, expires_at) VALUES ($1, $2, $3)',
      [user.userID, hashedToken, expiresAt]
    );

    // Send email with plain token (not hashed)
    await sendPasswordResetEmail(user.email, resetToken, user.first_name);

    res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      error: "Failed to process request",
      message: "An error occurred while processing your request",
    });
  }
};

/**
 * Reset Password - Update password with valid token
 * Validates token and updates user's password
 */
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid token
    const tokenResult = await query(
      `SELECT "userID", expires_at, used 
       FROM password_reset_token 
       WHERE token = $1`,
      [hashedToken]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid token",
        message: "Password reset token is invalid",
      });
    }

    const resetToken = tokenResult.rows[0];

    // Check if token is expired
    if (new Date() > new Date(resetToken.expires_at)) {
      return res.status(400).json({
        error: "Token expired",
        message: "Password reset token has expired",
      });
    }

    // Check if token was already used
    if (resetToken.used) {
      return res.status(400).json({
        error: "Token already used",
        message: "This password reset token has already been used",
      });
    }

    // Hash new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Update password and mark token as used
    await query("BEGIN");

    try {
      await query('UPDATE "user" SET password = $1 WHERE "userID" = $2', [
        hashedPassword,
        resetToken.userID,
      ]);

      await query(
        "UPDATE password_reset_token SET used = true WHERE token = $1",
        [hashedToken]
      );

      await query("COMMIT");

      res.status(200).json({
        message: "Password reset successful",
      });
    } catch (error) {
      await query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      error: "Failed to reset password",
      message: "An error occurred while resetting your password",
    });
  }
};

/**
 * Refresh access token using refresh token
 * Validates refresh token and issues new access token
 */
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    // Hash the refresh token to compare with stored hash
    const hashedToken = hashRefreshToken(refreshToken);

    // Find valid refresh token with user data
    const tokenResult = await query(
      `SELECT 
        rt."userID",
        rt.expires_at,
        u.first_name,
        u.last_name,
        u.email,
        CASE 
          WHEN EXISTS (SELECT 1 FROM client WHERE "userID" = u."userID") 
            AND EXISTS (SELECT 1 FROM freelancer WHERE "userID" = u."userID")
          THEN ARRAY['client', 'freelancer']
          WHEN EXISTS (SELECT 1 FROM freelancer WHERE "userID" = u."userID")
          THEN ARRAY['freelancer', 'client']
          ELSE ARRAY['client']
        END as roles
       FROM refresh_token rt
       JOIN "user" u ON rt."userID" = u."userID"
       WHERE rt.token = $1`,
      [hashedToken]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid token",
        message: "Refresh token is invalid",
      });
    }

    const tokenData = tokenResult.rows[0];

    // Check if token is expired
    if (new Date() > new Date(tokenData.expires_at)) {
      // Delete expired token
      await query("DELETE FROM refresh_token WHERE token = $1", [hashedToken]);

      return res.status(401).json({
        error: "Token expired",
        message: "Refresh token has expired",
      });
    }

    // Calculate clearance level
    const clearanceLevels = { client: 1, freelancer: 2, admin: 3 };
    const userClearance = Math.max(
      ...tokenData.roles.map((role) => clearanceLevels[role] || 0)
    );

    // Generate new access token
    const newAccessToken = jwt.sign({ userID: tokenData.userID }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Update last_used_at timestamp
    await query(
      "UPDATE refresh_token SET last_used_at = now() WHERE token = $1",
      [hashedToken]
    );

    // Return new access token and user data
    res.status(200).json({
      message: "Token refreshed successfully",
      user: {
        userID: encodeUserID(tokenData.userID),
        first_name: tokenData.first_name,
        last_name: tokenData.last_name,
        email: tokenData.email,
        roles: tokenData.roles,
        clearance: userClearance,
      },
      token: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      error: "Failed to refresh token",
      message: "An error occurred while refreshing your token",
    });
  }
};
