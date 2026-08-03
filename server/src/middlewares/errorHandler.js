const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return errorResponse(res, err.message, err.statusCode);
  }

  console.error('Unexpected error:', err);
  return errorResponse(res, 'Terjadi kesalahan server internal.', 500);
};

module.exports = errorHandler;
