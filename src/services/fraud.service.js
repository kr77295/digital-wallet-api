const { Op } = require('sequelize');
const { Transaction, User } = require('../models');
const ApiError = require('../utils/apiError');

const DAILY_LIMIT_USD = Number(process.env.DAILY_TXN_LIMIT_USD) || 10000;
const SUSPICIOUS_AMOUNT_USD = Number(process.env.SUSPICIOUS_AMOUNT_THRESHOLD_USD) || 1000;
const SUSPICIOUS_COUNT = Number(process.env.SUSPICIOUS_TXN_COUNT) || 3;
const SUSPICIOUS_WINDOW_MINUTES = Number(process.env.SUSPICIOUS_WINDOW_MINUTES) || 10;

const OUTGOING_TYPES = ['debit', 'transfer_out', 'withdrawal'];


const enforceDailyLimit = async (userId, amountInUSD) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const spentToday = await Transaction.sum('amountInUSD', {
    where: {
      userId,
      type: { [Op.in]: OUTGOING_TYPES },
      status: 'success',
      createdAt: { [Op.gte]: since },
    },
  });

  const total = (spentToday || 0) + amountInUSD;

  if (total > DAILY_LIMIT_USD) {
    throw new ApiError(
      403,
      `Daily transaction limit exceeded. You can send/withdraw up to $${DAILY_LIMIT_USD} (USD equivalent) per 24 hours. Already used: $${(spentToday || 0).toFixed(2)}.`
    );
  }
};


const detectSuspiciousActivity = async (userId, amountInUSD) => {
  if (amountInUSD < SUSPICIOUS_AMOUNT_USD) return;

  const since = new Date(Date.now() - SUSPICIOUS_WINDOW_MINUTES * 60 * 1000);

  const recentHighValueCount = await Transaction.count({
    where: {
      userId,
      type: { [Op.in]: OUTGOING_TYPES },
      status: 'success',
      amountInUSD: { [Op.gte]: SUSPICIOUS_AMOUNT_USD },
      createdAt: { [Op.gte]: since },
    },
  });

  if (recentHighValueCount + 1 >= SUSPICIOUS_COUNT) {
    await User.update({ isFrozen: true }, { where: { id: userId } });
    throw new ApiError(
      403,
      'Suspicious activity detected (multiple high-value transactions in a short time). ' +
        'Your account has been temporarily frozen for review. Please contact support.'
    );
  }
};

const runPreTransactionChecks = async (userId, amountInUSD) => {
  await detectSuspiciousActivity(userId, amountInUSD);
  await enforceDailyLimit(userId, amountInUSD);
};

module.exports = {
  runPreTransactionChecks,
  enforceDailyLimit,
  detectSuspiciousActivity,
  DAILY_LIMIT_USD,
};
