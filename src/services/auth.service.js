const { User, Wallet, sequelize } = require('../models');
const ApiError = require('../utils/apiError');
const { signToken } = require('../utils/jwt.util');

const register = async ({ name, email, password, defaultCurrency }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  
  const { user, wallet } = await sequelize.transaction(async (t) => {
    const createdUser = await User.create(
      {
        name,
        email,
        password,
        defaultCurrency: defaultCurrency || process.env.DEFAULT_CURRENCY || 'USD',
      },
      { transaction: t }
    );

    const createdWallet = await Wallet.create(
      {
        userId: createdUser.id,
        currency: createdUser.defaultCurrency,
        balance: 0,
      },
      { transaction: t }
    );

    return { user: createdUser, wallet: createdWallet };
  });

  const token = signToken({ id: user.id });

  return { user, wallet, token };
};

const login = async ({ email, password }) => {
  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Incorrect email or password.');
  }

  if (user.isFrozen) {
    throw new ApiError(403, 'Your account is frozen. Please contact support.');
  }

  const token = signToken({ id: user.id });
  return { user, token };
};

module.exports = { register, login };
