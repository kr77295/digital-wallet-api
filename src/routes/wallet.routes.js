const express = require('express');
const walletController = require('../controllers/wallet.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { transactionLimiter } = require('../middlewares/rateLimiter.middleware');
const {
  amountCurrencyValidation,
  transferValidation,
} = require('../validations/transaction.validation');

const router = express.Router();

router.use(protect); 

router.get('/balance', walletController.getBalance);
router.post(
  '/add-funds',
  transactionLimiter,
  amountCurrencyValidation,
  validate,
  walletController.addFunds
);
router.post(
  '/withdraw',
  transactionLimiter,
  amountCurrencyValidation,
  validate,
  walletController.withdrawFunds
);
router.post(
  '/transfer',
  transactionLimiter,
  transferValidation,
  validate,
  walletController.transferFunds
);

module.exports = router;
