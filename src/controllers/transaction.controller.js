const transactionService = require('../services/transaction.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

const getHistory = catchAsync(async (req, res) => {
  const { page, limit, type } = req.query;
  const result = await transactionService.getHistory(req.user.id, { page, limit, type });
  new ApiResponse(200, result, 'Transaction history fetched').send(res);
});

module.exports = { getHistory };
