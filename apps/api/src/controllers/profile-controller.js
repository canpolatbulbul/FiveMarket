import { query } from "../db/index.js";
import bcryptjs from "bcryptjs";
import { AppError } from "../middleware/error-handler.js";

/**
 * Get current user's profile
 */
export const getProfile = async (req, res) => {
  try {
    const { decodeUserID } = await import("../utils/hashids.js");
    const user_id = decodeUserID(req.user.userID);

    // Get user info
    const userResult = await query(
      `SELECT 
        u."userID",
        u.first_name,
        u.last_name,
        u.email,
        u.created_at,
        EXISTS(SELECT 1 FROM client WHERE "userID" = u."userID") as is_client,
        EXISTS(SELECT 1 FROM freelancer WHERE "userID" = u."userID") as is_freelancer,
        EXISTS(SELECT 1 FROM administrator WHERE "userID" = u."userID") as is_admin
      FROM "user" u
      WHERE u."userID" = $1`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      throw new AppError("User not found", 404);
    }

    const user = userResult.rows[0];

    // Get freelancer stats if applicable
    let freelancerStats = null;
    if (user.is_freelancer) {
      const statsResult = await query(
        `SELECT 
          f.total_earned,
          COUNT(DISTINCT o.order_id) as completed_orders,
          COALESCE(AVG(r.rating), 0) as avg_rating,
          COUNT(DISTINCT r.review_id) as review_count
        FROM freelancer f
        LEFT JOIN service s ON s.freelancer_id = f."userID"
        LEFT JOIN package p ON p.service_id = s.service_id
        LEFT JOIN "order" o ON o.package_id = p.package_id AND o.status = 'completed'
        LEFT JOIN review r ON r.order_id = o.order_id
        WHERE f."userID" = $1
        GROUP BY f."userID", f.total_earned`,
        [user_id]
      );

      if (statsResult.rows.length > 0) {
        const stats = statsResult.rows[0];
        freelancerStats = {
          totalEarned: parseFloat(stats.total_earned) || 0,
          completedOrders: parseInt(stats.completed_orders) || 0,
          avgRating: parseFloat(stats.avg_rating).toFixed(1),
          reviewCount: parseInt(stats.review_count) || 0,
        };
      }
    }

    // Build roles array
    const roles = [];
    if (user.is_client) roles.push("client");
    if (user.is_freelancer) roles.push("freelancer");
    if (user.is_admin) roles.push("admin");

    res.json({
      success: true,
      profile: {
        userID: user.userID,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        memberSince: user.created_at,
        roles,
        freelancerStats,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { decodeUserID } = await import("../utils/hashids.js");
    const user_id = decodeUserID(req.user.userID);
    const { firstName, lastName, email } = req.body;

    // Validation
    if (
      !firstName ||
      firstName.trim().length < 2 ||
      firstName.trim().length > 50
    ) {
      throw new AppError("First name must be between 2 and 50 characters", 400);
    }

    if (
      !lastName ||
      lastName.trim().length < 2 ||
      lastName.trim().length > 50
    ) {
      throw new AppError("Last name must be between 2 and 50 characters", 400);
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError("Please provide a valid email address", 400);
    }

    // Check if email is already taken by another user
    const emailCheck = await query(
      `SELECT "userID" FROM "user" WHERE email = $1 AND "userID" != $2`,
      [email.toLowerCase(), user_id]
    );

    if (emailCheck.rows.length > 0) {
      throw new AppError("Email is already in use by another account", 400);
    }

    // Update user
    const result = await query(
      `UPDATE "user" 
       SET first_name = $1, last_name = $2, email = $3, updated_at = NOW()
       WHERE "userID" = $4
       RETURNING first_name, last_name, email`,
      [firstName.trim(), lastName.trim(), email.toLowerCase(), user_id]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        email: result.rows[0].email,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

/**
 * Change password
 */
export const changePassword = async (req, res) => {
  try {
    const { decodeUserID } = await import("../utils/hashids.js");
    const user_id = decodeUserID(req.user.userID);
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword) {
      throw new AppError("Current password is required", 400);
    }

    if (!newPassword) {
      throw new AppError("New password is required", 400);
    }

    // Validate new password strength (same as registration)
    if (newPassword.length < 8) {
      throw new AppError("Password must be at least 8 characters long", 400);
    }

    if (!/[a-z]/.test(newPassword)) {
      throw new AppError(
        "Password must contain at least one lowercase letter",
        400
      );
    }

    if (!/[A-Z]/.test(newPassword)) {
      throw new AppError(
        "Password must contain at least one uppercase letter",
        400
      );
    }

    if (!/\d/.test(newPassword)) {
      throw new AppError("Password must contain at least one number", 400);
    }

    if (!/[^a-zA-Z0-9]/.test(newPassword)) {
      throw new AppError(
        "Password must contain at least one special character",
        400
      );
    }

    // Get current password hash
    const userResult = await query(
      `SELECT password FROM "user" WHERE "userID" = $1`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      throw new AppError("User not found", 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcryptjs.compare(
      currentPassword,
      userResult.rows[0].password
    );

    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    // Check if new password is same as current
    const isSamePassword = await bcryptjs.compare(
      newPassword,
      userResult.rows[0].password
    );

    if (isSamePassword) {
      throw new AppError(
        "New password must be different from current password",
        400
      );
    }

    // Hash new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // Update password
    await query(
      `UPDATE "user" SET password = $1, updated_at = NOW() WHERE "userID" = $2`,
      [hashedPassword, user_id]
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};
