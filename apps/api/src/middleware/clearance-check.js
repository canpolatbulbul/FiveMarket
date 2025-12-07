import jwt from "jsonwebtoken";
import { query } from "../db/index.js";

/**
 * Middleware to check user authentication and clearance level
 * @param {number} requiredClearance - Minimum clearance level required (1=CLIENT, 2=FREELANCER, 3=ADMIN)
 * @returns {Function} Express middleware function
 */
const checkClearance = (requiredClearance) => {
  return async (req, res, next) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "Authentication required",
          message: "No token provided",
        });
      }

      const token = authHeader.split(" ")[1];

      // Verify JWT token
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      } catch (jwtError) {
        if (jwtError.name === "TokenExpiredError") {
          return res.status(401).json({
            error: "Token expired",
            message: "Please log in again",
          });
        }
        if (jwtError.name === "JsonWebTokenError") {
          return res.status(401).json({
            error: "Invalid token",
            message: "Authentication failed",
          });
        }
        throw jwtError;
      }

      // Extract userID from token
      const { userID } = decodedToken;

      if (!userID) {
        return res.status(401).json({
          error: "Invalid token",
          message: "User ID not found in token",
        });
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
        return res.status(401).json({
          error: "Authentication failed",
          message: "User not found",
        });
      }

      const user = result.rows[0];

      // Calculate clearance level based on roles
      // CLIENT = 1, FREELANCER = 2, ADMIN = 3
      const clearanceLevels = {
        client: 1,
        freelancer: 2,
        admin: 3,
      };

      const userClearance = Math.max(
        ...user.roles.map((role) => clearanceLevels[role] || 0)
      );

      // Check if user has sufficient clearance
      if (userClearance < requiredClearance) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Insufficient permissions to access this resource",
        });
      }

      // Attach user data to request object
      req.user = {
        userID: user.userID,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        roles: user.roles,
        clearance: userClearance,
      };

      next();
    } catch (error) {
      console.error("Clearance middleware error:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: "An error occurred during authentication",
      });
    }
  };
};

export default checkClearance;
