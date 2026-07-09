const { Transaction } = require('../models');


const getHistory = async (userId, { page = 1, limit = 20, type }) => {
  const where = { userId };
  if (type) where.type = type;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const offset = (pageNum - 1) * limitNum;

  const { rows, count } = await Transaction.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    offset,
    limit: limitNum,
  });

  return {
    transactions: rows,
    pagination: {
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(count / limitNum),
    },
  };
};

module.exports = { getHistory };
