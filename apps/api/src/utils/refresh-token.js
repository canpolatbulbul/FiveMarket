import crypto from "node:crypto";

/**
 * Generate a cryptographically secure refresh token
 * @returns {string} Random token (64 characters hex)
 */
export function generateRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a refresh token for storage
 * @param {string} token - Plain refresh token
 * @returns {string} Hashed token
 */
export function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Verify a refresh token against its hash
 * @param {string} token - Plain refresh token
 * @param {string} hash - Stored hash
 * @returns {boolean} True if token matches hash
 */
export function verifyRefreshToken(token, hash) {
  const tokenHash = hashRefreshToken(token);
  return tokenHash === hash;
}
