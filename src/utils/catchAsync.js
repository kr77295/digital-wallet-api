/**
 * Wraps an async route/controller so we don't have to write
 * try/catch in every single controller. Any rejected promise
 * gets forwarded to the error middleware via next().
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
