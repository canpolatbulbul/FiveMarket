import jwt from "jsonwebtoken";
import { query } from "../db/index.js";
import { encodeUserID } from "../utils/hashids.js";

/**
 * Optional authentication middleware
 * Attaches user data to request if valid token is provided
 * Does NOT fail if no token is present - just continues without user data
 * Useful for routes that should work for both authenticated and unauthenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    // If no token, just continue without user data
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      // If token is invalid, just continue without user data
      return next();
    }

    // Extract userID from token
    const { userID } = decodedToken;

    if (!userID) {
      return next();
    }

    // Fetch user from database with roles
    const userQuery = `
      SELECT 
        u."userID",
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
      FROM "user" u
      WHERE u."userID" = $1
    `;

    const result = await query(userQuery, [userID]);

    if (result.rows.length === 0) {
      return next();
    }

    const user = result.rows[0];

    // Calculate clearance level based on roles
    const clearanceLevels = {
      client: 1,
      freelancer: 2,
      admin: 3,
    };

    const userClearance = Math.max(
      ...user.roles.map((role) => clearanceLevels[role] || 0)
    );

    // Attach user data to request object (encode userID for external use)
    req.user = {
      userID: encodeUserID(user.userID),
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      roles: user.roles,
      clearance: userClearance,
    };

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    // On error, just continue without user data
    next();
  }
};

export default optionalAuth;
