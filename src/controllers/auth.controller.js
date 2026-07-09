const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

const register = catchAsync(async (req, res) => {
  const { name, email, password, defaultCurrency } = req.body;
  const { user, wallet, token } = await authService.register({
    name,
    email,
    password,
    defaultCurrency,
  });

  new ApiResponse(
    201,
    {
      token,
      user: { id: user.id, name: user.name, email: user.email },
      wallet: { id: wallet.id, balance: wallet.balance, currency: wallet.currency },
    },
    'User registered successfully'
  ).send(res);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });

  new ApiResponse(
    200,
    { token, user: { id: user.id, name: user.name, email: user.email } },
    'Login successful'
  ).send(res);
});

const getMe = catchAsync(async (req, res) => {
  new ApiResponse(
    200,
    {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      defaultCurrency: req.user.defaultCurrency,
      createdAt: req.user.createdAt,
    },
    'Authenticated user details'
  ).send(res);
});

module.exports = { register, login, getMe };
