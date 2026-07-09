const { body } = require('express-validator');
const { SUPPORTED_CURRENCIES } = require('../constants/currencies');

const amountCurrencyValidation = [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a number greater than 0'),
  body('currency')
    .optional()
    .isIn(SUPPORTED_CURRENCIES)
    .withMessage(`Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`),
];

const transferValidation = [
  ...amountCurrencyValidation,
  body('recipientEmail').isEmail().withMessage('A valid recipient email is required'),
];

module.exports = { amountCurrencyValidation, transferValidation };
