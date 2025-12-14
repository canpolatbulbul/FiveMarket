import rateLimit from "express-rate-limit";

/**
 * Light rate limiter for login attempts
 * Allows 100 attempts per 15 minutes per IP (increased for development)
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs (increased for dev testing)
  message: {
    error: "Too many login attempts",
    message:
      "Too many login attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
