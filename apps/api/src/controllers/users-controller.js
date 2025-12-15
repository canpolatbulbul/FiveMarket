import { query } from "../db/index.js";
import { encodeUserID } from "../utils/hashids.js";

/**
 * Get all users (Admin only)
 * @access Private (Admin)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let queryText = `
      SELECT 
        u."userID",
        u.first_name,
        u.last_name,
        u.email,
        u.created_at,
        CASE 
          WHEN EXISTS (SELECT 1 FROM administrator WHERE "userID" = u."userID")
          THEN ARRAY['admin', 'client', 'freelancer']
          WHEN EXISTS (SELECT 1 FROM client WHERE "userID" = u."userID") 
            AND EXISTS (SELECT 1 FROM freelancer WHERE "userID" = u."userID")
          THEN ARRAY['client', 'freelancer']
          WHEN EXISTS (SELECT 1 FROM freelancer WHERE "userID" = u."userID")
          THEN ARRAY['freelancer', 'client']
          WHEN EXISTS (SELECT 1 FROM client WHERE "userID" = u."userID")
          THEN ARRAY['client']
          ELSE ARRAY[]::VARCHAR[]
        END as roles
      FROM "user" u
    `;

    const params = [];

    // Filter by role if specified
    if (role && role !== "all") {
      if (role === "admin") {
        queryText += ` WHERE EXISTS (SELECT 1 FROM administrator WHERE "userID" = u."userID")`;
      } else if (role === "freelancer") {
        queryText += ` WHERE EXISTS (SELECT 1 FROM freelancer WHERE "userID" = u."userID")`;
      } else if (role === "client") {
        queryText += ` WHERE EXISTS (SELECT 1 FROM client WHERE "userID" = u."userID")`;
      }
    }

    queryText += ` ORDER BY u.created_at DESC`;

    const result = await query(queryText, params);

    // Encode userIDs for external use
    const users = result.rows.map((user) => ({
      ...user,
      userID: encodeUserID(user.userID),
    }));

    // Get counts for all roles (regardless of current filter)
    const countsResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN EXISTS (SELECT 1 FROM administrator WHERE "userID" = u."userID") THEN 1 END) as admin_count,
        COUNT(CASE WHEN EXISTS (SELECT 1 FROM freelancer WHERE "userID" = u."userID") THEN 1 END) as freelancer_count,
        COUNT(CASE WHEN EXISTS (SELECT 1 FROM client WHERE "userID" = u."userID") THEN 1 END) as client_count
      FROM "user" u
    `);

    const counts = countsResult.rows[0];

    res.json({
      success: true,
      users,
      counts: {
        all: parseInt(counts.total),
        admin: parseInt(counts.admin_count),
        freelancer: parseInt(counts.freelancer_count),
        client: parseInt(counts.client_count),
      },
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({
      error: "Failed to fetch users",
      message: error.message,
    });
  }
};

/**
 * Promote user to admin (Admin only)
 * Ensures user has all three roles: admin, client, freelancer
 * @access Private (Admin)
 */
export const promoteToAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { decodeUserID } = await import("../utils/hashids.js");
    const numericUserId = decodeUserID(id);

    // Check if user exists
    const userCheck = await query(
      `SELECT "userID", first_name, last_name, email FROM "user" WHERE "userID" = $1`,
      [numericUserId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
        message: "The specified user does not exist",
      });
    }

    const user = userCheck.rows[0];

    // Check if already admin
    const adminCheck = await query(
      `SELECT "userID" FROM administrator WHERE "userID" = $1`,
      [numericUserId]
    );

    if (adminCheck.rows.length > 0) {
      return res.status(400).json({
        error: "Already admin",
        message: "This user is already an administrator",
      });
    }

    // Ensure user has client role
    const clientCheck = await query(
      `SELECT "userID" FROM client WHERE "userID" = $1`,
      [numericUserId]
    );

    if (clientCheck.rows.length === 0) {
      await query(`INSERT INTO client ("userID") VALUES ($1)`, [numericUserId]);
    }

    // Ensure user has freelancer role
    const freelancerCheck = await query(
      `SELECT "userID" FROM freelancer WHERE "userID" = $1`,
      [numericUserId]
    );

    if (freelancerCheck.rows.length === 0) {
      await query(`INSERT INTO freelancer ("userID") VALUES ($1)`, [
        numericUserId,
      ]);
    }

    // Add admin role
    await query(
      `INSERT INTO administrator ("userID", hired_at) VALUES ($1, NOW())`,
      [numericUserId]
    );

    res.json({
      success: true,
      message: `${user.first_name} ${user.last_name} has been promoted to administrator`,
      user: {
        userID: id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        roles: ["admin", "client", "freelancer"],
      },
    });
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    res.status(500).json({
      error: "Failed to promote user",
      message: error.message,
    });
  }
};
