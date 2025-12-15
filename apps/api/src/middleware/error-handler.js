/**
 * Error handling middleware
 * Sanitizes errors before sending to client
 */

// List of error messages that are safe to show to users
const SAFE_ERROR_PATTERNS = [
  /already exists/i,
  /not found/i,
  /invalid/i,
  /required/i,
  /must be/i,
  /cannot/i,
  /unauthorized/i,
  /forbidden/i,
  /expired/i,
  /too short/i,
  /too long/i,
  /minimum/i,
  /maximum/i,
];

// Check if error message is safe to show
const isSafeErrorMessage = (message) => {
  if (!message) return false;
  return SAFE_ERROR_PATTERNS.some((pattern) => pattern.test(message));
};

// Sanitize error for client
const sanitizeError = (error) => {
  // If it's a validation error or business logic error, keep the message
  if (error.message && isSafeErrorMessage(error.message)) {
    return error.message;
  }

  // For SQL errors, database errors, or system errors, use generic message
  if (error.code || error.routine || error.constraint) {
    // SQL/Database error
    console.error("Database error:", error);
    return "A database error occurred. Please try again later.";
  }

  // For other errors, use generic message
  return "An unexpected error occurred. Please try again.";
};

/**
 * Global error handler middleware
 * Should be added as the last middleware in app.js
 */
export const errorHandler = (err, req, res, next) => {
  // Log the full error for debugging
  console.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    code: err.code,
    url: req.url,
    method: req.method,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Sanitize error message
  const clientMessage = sanitizeError(err);

  // Send sanitized response
  res.status(statusCode).json({
    error: clientMessage,
    message: clientMessage,
  });
};

/**
 * Async handler wrapper
 * Catches async errors and passes to error handler
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class for business logic errors
 * Use this for errors that should be shown to users
 */
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
