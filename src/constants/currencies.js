// Static exchange rate table, base = USD.
// In a production system this would be replaced by a call to a live
// FX rate provider (e.g. exchangerate-api.com, openexchangerates.org)
// and cached with a TTL. It's kept static + swappable here so the
// service layer doesn't care where the numbers come from.
module.exports = {
  BASE_CURRENCY: 'USD',
  SUPPORTED_CURRENCIES: ['USD', 'INR', 'EUR', 'GBP', 'JPY'],
  RATES_TO_USD_BASE: {
    USD: 1,
    INR: 83.2,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 156.1,
  },
};
