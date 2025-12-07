import Hashids from "hashids";

// Initialize Hashids with a salt and minimum length
// IMPORTANT: Change the salt in production to a secret value from env
const hashids = new Hashids(
  process.env.HASHID_SALT || "FiveMarket-Secret-Salt-Change-In-Production",
  10 // Minimum length of 10 characters
);

/**
 * Encode a numeric userID to a hashid string
 * @param {number} userID - The numeric user ID from database
 * @returns {string} - The encoded hashid (e.g., "jR3kV9mO4z")
 */
export function encodeUserID(userID) {
  if (!userID) return null;
  return hashids.encode(userID);
}

/**
 * Decode a hashid string back to numeric userID
 * @param {string} hashid - The encoded hashid
 * @returns {number|null} - The decoded numeric user ID, or null if invalid
 */
export function decodeUserID(hashid) {
  if (!hashid) return null;
  const decoded = hashids.decode(hashid);
  return decoded.length > 0 ? decoded[0] : null;
}

/**
 * Encode multiple userIDs at once
 * @param {number[]} userIDs - Array of numeric user IDs
 * @returns {string[]} - Array of encoded hashids
 */
export function encodeUserIDs(userIDs) {
  if (!Array.isArray(userIDs)) return [];
  return userIDs.map(encodeUserID);
}

/**
 * Decode multiple hashids at once
 * @param {string[]} hashids - Array of encoded hashids
 * @returns {number[]} - Array of decoded numeric user IDs
 */
export function decodeUserIDs(hashids) {
  if (!Array.isArray(hashids)) return [];
  return hashids.map(decodeUserID).filter((id) => id !== null);
}
