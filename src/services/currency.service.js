const ApiError = require('../utils/apiError');
const { RATES_TO_USD_BASE, SUPPORTED_CURRENCIES } = require('../constants/currencies');


const assertSupported = (currency) => {
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    throw new ApiError(400, `Unsupported currency: ${currency}`);
  }
};

const convert = (amount, from, to) => {
  assertSupported(from);
  assertSupported(to);

  if (from === to) return Number(amount.toFixed(2));

  const amountInUSD = amount / RATES_TO_USD_BASE[from];
  const converted = amountInUSD * RATES_TO_USD_BASE[to];
  return Number(converted.toFixed(2));
};

const toUSD = (amount, from) => convert(amount, from, 'USD');

module.exports = { convert, toUSD, assertSupported };
