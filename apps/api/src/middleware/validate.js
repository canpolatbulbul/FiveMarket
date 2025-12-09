import { validationResult } from "express-validator";

/**
 * Validation middleware for express-validator
 * Automatically handles validation errors and returns 400 with error details
 * 
 * Usage:
 * router.post('/endpoint', [check('field').notEmpty()], validate, controller);
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Please check your input and try again",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  
  next();
};

