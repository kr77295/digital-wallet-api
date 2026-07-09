const ApiError = require('../utils/apiError');


const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors && err.errors[0] ? err.errors[0].path : 'field';
    error = new ApiError(409, `${field} already in use`);
  }

  if (err.name === 'SequelizeValidationError') {
    const details = err.errors.map((e) => e.message);
    error = new ApiError(400, 'Validation failed', details);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = new ApiError(400, 'Invalid reference: related record does not exist.');
  }

  if (err.name === 'SequelizeDatabaseError') {
    error = new ApiError(400, 'Database error: invalid data submitted.');
  }

  if (!(error instanceof ApiError)) {
    console.error('UNEXPECTED ERROR:', err);
    error = new ApiError(500, 'Something went wrong on our end.');
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    details: error.details || undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
