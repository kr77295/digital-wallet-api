const { verifyToken } = require('../utils/jwt.util');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const { User } = require('../models');

const protect = catchAsync(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'You are not logged in. Please log in to get access.');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token. Please log in again.');
  }

  const user = await User.findByPk(decoded.id);
  if (!user) {
    throw new ApiError(401, 'The user belonging to this token no longer exists.');
  }

  if (user.isFrozen) {
    throw new ApiError(
      403,
      'Your account has been frozen due to suspicious activity. Contact support.'
    );
  }

  req.user = user;
  next();
});

module.exports = { protect };
