/**
 * Custom error class so services can throw errors with an HTTP
 * status attached, and the error middleware can just read
 * err.statusCode instead of guessing.
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // distinguishes expected errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
