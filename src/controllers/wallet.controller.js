const walletService = require('../services/wallet.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

const getBalance = catchAsync(async (req, res) => {
  const { currency } = req.query; // optional ?currency=EUR to view converted balance
  const result = await walletService.getBalance(req.user.id, currency);
  new ApiResponse(200, result, 'Wallet balance fetched').send(res);
});

const addFunds = catchAsync(async (req, res) => {
  const { amount, currency } = req.body;
  const { wallet, transaction } = await walletService.addFunds(req.user.id, amount, currency);
  new ApiResponse(
    200,
    { balance: wallet.balance, currency: wallet.currency, transaction },
    'Funds added successfully'
  ).send(res);
});

const withdrawFunds = catchAsync(async (req, res) => {
  const { amount, currency } = req.body;
  const { wallet, transaction } = await walletService.withdrawFunds(
    req.user.id,
    amount,
    currency
  );
  new ApiResponse(
    200,
    { balance: wallet.balance, currency: wallet.currency, transaction },
    'Withdrawal successful'
  ).send(res);
});

const transferFunds = catchAsync(async (req, res) => {
  const { amount, currency, recipientEmail } = req.body;
  const { senderWallet, transaction } = await walletService.transferFunds(
    req.user.id,
    recipientEmail,
    amount,
    currency
  );
  new ApiResponse(
    200,
    { balance: senderWallet.balance, currency: senderWallet.currency, transaction },
    'Transfer successful'
  ).send(res);
});

module.exports = { getBalance, addFunds, withdrawFunds, transferFunds };
