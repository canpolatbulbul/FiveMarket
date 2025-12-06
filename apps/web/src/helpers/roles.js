// Role definitions with clearance levels
export const Roles = {
  CLIENT: "client",
  FREELANCER: "freelancer",
  ADMIN: "admin",
};

// Clearance levels for role-based access control
export const ClearanceLevels = {
  CLIENT: 1,
  FREELANCER: 2,
  ADMIN: 3,
};

Object.freeze(Roles);
Object.freeze(ClearanceLevels);

/**
 * Get numeric clearance level from role string
 * @param {string} role - User role (client, freelancer, admin)
 * @returns {number} Clearance level (1-3)
 */
export const getClearanceLevel = (role) => {
  const normalizedRole = role?.toUpperCase();
  return ClearanceLevels[normalizedRole] || 0;
};

/**
 * Check if user has required clearance level
 * @param {number} userClearance - User's clearance level
 * @param {number} requiredClearance - Required clearance level
 * @returns {boolean} True if user has sufficient clearance
 */
export const hasClearance = (userClearance, requiredClearance) => {
  return userClearance >= requiredClearance;
};

/**
 * Check if user has a specific role
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required role
 * @returns {boolean} True if roles match
 */
export const hasRole = (userRole, requiredRole) => {
  return userRole?.toLowerCase() === requiredRole?.toLowerCase();
};

/**
 * Check if user is an admin
 * @param {string} userRole - User's role
 * @returns {boolean} True if user is admin
 */
export const isAdmin = (userRole) => {
  return hasRole(userRole, Roles.ADMIN);
};

/**
 * Check if user is a freelancer
 * @param {string} userRole - User's role
 * @returns {boolean} True if user is freelancer
 */
export const isFreelancer = (userRole) => {
  return hasRole(userRole, Roles.FREELANCER);
};

/**
 * Check if user is a client
 * @param {string} userRole - User's role
 * @returns {boolean} True if user is client
 */
export const isClient = (userRole) => {
  return hasRole(userRole, Roles.CLIENT);
};
